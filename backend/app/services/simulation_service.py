"""
ChainPulse Backend - Simulation Service
Business logic for scenarios and snapshots.
"""
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.simulations import RecoveryStrategy, Scenario, ScenarioSnapshot


def get_scenarios_for_disruption(
    db: Session, disruption_id: str
) -> List[Scenario]:
    stmt = (
        select(Scenario)
        .where(Scenario.disruption_id == disruption_id)
        .options(
            selectinload(Scenario.snapshots),
            selectinload(Scenario.strategies),
        )
        .order_by(Scenario.time_horizon_days)
    )
    return list(db.execute(stmt).scalars())


def get_scenario_by_horizon(
    db: Session, disruption_id: str, horizon_days: int
) -> Optional[Scenario]:
    stmt = (
        select(Scenario)
        .where(
            Scenario.disruption_id == disruption_id,
            Scenario.time_horizon_days == horizon_days,
        )
        .options(
            selectinload(Scenario.snapshots),
            selectinload(Scenario.strategies),
        )
    )
    return db.execute(stmt).scalar_one_or_none()


def get_strategies_for_disruption(
    db: Session, disruption_id: str
) -> List[RecoveryStrategy]:
    """Get all strategies across all scenarios for a disruption."""
    stmt = (
        select(RecoveryStrategy)
        .join(Scenario, RecoveryStrategy.scenario_id == Scenario.id)
        .where(Scenario.disruption_id == disruption_id)
        .order_by(RecoveryStrategy.feasibility_score.desc())
    )
    return list(db.execute(stmt).scalars())


def get_strategy_by_id(
    db: Session, strategy_id: str
) -> Optional[RecoveryStrategy]:
    return db.get(RecoveryStrategy, strategy_id)
