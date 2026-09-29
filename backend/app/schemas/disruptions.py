"""
ChainPulse Backend - Disruption Pydantic Schemas
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class DisruptionEventOut(BaseModel):
    id: str
    title: str
    category: str
    severity: str
    status: str
    description: str
    location_name: str
    country: str
    lat: float
    lng: float
    affected_radius_km: Optional[float] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    detected_at: datetime
    estimated_duration_days: Optional[int] = None
    confidence_score: Optional[float] = None
    company_exposure_level: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class DisruptionImpactOut(BaseModel):
    id: int
    disruption_id: str
    entity_type: str
    entity_id: str
    impact_level: str
    impact_description: Optional[str] = None
    financial_impact_usd: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class TraceImpactNode(BaseModel):
    """Single node in the impact trace graph."""
    id: str
    name: str
    node_type: str
    status: str
    impact_level: str
    financial_impact_usd: Optional[float] = None
    country: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    metadata: dict = {}


class TraceImpactEdge(BaseModel):
    source: str
    target: str
    label: str
    impact_propagation: str


class ImpactTraceResponse(BaseModel):
    disruption_id: str
    disruption_title: str
    total_financial_impact_usd: float
    affected_node_count: int
    critical_paths: List[List[str]]
    nodes: List[TraceImpactNode]
    edges: List[TraceImpactEdge]
