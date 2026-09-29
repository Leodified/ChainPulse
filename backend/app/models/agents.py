"""
ChainPulse Backend - Agent Activity ORM Model
Tracks AI agent workflow execution for each disruption analysis.
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AgentActivity(Base):
    __tablename__ = "agent_activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tenant_id: Mapped[str] = mapped_column(
        String(50), default="tenant-acme-corp", nullable=False, index=True
    )
    disruption_id: Mapped[str] = mapped_column(
        String(50), ForeignKey("disruption_events.id"), nullable=False
    )
    agent_name: Mapped[str] = mapped_column(String(100), nullable=False)
    agent_role: Mapped[str] = mapped_column(String(200), nullable=False)
    task_description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="COMPLETED")
    reasoning_summary: Mapped[Optional[str]] = mapped_column(Text)
    evidence_used: Mapped[Optional[str]] = mapped_column(Text)
    output_summary: Mapped[Optional[str]] = mapped_column(Text)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    confidence_score: Mapped[Optional[float]] = mapped_column(Float)

    disruption: Mapped["DisruptionEvent"] = relationship(
        "DisruptionEvent", back_populates="agent_activities"
    )


