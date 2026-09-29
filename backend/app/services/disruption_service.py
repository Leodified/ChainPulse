"""
ChainPulse Backend - Disruption Service
Business logic for querying disruptions.
"""
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.disruptions import DisruptionEvent, DisruptionImpact


def get_all_disruptions(
    db: Session,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    category: Optional[str] = None,
    tenant_id: Optional[str] = None,
) -> List[DisruptionEvent]:
    stmt = select(DisruptionEvent)
    if tenant_id:
        stmt = stmt.where(DisruptionEvent.tenant_id == tenant_id)
    if status:
        stmt = stmt.where(DisruptionEvent.status == status.upper())
    if severity:
        stmt = stmt.where(DisruptionEvent.severity == severity.upper())
    if category:
        stmt = stmt.where(DisruptionEvent.category == category.upper())
    return list(db.execute(stmt).scalars().all())


def get_disruption_by_id(db: Session, disruption_id: str) -> Optional[DisruptionEvent]:
    stmt = (
        select(DisruptionEvent)
        .where(DisruptionEvent.id == disruption_id)
        .options(
            selectinload(DisruptionEvent.impacts),
            selectinload(DisruptionEvent.scenarios),
            selectinload(DisruptionEvent.agent_activities),
        )
    )
    return db.execute(stmt).scalar_one_or_none()


def get_disruption_impacts(
    db: Session, disruption_id: str
) -> List[DisruptionImpact]:
    stmt = select(DisruptionImpact).where(
        DisruptionImpact.disruption_id == disruption_id
    )
    return list(db.execute(stmt).scalars().all())
