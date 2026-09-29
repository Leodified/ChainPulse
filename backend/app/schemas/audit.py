"""
ChainPulse Backend - Audit Schemas
Pydantic models for immutable audit logs.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


class AuditEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: str
    event_type: str
    entity_type: str
    entity_id: str
    user_id: str
    description: str
    metadata_json: Optional[str] = "{}"
    created_at: datetime
    ip_address: str

    @field_validator("ip_address", mode="after")
    @classmethod
    def mask_ip(cls, v: str) -> str:
        """Mask raw network IP addresses for non-superadmin users."""
        if not v or v in ("0.0.0.0", "127.0.0.1"):
            return "127.0.0.*** (Internal Gateway)"
        parts = v.split(".")
        if len(parts) == 4:
            return f"{parts[0]}.{parts[1]}.***.*** (Masked)"
        return "***.***.***.*** (Masked)"
