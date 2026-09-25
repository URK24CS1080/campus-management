from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SLAIncidentResponse(BaseModel):
    incident_id: int
    priority: str
    sla_status: str

    target_minutes: Optional[int] = None
    elapsed_minutes: Optional[int] = None
    remaining_minutes: Optional[int] = None
    overdue_minutes: Optional[int] = None

    deadline: Optional[datetime] = None


class SLASummaryResponse(BaseModel):
    total_incidents: int
    within_sla: int
    at_risk: int
    breached: int
    no_rule: int

    compliance_percentage: Optional[float] = None