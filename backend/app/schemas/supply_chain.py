"""
ChainPulse Backend - Supply Chain Pydantic Schemas
"""
from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SupplierBase(BaseModel):
    id: str
    name: str
    tier: int
    country: str
    city: str
    lat: float
    lng: float
    capacity_percent: float
    status: str
    category: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    annual_revenue_usd: Optional[float] = None
    on_time_delivery_rate: Optional[float] = None
    quality_score: Optional[float] = None
    risk_score: Optional[float] = None
    is_affected: bool = False

    model_config = ConfigDict(from_attributes=True)


class SupplierOut(SupplierBase):
    pass


class SupplierRelationshipOut(BaseModel):
    id: int
    parent_supplier_id: str
    child_supplier_id: str
    relationship_type: str
    criticality: str

    model_config = ConfigDict(from_attributes=True)


class MaterialOut(BaseModel):
    id: str
    name: str
    category: str
    unit: str
    lead_time_days: int
    criticality: str
    supplier_id: str
    unit_cost_usd: float

    model_config = ConfigDict(from_attributes=True)


class FactoryOut(BaseModel):
    id: str
    name: str
    country: str
    city: str
    lat: float
    lng: float
    capacity_units_per_day: int
    current_utilization_percent: float
    status: str
    primary_material_id: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class FactoryMaterialOut(BaseModel):
    factory_id: str
    material_id: str
    daily_consumption_units: float
    safety_stock_days: int
    current_stock_units: float

    model_config = ConfigDict(from_attributes=True)


class ProductOut(BaseModel):
    id: str
    name: str
    sku: str
    category: str
    unit_price_usd: float
    factory_id: str

    model_config = ConfigDict(from_attributes=True)


class CustomerOut(BaseModel):
    id: str
    name: str
    country: str
    city: str
    tier: int
    annual_order_value_usd: float
    account_manager: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    id: str
    customer_id: str
    product_id: str
    quantity: int
    unit_price_usd: float
    status: str
    due_date: date
    created_at: Optional[datetime] = None
    exposure_risk: str
    total_value_usd: float = Field(default=0.0)

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_orm_with_total(cls, order) -> "OrderOut":
        obj = cls.model_validate(order)
        obj.total_value_usd = order.quantity * order.unit_price_usd
        return obj


class RouteOut(BaseModel):
    id: str
    origin_country: str
    destination_country: str
    transport_mode: str
    distance_km: float
    transit_days: int
    cost_per_unit_usd: float
    co2_kg_per_unit: float
    is_disrupted: bool

    model_config = ConfigDict(from_attributes=True)


class ShipmentOut(BaseModel):
    id: str
    order_id: str
    route_id: str
    status: str
    estimated_arrival: Optional[date] = None
    quantity: int
    current_location: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Graph response shapes
# ---------------------------------------------------------------------------

class GraphNode(BaseModel):
    id: str
    label: str
    node_type: str  # supplier | factory | product | customer | material
    status: str
    country: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    tier: Optional[int] = None
    is_affected: bool = False
    metadata: dict = {}


class GraphEdge(BaseModel):
    source: str
    target: str
    edge_type: str
    label: str
    weight: float = 1.0


class SupplyChainGraph(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    total_nodes: int
    total_edges: int
