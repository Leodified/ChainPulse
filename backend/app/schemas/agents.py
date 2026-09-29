"""
ChainPulse Backend - Agent Activity Pydantic Schemas
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class AgentActivityOut(BaseModel):
    id: int
    disruption_id: str
    agent_name: str
    agent_role: str
    task_description: str
    status: str
    reasoning_summary: Optional[str] = None
    evidence_used: Optional[str] = None
    output_summary: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    confidence_score: Optional[float] = None
    duration_seconds: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_with_duration(cls, activity) -> "AgentActivityOut":
        obj = cls.model_validate(activity)
        if activity.started_at and activity.completed_at:
            delta = activity.completed_at - activity.started_at
            obj.duration_seconds = delta.total_seconds()
        return obj


class AgentActivityLog(BaseModel):
    disruption_id: str
    total_agents: int
    completed_agents: int
    total_duration_seconds: float
    activities: List[AgentActivityOut]
