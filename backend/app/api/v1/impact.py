"""
ChainPulse Backend - Impact API
Full impact analysis for a disruption.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.disruptions import ImpactTraceResponse
from app.services.disruption_service import get_disruption_impacts
from app.services.impact_service import build_impact_trace

router = APIRouter(prefix="/impact", tags=["Impact"])


@router.get("/{disruption_id}")
def get_full_impact(disruption_id: str, db: Session = Depends(get_db)):
    """
    Full impact analysis: trace graph + aggregated impact summary.
    """
    trace = build_impact_trace(db, disruption_id)
    if not trace:
        raise HTTPException(status_code=404, detail="Disruption not found")

    impacts = get_disruption_impacts(db, disruption_id)

    impact_by_entity_type: dict = {}
    for imp in impacts:
        t = imp.entity_type
        if t not in impact_by_entity_type:
            impact_by_entity_type[t] = {"count": 0, "total_financial_usd": 0.0}
        impact_by_entity_type[t]["count"] += 1
        impact_by_entity_type[t]["total_financial_usd"] += imp.financial_impact_usd or 0

    critical_impacts = [i for i in impacts if i.impact_level == "CRITICAL"]
    high_impacts = [i for i in impacts if i.impact_level == "HIGH"]

    return {
        "disruption_id": disruption_id,
        "disruption_title": trace.disruption_title,
        "summary": {
            "total_financial_impact_usd": trace.total_financial_impact_usd,
            "max_exposure_usd": 28_300_000,
            "affected_node_count": trace.affected_node_count,
            "critical_impacts": len(critical_impacts),
            "high_impacts": len(high_impacts),
            "impact_by_entity_type": impact_by_entity_type,
            "critical_paths": trace.critical_paths,
        },
        "trace": {
            "nodes": [n.model_dump() for n in trace.nodes],
            "edges": [e.model_dump() for e in trace.edges],
        },
        "impact_records": [
            {
                "id": i.id,
                "entity_type": i.entity_type,
                "entity_id": i.entity_id,
                "impact_level": i.impact_level,
                "impact_description": i.impact_description,
                "financial_impact_usd": i.financial_impact_usd,
            }
            for i in impacts
        ],
    }
