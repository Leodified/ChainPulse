"""
ChainPulse Backend - Simulation ORM Models
Scenario, ScenarioSnapshot, RecoveryStrategy.
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Scenario(Base):
    __tablename__ = "scenarios"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(
        String(50), default="tenant-acme-corp", nullable=False, index=True
    )
    disruption_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("disruption_events.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    time_horizon_days: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    status: Mapped[str] = mapped_column(String(50), default="COMPLETED")
    assumptions: Mapped[Optional[str]] = mapped_column(Text)

    disruption: Mapped["DisruptionEvent"] = relationship(
        "DisruptionEvent", back_populates="scenarios"
    )
    snapshots: Mapped[List["ScenarioSnapshot"]] = relationship(
        "ScenarioSnapshot", back_populates="scenario", cascade="all, delete-orphan"
    )
    strategies: Mapped[List["RecoveryStrategy"]] = relationship(
        "RecoveryStrategy", back_populates="scenario", cascade="all, delete-orphan"
    )


class ScenarioSnapshot(Base):
    __tablename__ = "scenario_snapshots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scenario_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("scenarios.id"), nullable=False
    )
    day: Mapped[int] = mapped_column(Integer, nullable=False)
    inventory_level_percent: Mapped[float] = mapped_column(Float, nullable=False)
    production_capacity_percent: Mapped[float] = mapped_column(Float, nullable=False)
    orders_at_risk_count: Mapped[int] = mapped_column(Integer, nullable=False)
    financial_exposure_usd: Mapped[float] = mapped_column(Float, nullable=False)
    co2_impact_kg: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False)

    scenario: Mapped["Scenario"] = relationship(
        "Scenario", back_populates="snapshots"
    )


class RecoveryStrategy(Base):
    __tablename__ = "recovery_strategies"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(
        String(50), default="tenant-acme-corp", nullable=False, index=True
    )
    scenario_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("scenarios.id"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    strategy_type: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    estimated_recovery_days: Mapped[int] = mapped_column(Integer, nullable=False)
    estimated_cost_usd: Mapped[float] = mapped_column(Float, nullable=False)
    operational_risk_level: Mapped[str] = mapped_column(String(20), nullable=False)
    co2_impact_kg: Mapped[float] = mapped_column(Float, nullable=False)
    feasibility_score: Mapped[float] = mapped_column(Float, nullable=False)
    assumptions: Mapped[Optional[str]] = mapped_column(Text)
    trade_offs: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), default="PROPOSED")
    approved_by: Mapped[Optional[str]] = mapped_column(String(200))
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    scenario: Mapped["Scenario"] = relationship(
        "Scenario", back_populates="strategies"
    )


