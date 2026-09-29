"""
ChainPulse Backend - Sustainability API
ESG and CO2 impact analysis for disruption recovery strategies.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.disruptions import DisruptionEvent
from app.models.simulations import RecoveryStrategy, Scenario
from app.models.supply_chain import Route

router = APIRouter(prefix="/sustainability", tags=["Sustainability"])


@router.get("/{disruption_id}")
def get_sustainability_analysis(disruption_id: str, db: Session = Depends(get_db)):
    """
    ESG and CO2 impact analysis for all recovery strategies.
    Compares carbon footprint of each recovery path vs baseline.
    """
    disruption = db.get(DisruptionEvent, disruption_id)
    if not disruption:
        raise HTTPException(status_code=404, detail="Disruption not found")

    strategies = list(
        db.execute(
            select(RecoveryStrategy)
            .join(Scenario, RecoveryStrategy.scenario_id == Scenario.id)
            .where(Scenario.disruption_id == disruption_id)
        ).scalars()
    )

    disrupted_routes = list(
        db.execute(
            select(Route).where(Route.is_disrupted == True)
        ).scalars()
    )

    # Baseline: normal sea freight CO2 (disrupted routes)
    baseline_co2_per_shipment = sum(r.co2_kg_per_unit for r in disrupted_routes) / max(len(disrupted_routes), 1)

    strategy_sustainability = []
    for strat in strategies:
        co2_vs_baseline_pct = None
        if strat.co2_impact_kg > 0:
            baseline_estimate = 28500.0  # kg for typical month of sea shipments
            co2_vs_baseline_pct = round(
                ((strat.co2_impact_kg - baseline_estimate) / baseline_estimate) * 100, 1
            )

        strategy_sustainability.append({
            "strategy_id": strat.id,
            "strategy_name": strat.name,
            "strategy_type": strat.strategy_type,
            "co2_impact_kg": strat.co2_impact_kg,
            "co2_vs_sea_baseline_pct": co2_vs_baseline_pct,
            "esg_score_impact": _esg_score(strat.id),
            "carbon_offset_cost_usd": round(strat.co2_impact_kg * 0.025, 2),  # $25/tonne
            "sustainability_rating": _sustainability_rating(strat.id),
            "notes": _sustainability_notes(strat.id),
        })

    return {
        "disruption_id": disruption_id,
        "analysis_period": "60-day worst-case horizon",
        "baseline": {
            "normal_sea_freight_co2_kg_month": 28_500,
            "disrupted_routes": len(disrupted_routes),
            "description": "Baseline assumes normal sea freight operations. Port disruption forces mode-shift analysis.",
        },
        "strategy_comparison": strategy_sustainability,
        "recommendation": {
            "lowest_co2": "STRAT-C-REALLOCATION",
            "best_esg_balanced": "STRAT-A-ALT-SUPPLIER",
            "fastest_recovery": "STRAT-B-AIR-FREIGHT",
            "summary": (
                "Strategy C has lowest CO2 (+2%) but highest relationship risk. "
                "Strategy A balances recovery speed with acceptable CO2 increase (+35%). "
                "Strategy B (recommended for speed) carries significant CO2 burden (+340%) "
                "but can be offset at ~$3,565 carbon cost."
            ),
        },
        "scope3_emissions": {
            "category_4_upstream_transport_kg": 74_800,
            "category_9_downstream_transport_kg": 18_200,
            "total_scope3_incremental_kg": 93_000,
            "sbti_alignment": "Partial - emergency response protocol exemption applicable",
        },
    }


def _esg_score(strategy_id: str) -> int:
    scores = {
        "STRAT-A-ALT-SUPPLIER": -3,
        "STRAT-B-AIR-FREIGHT": -12,
        "STRAT-C-REALLOCATION": -4,
    }
    return scores.get(strategy_id, 0)


def _sustainability_rating(strategy_id: str) -> str:
    ratings = {
        "STRAT-A-ALT-SUPPLIER": "GOOD",
        "STRAT-B-AIR-FREIGHT": "POOR",
        "STRAT-C-REALLOCATION": "MODERATE",
    }
    return ratings.get(strategy_id, "UNKNOWN")


def _sustainability_notes(strategy_id: str) -> str:
    notes = {
        "STRAT-A-ALT-SUPPLIER": "Air freight of qualification batch is a one-time CO2 cost. Ongoing sea freight maintains baseline. Best long-term ESG profile.",
        "STRAT-B-AIR-FREIGHT": "340% CO2 increase vs sea freight. Not sustainable beyond 2 weeks. Requires carbon offsetting program activation.",
        "STRAT-C-REALLOCATION": "Minimal CO2 increase. However, reputational risk from deferral may affect ESG score indirectly via supplier relation governance metrics.",
    }
    return notes.get(strategy_id, "")
