# Pydantic schemas for Incident requests/responses
from pydantic import BaseModel

class IncidentCreate(BaseModel):
    title: str
    description: str
    category: str
    location: str
    people_affected: int = 0