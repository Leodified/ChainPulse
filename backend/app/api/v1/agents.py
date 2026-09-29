"""
ChainPulse Backend - Agents API
Agent activity log for disruption analysis workflows.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.agents import AgentActivity
from app.schemas.agents import AgentActivityLog, AgentActivityOut

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.get("/{disruption_id}/activity", response_model=AgentActivityLog)
def get_agent_activity(disruption_id: str, db: Session = Depends(get_db)):
    """
    Full agent activity log for a disruption.
    Shows all AI agent steps with reasoning, evidence, and confidence scores.
    """
    activities = list(
        db.execute(
            select(AgentActivity)
            .where(AgentActivity.disruption_id == disruption_id)
            .order_by(AgentActivity.started_at)
        ).scalars()
    )

    if not activities:
        raise HTTPException(
            status_code=404, detail="No agent activities found for this disruption"
        )

    activity_outs = [
        AgentActivityOut.from_orm_with_duration(a) for a in activities
    ]

    completed = [a for a in activity_outs if a.status == "COMPLETED"]
    total_duration = sum(
        (a.duration_seconds or 0) for a in activity_outs
    )

    return AgentActivityLog(
        disruption_id=disruption_id,
        total_agents=len(activity_outs),
        completed_agents=len(completed),
        total_duration_seconds=total_duration,
        activities=activity_outs,
    )
