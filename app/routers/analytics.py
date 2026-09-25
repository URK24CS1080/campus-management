# Analytics/dashboard routes
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.rbac import require_role
from app.models.incident import Incident
from app.models.escalation import Escalation

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary")
def summary(db: Session = Depends(get_db), user=Depends(require_role("coordinator", "admin"))):
    top_categories = db.query(Incident.category, func.count(Incident.id)) \
        .group_by(Incident.category).order_by(func.count(Incident.id).desc()).limit(3).all()

    return {
        "total_incidents": db.query(Incident).count(),
        "open_incidents": db.query(Incident).filter(Incident.status == "OPEN").count(),
        "critical_incidents": db.query(Incident).filter(Incident.priority == "Critical").count(),
        "resolved_incidents": db.query(Incident).filter(Incident.status == "RESOLVED").count(),
        "escalated_incidents": db.query(Escalation).count(),
        "top_categories": [{"category": c, "count": n} for c, n in top_categories]
    }