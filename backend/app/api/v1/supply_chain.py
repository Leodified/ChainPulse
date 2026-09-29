"""
ChainPulse Backend - Supply Chain API
Suppliers, graph, and affected node endpoints.
"""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.supply_chain import (
    Customer,
    Factory,
    FactoryMaterial,
    Material,
    Order,
    Product,
    Route,
    Shipment,
    Supplier,
    SupplierRelationship,
)
from app.schemas.supply_chain import (
    CustomerOut,
    FactoryOut,
    GraphEdge,
    GraphNode,
    MaterialOut,
    RouteOut,
    ShipmentOut,
    SupplierOut,
    SupplyChainGraph,
)

router = APIRouter(prefix="/supply-chain", tags=["Supply Chain"])


@router.get("/suppliers", response_model=List[SupplierOut])
def list_suppliers(db: Session = Depends(get_db)):
    """All suppliers with current status."""
    return list(db.execute(select(Supplier)).scalars())


@router.get("/materials", response_model=List[MaterialOut])
def list_materials(db: Session = Depends(get_db)):
    return list(db.execute(select(Material)).scalars())


@router.get("/factories", response_model=List[FactoryOut])
def list_factories(db: Session = Depends(get_db)):
    return list(db.execute(select(Factory)).scalars())


@router.get("/products")
def list_products(db: Session = Depends(get_db)):
    from app.schemas.supply_chain import ProductOut
    products = list(db.execute(select(Product)).scalars())
    return [ProductOut.model_validate(p) for p in products]


@router.get("/customers", response_model=List[CustomerOut])
def list_customers(db: Session = Depends(get_db)):
    return list(db.execute(select(Customer)).scalars())


@router.get("/orders", response_model=List[dict])
def list_orders(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    stmt = select(Order)
    if status:
        stmt = stmt.where(Order.status == status.upper())
    orders = list(db.execute(stmt).scalars())
    return [
        {
            "id": o.id,
            "customer_id": o.customer_id,
            "product_id": o.product_id,
            "quantity": o.quantity,
            "unit_price_usd": o.unit_price_usd,
            "total_value_usd": round(o.quantity * o.unit_price_usd, 2),
            "status": o.status,
            "due_date": str(o.due_date),
            "exposure_risk": o.exposure_risk,
        }
        for o in orders
    ]


@router.get("/routes", response_model=List[RouteOut])
def list_routes(db: Session = Depends(get_db)):
    return list(db.execute(select(Route)).scalars())


@router.get("/shipments", response_model=List[ShipmentOut])
def list_shipments(db: Session = Depends(get_db)):
    return list(db.execute(select(Shipment)).scalars())


@router.get("/affected")
def get_affected_nodes(
    disruption_id: str = Query(..., description="Disruption ID to filter by"),
    db: Session = Depends(get_db),
):
    """Return all supply chain nodes affected by a given disruption."""
    affected_suppliers = list(
        db.execute(select(Supplier).where(Supplier.is_affected == True)).scalars()
    )
    affected_factories = list(
        db.execute(
            select(Factory).where(Factory.status.in_(["DISRUPTED", "AFFECTED", "CONSTRAINED"]))
        ).scalars()
    )
    return {
        "disruption_id": disruption_id,
        "affected_suppliers": [SupplierOut.model_validate(s) for s in affected_suppliers],
        "affected_factories": [FactoryOut.model_validate(f) for f in affected_factories],
        "affected_supplier_count": len(affected_suppliers),
        "affected_factory_count": len(affected_factories),
    }


@router.get("/graph", response_model=SupplyChainGraph)
def get_supply_chain_graph(db: Session = Depends(get_db)):
    """
    Full supply chain graph with all nodes and edges.
    Suitable for network visualization (D3, Cytoscape, etc.)
    """
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []

    # Suppliers
    suppliers = list(db.execute(select(Supplier)).scalars())
    for s in suppliers:
        nodes.append(
            GraphNode(
                id=s.id,
                label=s.name,
                node_type="supplier",
                status=s.status,
                country=s.country,
                lat=s.lat,
                lng=s.lng,
                tier=s.tier,
                is_affected=s.is_affected,
                metadata={
                    "category": s.category,
                    "capacity_percent": s.capacity_percent,
                    "risk_score": s.risk_score,
                },
            )
        )

    # Supplier relationships
    rels = list(db.execute(select(SupplierRelationship)).scalars())
    for r in rels:
        edges.append(
            GraphEdge(
                source=r.parent_supplier_id,
                target=r.child_supplier_id,
                edge_type=r.relationship_type,
                label=r.relationship_type,
                weight=1.0 if r.criticality == "HIGH" else 0.5,
            )
        )

    # Materials
    materials = list(db.execute(select(Material)).scalars())
    for m in materials:
        nodes.append(
            GraphNode(
                id=m.id,
                label=m.name,
                node_type="material",
                status="ACTIVE",
                metadata={"criticality": m.criticality, "lead_time_days": m.lead_time_days},
            )
        )
        edges.append(
            GraphEdge(
                source=m.supplier_id,
                target=m.id,
                edge_type="SUPPLIES",
                label="Supplies",
                weight=1.5 if m.criticality == "CRITICAL" else 1.0,
            )
        )

    # Factories
    factories = list(db.execute(select(Factory)).scalars())
    for f in factories:
        nodes.append(
            GraphNode(
                id=f.id,
                label=f.name,
                node_type="factory",
                status=f.status,
                country=f.country,
                lat=f.lat,
                lng=f.lng,
                metadata={"utilization": f.current_utilization_percent},
            )
        )
        if f.primary_material_id:
            edges.append(
                GraphEdge(
                    source=f.primary_material_id,
                    target=f.id,
                    edge_type="FEEDS_INTO",
                    label="Feeds Into",
                )
            )

    # Products
    products = list(db.execute(select(Product)).scalars())
    for p in products:
        nodes.append(
            GraphNode(
                id=p.id,
                label=p.name,
                node_type="product",
                status="ACTIVE",
                metadata={"sku": p.sku, "unit_price_usd": p.unit_price_usd},
            )
        )
        edges.append(
            GraphEdge(
                source=p.factory_id,
                target=p.id,
                edge_type="PRODUCES",
                label="Produces",
            )
        )

    # Customers
    customers = list(db.execute(select(Customer)).scalars())
    for c in customers:
        nodes.append(
            GraphNode(
                id=c.id,
                label=c.name,
                node_type="customer",
                status="ACTIVE",
                country=c.country,
                tier=c.tier,
                metadata={"annual_order_value_usd": c.annual_order_value_usd},
            )
        )

    # Orders as edges (product → customer)
    orders = list(db.execute(select(Order)).scalars())
    seen_prod_cust = set()
    for o in orders:
        key = (o.product_id, o.customer_id)
        if key not in seen_prod_cust:
            edges.append(
                GraphEdge(
                    source=o.product_id,
                    target=o.customer_id,
                    edge_type="ORDERED_BY",
                    label=f"Order ({o.status})",
                    weight=2.0 if o.exposure_risk == "HIGH" else 1.0,
                )
            )
            seen_prod_cust.add(key)

    return SupplyChainGraph(
        nodes=nodes,
        edges=edges,
        total_nodes=len(nodes),
        total_edges=len(edges),
    )
