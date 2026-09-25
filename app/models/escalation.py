from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean
from sqlalchemy.sql import func
from app.core.database import Base

class Escalation(Base):
    __tablename__ = "escalations"
    id = Column(Integer, primary_key=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    reason = Column(String, nullable=False)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved = Column(Boolean, default=False)