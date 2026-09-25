# Incident table model
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from app.core.database import Base

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    location = Column(String, nullable=False)
    people_affected = Column(Integer, default=0)
    priority = Column(String, default="Medium")
    risk_score = Column(Float, default=0)
    status = Column(String, default="OPEN")
    ai_suggested_category = Column(String, nullable=True)
    ai_suggested_priority = Column(String, nullable=True)
    ai_confidence = Column(Float, nullable=True)
    reported_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())