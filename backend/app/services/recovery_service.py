"""
ChainPulse Backend - Recovery Service
Business logic for strategy approval workflow.
"""
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.audit import AuditEvent
from app.models.simulations import RecoveryStrategy
from app.schemas.simulations import StrategyApprovalRequest, StrategyApprovalResponse


def approve_strategy(
    db: Session,
    strategy: RecoveryStrategy,
    request: StrategyApprovalRequest,
    ip_address: str = "0.0.0.0",
) -> StrategyApprovalResponse:
    """
    Approve a recovery strategy and write an immutable audit log entry.
    """
    now = datetime.now(timezone.utc)
    strategy.status = "APPROVED"
    strategy.approved_by = request.approved_by
    strategy.approved_at = now
    db.add(strategy)

    audit = AuditEvent(
        tenant_id=strategy.tenant_id,
        event_type="STRATEGY_APPROVED",
        entity_type="recovery_strategy",
        entity_id=strategy.id,
        user_id=request.approved_by,
        description=f"Recovery strategy '{strategy.name}' approved by {request.approved_by}",
        metadata_json=(
            f'{{"strategy_id": "{strategy.id}", '
            f'"notes": "{request.notes or ""}", '
            f'"feasibility_score": {strategy.feasibility_score}}}'
        ),
        created_at=now,
        ip_address=ip_address,
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)

    return StrategyApprovalResponse(
        strategy_id=strategy.id,
        status="APPROVED",
        approved_by=request.approved_by,
        approved_at=now,
        audit_event_id=audit.id,
    )
