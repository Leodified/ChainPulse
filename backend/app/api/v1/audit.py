"""
ChainPulse Backend - Audit API
Exposes the immutable audit trail for governance, compliance, and enterprise decision verification.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.audit import AuditEvent
from app.schemas.audit import AuditEventOut

router = APIRouter(prefix="/audit", tags=["Audit"])


@router.get("/events", response_model=List[AuditEventOut])
def list_audit_events(
    limit: int = Query(50, ge=1, le=200),
    tenant_id: Optional[str] = Query("tenant-acme-corp"),
    db: Session = Depends(get_db),
):
    """
    Retrieve immutable audit log events.
    Supports filtering by tenant with chronological descending order.
    """
    query = db.query(AuditEvent)
    if tenant_id:
        query = query.filter(AuditEvent.tenant_id == tenant_id)
    return query.order_by(AuditEvent.created_at.desc(), AuditEvent.id.desc()).limit(limit).all()
