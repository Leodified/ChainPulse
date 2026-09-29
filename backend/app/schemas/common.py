"""
ChainPulse Backend - Common Pydantic Schemas
Shared response wrappers and error models.
"""
from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standard success envelope for all API responses."""
    success: bool = True
    data: T
    message: Optional[str] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated list response."""
    success: bool = True
    data: List[T]
    total: int
    page: int = 1
    page_size: int = 50


class ErrorResponse(BaseModel):
    """Standard error response - never exposes stack traces."""
    success: bool = False
    error: str
    code: str
    request_id: Optional[str] = None


class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str
    environment: str
