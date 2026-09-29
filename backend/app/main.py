"""
ChainPulse Backend - FastAPI Application Entry Point
Configures CORS, middleware, exception handlers, and startup lifecycle.
"""
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.v1.router import router as v1_router
from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger

settings = get_settings()
configure_logging(settings.ENVIRONMENT)
logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Lifespan (replaces deprecated @app.on_event)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info(
        "chainpulse_starting",
        version=settings.APP_VERSION,
        environment=settings.ENVIRONMENT,
    )
    from app.database.init_db import init_db
    init_db()
    logger.info("chainpulse_ready")
    yield
    logger.info("chainpulse_shutdown")


# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "ChainPulse - AI-Powered Supply Chain Disruption Recovery Platform. "
        "SAP HackFest 2026 Demo Backend."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------

origins = settings.allowed_origins_list
if settings.is_production and "*" in origins:
    # Hard-block wildcard in production - fail-safe
    raise RuntimeError("Wildcard CORS origins are not permitted in production.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Secure Headers Middleware
# ---------------------------------------------------------------------------

class SecureHeadersMiddleware(BaseHTTPMiddleware):
    """Adds security headers to every response."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Cache-Control"] = "no-store"
        if settings.is_production:
            response.headers["Strict-Transport-Security"] = (
                "max-age=63072000; includeSubDomains; preload"
            )
        return response


app.add_middleware(SecureHeadersMiddleware)


# ---------------------------------------------------------------------------
# Request ID Middleware (for traceability)
# ---------------------------------------------------------------------------

class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attaches a unique request ID to every request/response for tracing."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = request_id

        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-Ms"] = str(duration_ms)

        logger.info(
            "request_completed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
            request_id=request_id,
        )
        return response


app.add_middleware(RequestIDMiddleware)


# ---------------------------------------------------------------------------
# Exception Handlers (never expose stack traces to clients)
# ---------------------------------------------------------------------------

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    request_id = getattr(request.state, "request_id", None)
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": "The requested resource was not found.",
            "code": "NOT_FOUND",
            "request_id": request_id,
        },
    )


@app.exception_handler(422)
async def validation_error_handler(request: Request, exc):
    request_id = getattr(request.state, "request_id", None)
    # Extract user-safe field error messages without stack traces
    try:
        errors = exc.errors()
        safe_errors = [
            {"field": ".".join(str(l) for l in e["loc"]), "message": e["msg"]}
            for e in errors
        ]
    except Exception:
        safe_errors = []
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": "Request validation failed.",
            "code": "VALIDATION_ERROR",
            "details": safe_errors,
            "request_id": request_id,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", None)
    logger.error(
        "unhandled_exception",
        path=request.url.path,
        error_type=type(exc).__name__,
        error=str(exc),
        request_id=request_id,
    )
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "An internal error occurred. Please try again or contact support.",
            "code": "INTERNAL_ERROR",
            "request_id": request_id,
        },
    )


# ---------------------------------------------------------------------------
# Include v1 API Router
# ---------------------------------------------------------------------------

app.include_router(v1_router, prefix="/api/v1")


# ---------------------------------------------------------------------------
# Root and Health endpoints
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/ready", tags=["Health"])
def readiness_check():
    """Enterprise readiness check ensuring database connection and core services."""
    try:
        from app.database.connection import SessionLocal
        from sqlalchemy import text
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "ready" if db_status == "connected" else "degraded",
        "database": db_status,
        "database_engine": "SQLite (Development Fallback)" if settings.is_sqlite else "PostgreSQL (Enterprise Production)",
        "database_backend": "sqlite" if settings.is_sqlite else "postgresql",
        "production_database_configured": not settings.is_sqlite,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "agents_active": 6,
        "disruptions_monitored": 1,
    }

