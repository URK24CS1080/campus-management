from sqlalchemy import Column, Integer, String
from app.core.database import Base

class SLARule(Base):
    __tablename__ = "sla_rules"
    id = Column(Integer, primary_key=True)
    priority = Column(String, unique=True, nullable=False)
    target_minutes = Column(Integer, nullable=False)