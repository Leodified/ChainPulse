"""
ChainPulse Backend - Authentication API
Login, Demo Persona Token, and Current User profile endpoints.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.database.connection import get_db
from app.models.users import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: str
    password: str


class UserProfileOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    tenant_id: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileOut


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email and password and receive a scoped JWT access token."""
    user = db.execute(
        select(User).where(User.email == payload.email, User.is_active == True)
    ).scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
        tenant_id=user.tenant_id,
        full_name=user.full_name,
    )

    return LoginResponse(
        access_token=token,
        user=UserProfileOut(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            tenant_id=user.tenant_id,
        ),
    )


@router.get("/demo-token", response_model=LoginResponse)
def get_demo_token(
    role: str = Query("OPERATIONS_DIRECTOR", description="Role to assume: OPERATIONS_DIRECTOR, SUPPLY_CHAIN_PLANNER, VIEWER"),
    db: Session = Depends(get_db),
):
    """
    Convenience endpoint for hackathon demo to switch roles and generate valid signed JWT tokens.
    """
    valid_roles = {"OPERATIONS_DIRECTOR", "SUPPLY_CHAIN_PLANNER", "VIEWER"}
    if role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid demo role. Allowed: {sorted(valid_roles)}",
        )

    user = db.execute(
        select(User).where(User.role == role, User.is_active == True)
    ).scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail=f"No user found for role {role}")

    token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
        tenant_id=user.tenant_id,
        full_name=user.full_name,
    )

    return LoginResponse(
        access_token=token,
        user=UserProfileOut(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            tenant_id=user.tenant_id,
        ),
    )


@router.get("/me", response_model=UserProfileOut)
def get_me(current_user: dict = Depends(get_current_user)):
    """Returns the authenticated user profile with role and tenant scoping."""
    return UserProfileOut(
        id=current_user.get("sub", ""),
        email=current_user.get("email", ""),
        full_name=current_user.get("name", ""),
        role=current_user.get("role", "VIEWER"),
        tenant_id=current_user.get("tenant_id", "tenant-acme-corp"),
    )
