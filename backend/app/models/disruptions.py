"""
ChainPulse Backend - Disruption ORM Models
DisruptionEvent and DisruptionImpact.
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class DisruptionEvent(Base):
    __tablename__ = "disruption_events"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(
        String(50), default="tenant-acme-corp", nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE")
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location_name: Mapped[str] = mapped_column(String(200), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    lat: Mapped[float] = mapped_column(Float, nullable=False)
    lng: Mapped[float] = mapped_column(Float, nullable=False)
    affected_radius_km: Mapped[Optional[float]] = mapped_column(Float)
    source: Mapped[Optional[str]] = mapped_column(String(200))
    source_url: Mapped[Optional[str]] = mapped_column(String(500))
    detected_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    estimated_duration_days: Mapped[Optional[int]] = mapped_column(Integer)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float)
    company_exposure_level: Mapped[str] = mapped_column(String(20), default="LOW")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    impacts: Mapped[List["DisruptionImpact"]] = relationship(
        "DisruptionImpact", back_populates="disruption", cascade="all, delete-orphan"
    )
    scenarios: Mapped[List["Scenario"]] = relationship(
        "Scenario", back_populates="disruption", cascade="all, delete-orphan"
    )
    agent_activities: Mapped[List["AgentActivity"]] = relationship(
        "AgentActivity", back_populates="disruption", cascade="all, delete-orphan"
    )


class DisruptionImpact(Base):
    __tablename__ = "disruption_impacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    disruption_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("disruption_events.id"), nullable=False
    )
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(50), nullable=False)
    impact_level: Mapped[str] = mapped_column(String(20), nullable=False)
    impact_description: Mapped[Optional[str]] = mapped_column(Text)
    financial_impact_usd: Mapped[Optional[float]] = mapped_column(Float)

    disruption: Mapped["DisruptionEvent"] = relationship(
        "DisruptionEvent", back_populates="impacts"
    )


