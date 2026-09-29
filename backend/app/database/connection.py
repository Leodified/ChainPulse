"""
ChainPulse Backend - Database Connection
SQLAlchemy 2.0 engine and session factory.
Falls back to SQLite for local development without Docker.
"""
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def _build_engine():
    """Build the SQLAlchemy engine with appropriate settings per backend."""
    settings = get_settings()
    url = settings.DATABASE_URL

    if settings.is_sqlite:
        # SQLite needs check_same_thread=False for FastAPI's thread model
        engine = create_engine(
            url,
            connect_args={"check_same_thread": False},
            echo=(settings.ENVIRONMENT == "development"),
        )

        # Enable WAL mode and foreign keys for SQLite
        @event.listens_for(engine, "connect")
        def set_sqlite_pragmas(dbapi_conn, _conn_record):
            cursor = dbapi_conn.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    else:
        engine = create_engine(
            url,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            echo=(settings.ENVIRONMENT == "development"),
        )

    logger.info(
        "database_engine_created",
        backend="sqlite" if settings.is_sqlite else "postgresql",
        environment=settings.ENVIRONMENT,
    )
    return engine


engine = _build_engine()

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a database session.
    Ensures the session is always closed, even on exceptions.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
