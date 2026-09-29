"""
ChainPulse Backend - Recovery API
Strategy listing and approval endpoints.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_role, verify_tenant_access
from app.database.connection import get_db
from app.schemas.simulations import (
    RecoveryStrategyOut,
    StrategyApprovalRequest,
    StrategyApprovalResponse,
)
from app.services.recovery_service import approve_strategy
from app.services.simulation_service import (
    get_strategies_for_disruption,
    get_strategy_by_id,
)

router = APIRouter(prefix="/recovery", tags=["Recovery"])


@router.get("/{disruption_id}/strategies", response_model=List[RecoveryStrategyOut])
def list_recovery_strategies(disruption_id: str, db: Session = Depends(get_db)):
    """
    All recovery strategies for a disruption, ordered by feasibility score descending.
    """
    strategies = get_strategies_for_disruption(db, disruption_id)
    if not strategies:
        raise HTTPException(
            status_code=404, detail="No recovery strategies found for this disruption"
        )
    return strategies


@router.post("/{strategy_id}/approve", response_model=StrategyApprovalResponse)
def approve_recovery_strategy(
    strategy_id: str,
    request_body: StrategyApprovalRequest,
    request: Request,
    current_user: dict = Depends(require_role(["OPERATIONS_DIRECTOR", "VP_SUPPLY_CHAIN", "SUPPLY_CHAIN_PLANNER"])),
    db: Session = Depends(get_db),
):
    """
    Approve a recovery strategy.
    Requires authenticated user with OPERATIONS_DIRECTOR or SUPPLY_CHAIN_PLANNER role.
    Enforces company/tenant isolation and records an immutable audit log entry.
    """
    strategy = get_strategy_by_id(db, strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    if strategy.status == "APPROVED":
        raise HTTPException(status_code=409, detail="Strategy is already approved")

    # Enforce tenant isolation
    verify_tenant_access(current_user, strategy.tenant_id)

    ip_address = request.client.host if request.client else "0.0.0.0"
    return approve_strategy(db, strategy, request_body, ip_address=ip_address)
