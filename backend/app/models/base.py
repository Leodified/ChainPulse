"""
ChainPulse Backend - SQLAlchemy Declarative Base
All models inherit from this Base so metadata is shared for table creation.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass
