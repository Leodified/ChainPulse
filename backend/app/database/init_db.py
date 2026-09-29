"""
ChainPulse Backend - Database Initialization
Creates all tables and triggers the demo data seeder on first run.
"""
from app.core.logging import get_logger
from app.database.connection import engine
from app.models.base import Base

# Import all models so SQLAlchemy registers them before create_all
import app.models.supply_chain  # noqa: F401
import app.models.disruptions  # noqa: F401
import app.models.simulations  # noqa: F401
import app.models.agents  # noqa: F401
import app.models.audit  # noqa: F401
import app.models.users  # noqa: F401

logger = get_logger(__name__)


def init_db() -> None:
    """
    Create all database tables and seed demo data if empty.
    Idempotent - safe to call multiple times.
    """
    logger.info("database_init_start")
    Base.metadata.create_all(bind=engine)
    logger.info("database_tables_created")

    # Seed demo data only if DB is empty
    from app.data.seed import seed_demo_data
    from app.database.connection import SessionLocal

    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()

    logger.info("database_init_complete")
