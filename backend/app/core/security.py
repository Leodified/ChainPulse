"""
ChainPulse Backend - Security & Authentication Utilities
JWT creation/verification, PBKDF2 password hashing, RBAC and Tenant Isolation dependencies.
"""
from datetime import datetime, timedelta, timezone
import hashlib
import secrets
from typing import Callable, List, Optional

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import get_settings

security_scheme = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Password Hashing (PBKDF2-HMAC-SHA256 - Secure & zero external dependency bugs)
# ---------------------------------------------------------------------------

def hash_password(plain: str) -> str:
    """Return secure salt + PBKDF2-HMAC-SHA256 hash."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
    return f"{salt}:{key}"


def verify_password(plain: str, stored: str) -> bool:
    """Verify plaintext password against stored salt:hash."""
    try:
        salt, key = stored.split(":")
        check = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()
        return secrets.compare_digest(key, check)
    except Exception:
        return False


# ---------------------------------------------------------------------------
# JWT Token Generation & Verification
# ---------------------------------------------------------------------------

def create_access_token(
    user_id: str,
    email: str,
    role: str,
    tenant_id: str,
    full_name: str = "",
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT access token embedding identity, role, and tenant scoping."""
    settings = get_settings()
    expire_minutes = expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "tenant_id": tenant_id,
        "name": full_name,
        "iat": now,
        "exp": now + expire_minutes,
        "app": settings.APP_NAME,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT. Returns payload dict or None on failure."""
    settings = get_settings()
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


# ---------------------------------------------------------------------------
# FastAPI Auth Dependencies
# ---------------------------------------------------------------------------

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
) -> dict:
    """
    Validates the Bearer token and returns the user claims dict.
    Raises HTTP 401 if missing, invalid, or expired.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
) -> Optional[dict]:
    """Returns user claims if a valid token is provided, None otherwise (for public read endpoints)."""
    if not credentials or not credentials.credentials:
        return None
    return decode_access_token(credentials.credentials)


def require_role(allowed_roles: List[str]) -> Callable:
    """Factory dependency that restricts access to users with specified roles."""
    def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role", "VIEWER")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role in {allowed_roles}, but user has role '{user_role}'.",
            )
        return current_user
    return role_checker


def verify_tenant_access(current_user: dict, resource_tenant_id: str) -> None:
    """
    Enforces strict tenant isolation.
    Company A must never be able to access or mutate Company B's data.
    """
    user_tenant = current_user.get("tenant_id")
    if user_tenant != resource_tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cross-tenant access violation. You do not have permission to access resources belonging to another company.",
        )
