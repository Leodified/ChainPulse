"""
ChainPulse Backend - Demo Data Seeder
Inserts all demo data from demo_data.py into the database.
Idempotent: checks if data exists before inserting.
"""
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.data.demo_data import (
    AGENT_ACTIVITIES,
    CUSTOMERS,
    DISRUPTION_EVENT,
    DISRUPTION_IMPACTS,
    FACTORIES,
    FACTORY_MATERIALS,
    MATERIALS,
    ORDERS,
    PRODUCTS,
    RECOVERY_STRATEGIES,
    ROUTES,
    SCENARIOS,
    SCENARIO_SNAPSHOTS,
    SHIPMENTS,
    SINGAPORE_DISRUPTION_ID,
    SUPPLIER_RELATIONSHIPS,
    SUPPLIERS,
)
from app.models.agents import AgentActivity
from app.models.audit import AuditEvent
from app.models.disruptions import DisruptionEvent, DisruptionImpact
from app.models.simulations import RecoveryStrategy, Scenario, ScenarioSnapshot
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
from app.models.users import User
from app.core.security import hash_password

logger = get_logger(__name__)


def seed_demo_data(db: Session) -> None:
    """
    Seed all demo data. Checks for existing disruption event as sentinel
    to avoid re-seeding on every restart.
    """
    existing = db.get(DisruptionEvent, SINGAPORE_DISRUPTION_ID)
    if existing is not None:
        logger.info("seed_skipped", reason="data_already_exists")
        return

    logger.info("seed_start", scenario="Singapore Port Disruption")

    try:
        _seed_suppliers(db)
        _seed_supplier_relationships(db)
        _seed_materials(db)
        _seed_factories(db)
        _seed_factory_materials(db)
        _seed_products(db)
        _seed_customers(db)
        _seed_routes(db)
        _seed_orders(db)
        _seed_shipments(db)
        _seed_disruption(db)
        _seed_disruption_impacts(db)
        _seed_scenarios(db)
        _seed_scenario_snapshots(db)
        _seed_recovery_strategies(db)
        _seed_agent_activities(db)
        _seed_audit_event(db)
        _seed_users(db)

        db.commit()
        logger.info("seed_complete", total_records="all entities committed")

    except Exception as exc:
        db.rollback()
        logger.error("seed_failed", error=str(exc))
        raise


# ---------------------------------------------------------------------------
# Private seeder functions
# ---------------------------------------------------------------------------

def _seed_suppliers(db: Session) -> None:
    for s in SUPPLIERS:
        db.add(Supplier(**s))
    logger.info("seeded", entity="suppliers", count=len(SUPPLIERS))


def _seed_supplier_relationships(db: Session) -> None:
    for r in SUPPLIER_RELATIONSHIPS:
        db.add(SupplierRelationship(**r))
    logger.info("seeded", entity="supplier_relationships", count=len(SUPPLIER_RELATIONSHIPS))


def _seed_materials(db: Session) -> None:
    for m in MATERIALS:
        db.add(Material(**m))
    logger.info("seeded", entity="materials", count=len(MATERIALS))


def _seed_factories(db: Session) -> None:
    for f in FACTORIES:
        db.add(Factory(**f))
    logger.info("seeded", entity="factories", count=len(FACTORIES))


def _seed_factory_materials(db: Session) -> None:
    for fm in FACTORY_MATERIALS:
        db.add(FactoryMaterial(**fm))
    logger.info("seeded", entity="factory_materials", count=len(FACTORY_MATERIALS))


def _seed_products(db: Session) -> None:
    for p in PRODUCTS:
        db.add(Product(**p))
    logger.info("seeded", entity="products", count=len(PRODUCTS))


def _seed_customers(db: Session) -> None:
    for c in CUSTOMERS:
        db.add(Customer(**c))
    logger.info("seeded", entity="customers", count=len(CUSTOMERS))


def _seed_routes(db: Session) -> None:
    for r in ROUTES:
        db.add(Route(**r))
    logger.info("seeded", entity="routes", count=len(ROUTES))


def _seed_orders(db: Session) -> None:
    for o in ORDERS:
        db.add(Order(**o))
    logger.info("seeded", entity="orders", count=len(ORDERS))


def _seed_shipments(db: Session) -> None:
    for s in SHIPMENTS:
        db.add(Shipment(**s))
    logger.info("seeded", entity="shipments", count=len(SHIPMENTS))


def _seed_disruption(db: Session) -> None:
    event_data = dict(DISRUPTION_EVENT)
    db.add(DisruptionEvent(**event_data))
    logger.info("seeded", entity="disruption_event", id=SINGAPORE_DISRUPTION_ID)


def _seed_disruption_impacts(db: Session) -> None:
    for imp in DISRUPTION_IMPACTS:
        db.add(DisruptionImpact(**imp))
    logger.info("seeded", entity="disruption_impacts", count=len(DISRUPTION_IMPACTS))


def _seed_scenarios(db: Session) -> None:
    for s in SCENARIOS:
        db.add(Scenario(**s))
    logger.info("seeded", entity="scenarios", count=len(SCENARIOS))


def _seed_scenario_snapshots(db: Session) -> None:
    for snap in SCENARIO_SNAPSHOTS:
        db.add(ScenarioSnapshot(**snap))
    logger.info("seeded", entity="scenario_snapshots", count=len(SCENARIO_SNAPSHOTS))


def _seed_recovery_strategies(db: Session) -> None:
    for strat in RECOVERY_STRATEGIES:
        db.add(RecoveryStrategy(**strat))
    logger.info("seeded", entity="recovery_strategies", count=len(RECOVERY_STRATEGIES))


def _seed_agent_activities(db: Session) -> None:
    for act in AGENT_ACTIVITIES:
        db.add(AgentActivity(**act))
    logger.info("seeded", entity="agent_activities", count=len(AGENT_ACTIVITIES))


def _seed_audit_event(db: Session) -> None:
    db.add(
        AuditEvent(
            event_type="DATA_SEEDED",
            entity_type="system",
            entity_id="demo",
            user_id="system",
            description="Initial demo data seeded for Singapore Port Disruption scenario",
            metadata_json='{"scenario": "SG_PORT_DISRUPTION_2026", "version": "1.0.0"}',
            created_at=datetime.now(timezone.utc),
            ip_address="127.0.0.1",
        )
    )
    logger.info("seeded", entity="audit_event", type="DATA_SEEDED")


def _seed_users(db: Session) -> None:
    users = [
        User(
            id="USR-DIR-001",
            email="director@acme-corp.com",
            hashed_password=hash_password("director123"),
            full_name="Sarah Chen (Operations Director)",
            role="OPERATIONS_DIRECTOR",
            tenant_id="tenant-acme-corp",
            is_active=True,
        ),
        User(
            id="USR-PLN-001",
            email="planner@acme-corp.com",
            hashed_password=hash_password("planner123"),
            full_name="Marcus Weber (Supply Chain Planner)",
            role="SUPPLY_CHAIN_PLANNER",
            tenant_id="tenant-acme-corp",
            is_active=True,
        ),
        User(
            id="USR-EXT-001",
            email="external@other-corp.com",
            hashed_password=hash_password("external123"),
            full_name="External Auditor (Other Corp)",
            role="VIEWER",
            tenant_id="tenant-other-corp",
            is_active=True,
        ),
    ]
    for u in users:
        db.add(u)
    logger.info("seeded", entity="users", count=len(users))
