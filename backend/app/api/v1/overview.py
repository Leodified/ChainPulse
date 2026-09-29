"""
ChainPulse Backend - Overview API
Executive KPI summary endpoint.
"""
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from app.database.connection import get_db
from app.models.disruptions import DisruptionEvent
from app.models.supply_chain import Order, Supplier

router = APIRouter(prefix="/overview", tags=["Overview"])


@router.get("")
@router.get("/summary")
def get_executive_summary(db: Session = Depends(get_db)):
    """
    Executive KPI dashboard summary.
    All figures are deterministic from seeded demo data.
    """
    active_disruptions = db.execute(
        select(func.count(DisruptionEvent.id)).where(DisruptionEvent.is_active == True)
    ).scalar_one()

    total_orders = db.execute(select(func.count(Order.id))).scalar_one()

    at_risk_orders = db.execute(
        select(func.count(Order.id)).where(Order.status.in_(["AT_RISK", "DELAYED"]))
    ).scalar_one()

    total_order_value = db.execute(
        select(func.sum(Order.quantity * Order.unit_price_usd))
    ).scalar_one() or 0.0

    at_risk_value = db.execute(
        select(func.sum(Order.quantity * Order.unit_price_usd)).where(
            Order.status.in_(["AT_RISK", "DELAYED"])
        )
    ).scalar_one() or 0.0

    affected_suppliers = db.execute(
        select(func.count(Supplier.id)).where(Supplier.is_affected == True)
    ).scalar_one()

    total_suppliers = db.execute(select(func.count(Supplier.id))).scalar_one()

    return {
        "success": True,
        "data": {
            "active_disruptions": active_disruptions,
            "total_orders": total_orders,
            "at_risk_orders": at_risk_orders,
            "on_track_orders": total_orders - at_risk_orders,
            "total_order_value_usd": round(total_order_value, 2),
            "at_risk_order_value_usd": round(at_risk_value, 2),
            "max_financial_exposure_usd": 28_300_000,
            "affected_suppliers": affected_suppliers,
            "total_suppliers": total_suppliers,
            "primary_disruption": {
                "id": "DISR-SG-2026-001",
                "title": "Singapore Port MPA Terminal Congestion",
                "subtitle": "Typhoon Aftermath",
                "severity": "HIGH",
                "company_exposure_level": "HIGH",
                "estimated_duration_days": 21,
            },
            "inventory_health": {
                "chip_runway_days": 7,
                "pcb_runway_days": 9,
                "connector_runway_days": 14,
                "overall_status": "CRITICAL",
            },
            "recovery_recommendation": "Strategy B (Air Freight) + Strategy A (Alternate Supplier) hybrid recommended. Decision required within 4 hours.",
        },
    }
