"""
ChainPulse Backend - Disruptions API
List, detail, and impact trace endpoints.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.security import get_optional_current_user, verify_tenant_access
from app.database.connection import get_db
from app.schemas.disruptions import DisruptionEventOut, DisruptionImpactOut, ImpactTraceResponse
from app.services.disruption_service import (
    get_all_disruptions,
    get_disruption_by_id,
    get_disruption_impacts,
)
from app.services.impact_service import build_impact_trace

router = APIRouter(prefix="/disruptions", tags=["Disruptions"])


@router.get("", response_model=List[DisruptionEventOut])
def list_disruptions(
    status: Optional[str] = Query(None, description="Filter by status (ACTIVE, RESOLVED)"),
    severity: Optional[str] = Query(None, description="Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)"),
    category: Optional[str] = Query(None, description="Filter by category (PORT_DISRUPTION, etc.)"),
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """List all disruption events for the caller's tenant with optional filters."""
    tenant_id = current_user.get("tenant_id") if current_user else "tenant-acme-corp"
    return get_all_disruptions(db, status=status, severity=severity, category=category, tenant_id=tenant_id)


@router.get("/{disruption_id}", response_model=DisruptionEventOut)
def get_disruption(
    disruption_id: str,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Get a single disruption event by ID, scoped to user tenant."""
    event = get_disruption_by_id(db, disruption_id)
    if not event:
        raise HTTPException(status_code=404, detail="Disruption not found")
    if current_user:
        verify_tenant_access(current_user, event.tenant_id)
    return event


@router.get("/{disruption_id}/impacts", response_model=List[DisruptionImpactOut])
def get_disruption_impact_list(disruption_id: str, db: Session = Depends(get_db)):
    """Get all impact records for a disruption."""
    return get_disruption_impacts(db, disruption_id)


@router.get("/{disruption_id}/trace-impact", response_model=ImpactTraceResponse)
def trace_impact(
    disruption_id: str,
    current_user: Optional[dict] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Full supply chain impact trace graph.
    Returns all affected nodes and edges:
    disruption → supplier → material → factory → product → customer
    """
    event = get_disruption_by_id(db, disruption_id)
    if not event:
        raise HTTPException(status_code=404, detail="Disruption not found")
    if current_user:
        verify_tenant_access(current_user, event.tenant_id)

    result = build_impact_trace(db, disruption_id)
    if not result:
        raise HTTPException(status_code=404, detail="Disruption not found")
    return result
