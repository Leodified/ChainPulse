"""
ChainPulse Backend - Simulation Pydantic Schemas
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class ScenarioSnapshotOut(BaseModel):
    id: int
    scenario_id: str
    day: int
    inventory_level_percent: float
    production_capacity_percent: float
    orders_at_risk_count: int
    financial_exposure_usd: float
    co2_impact_kg: float
    risk_level: str

    model_config = ConfigDict(from_attributes=True)


class RecoveryStrategyOut(BaseModel):
    id: str
    scenario_id: str
    name: str
    strategy_type: str
    description: str
    estimated_recovery_days: int
    estimated_cost_usd: float
    operational_risk_level: str
    co2_impact_kg: float
    feasibility_score: float
    assumptions: Optional[str] = None
    trade_offs: Optional[str] = None
    status: str
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ScenarioOut(BaseModel):
    id: str
    disruption_id: str
    name: str
    time_horizon_days: int
    created_at: Optional[datetime] = None
    status: str
    assumptions: Optional[str] = None
    snapshots: List[ScenarioSnapshotOut] = []
    strategies: List[RecoveryStrategyOut] = []

    model_config = ConfigDict(from_attributes=True)


class StrategyApprovalRequest(BaseModel):
    approved_by: str
    notes: Optional[str] = None


class StrategyApprovalResponse(BaseModel):
    strategy_id: str
    status: str
    approved_by: str
    approved_at: datetime
    audit_event_id: int
