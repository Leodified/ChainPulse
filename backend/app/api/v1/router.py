"""
ChainPulse Backend - API v1 Router Aggregator
Mounts all sub-routers under /api/v1.
"""
from fastapi import APIRouter

from app.api.v1 import (
    agents,
    audit,
    auth,
    disruptions,
    financial,
    impact,
    overview,
    recovery,
    simulations,
    supply_chain,
    sustainability,
    integrations,
)

router = APIRouter()

router.include_router(auth.router)
router.include_router(audit.router)
router.include_router(integrations.router)

router.include_router(overview.router)
router.include_router(disruptions.router)
router.include_router(supply_chain.router)
router.include_router(impact.router)
router.include_router(simulations.router)
router.include_router(recovery.router)
router.include_router(agents.router)
router.include_router(financial.router)
router.include_router(sustainability.router)
