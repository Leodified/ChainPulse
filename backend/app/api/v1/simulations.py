"""
ChainPulse Backend - Simulations API
Scenarios and snapshots endpoints.
"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.simulations import ScenarioOut
from app.services.simulation_service import (
    get_scenario_by_horizon,
    get_scenarios_for_disruption,
)

router = APIRouter(prefix="/simulations", tags=["Simulations"])

VALID_HORIZONS = {7, 30, 60}


@router.get("/{disruption_id}", response_model=List[ScenarioOut])
def list_scenarios(disruption_id: str, db: Session = Depends(get_db)):
    """All simulation scenarios for a disruption (7, 30, 60 day horizons)."""
    scenarios = get_scenarios_for_disruption(db, disruption_id)
    if not scenarios:
        raise HTTPException(status_code=404, detail="No scenarios found for this disruption")
    return scenarios


@router.get("/{disruption_id}/{horizon}", response_model=ScenarioOut)
def get_scenario_horizon(
    disruption_id: str,
    horizon: str = Path(..., description="Time horizon in days (e.g. 7, 7D, 30, 30D, 60, 60D)"),
    db: Session = Depends(get_db),
):
    """Get a specific simulation scenario by time horizon."""
    try:
        horizon_int = int(str(horizon).strip().rstrip("dD"))
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Horizon must be a valid integer or horizon string like '7D', '30D', '60D'",
        )

    if horizon_int not in VALID_HORIZONS:
        raise HTTPException(
            status_code=400,
            detail=f"Horizon must be one of {sorted(VALID_HORIZONS)} days",
        )
    scenario = get_scenario_by_horizon(db, disruption_id, horizon_int)
    if not scenario:
        raise HTTPException(
            status_code=404,
            detail=f"Scenario for {horizon}-day horizon not found",
        )
    return scenario
