from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func

from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)

    title = Column(String, nullable=False)

    message = Column(String, nullable=False)

    type = Column(String, nullable=False)

    read = Column(Boolean, default=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )