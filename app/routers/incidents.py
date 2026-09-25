from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rbac import get_current_user, require_role

from app.models.incident import Incident
from app.models.status_history import StatusHistory
from app.models.notification import Notification
from app.models.user import User
from app.models.assignment import Assignment

from app.schemas.incident import IncidentCreate

from app.services.priority_engine import get_priority
from app.services.risk_engine import get_risk_score
from app.services.ai_classifier import classify


router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.post("/")
def create_incident(
    data: IncidentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # AI classification
    ai_result = classify(data.description, data.category)

    # Calculate priority and risk
    priority = get_priority(data.category, data.people_affected)

    risk = get_risk_score(
        data.category,
        data.people_affected,
        priority
    )

    # Create incident
    incident = Incident(
        **data.dict(),
        priority=priority,
        risk_score=risk,
        ai_suggested_category=ai_result["category"],
        ai_suggested_priority=ai_result["priority"],
        ai_confidence=ai_result["confidence"],
        reported_by=user["id"],
        status="OPEN"
    )

    db.add(incident)
    db.commit()
    db.refresh(incident)

    # Add initial status history
    db.add(
        StatusHistory(
            incident_id=incident.id,
            status="OPEN",
            changed_by=user["id"]
        )
    )

    # ---------------------------------------------------------
    # CREATE NOTIFICATION FOR ALL COORDINATORS
    # ---------------------------------------------------------
    coordinators = (
        db.query(User)
        .filter(User.role == "coordinator")
        .all()
    )

    for coordinator in coordinators:
        notification = Notification(
            user_id=coordinator.id,
            incident_id=incident.id,
            title="New Incident Reported",
            message=(
                f"New {incident.priority.lower()} priority incident "
                f"reported: {incident.title}"
            ),
            type="new",
            read=False
        )
        db.add(notification)

    db.commit()
    db.refresh(incident)

    return incident


@router.get("/")
def list_incidents(
    status: str = None,
    category: str = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    q = db.query(Incident)

    # Students should only see incidents they reported
    if user["role"] == "student":
        q = q.filter(Incident.reported_by == user["id"])

    # Staff should only see incidents assigned to them
    elif user["role"] == "staff":
        assigned_incident_ids = (
            db.query(Assignment.incident_id)
            .filter(Assignment.staff_id == user["id"])
            .subquery()
        )

        q = q.filter(Incident.id.in_(assigned_incident_ids))

    # Coordinators can see all incidents

    if status:
        q = q.filter(Incident.status == status)

    if category:
        q = q.filter(Incident.category == category)

    return q.order_by(Incident.created_at.desc()).all()


@router.get("/{incident_id}/history")
def get_incident_history(
    incident_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        return {"detail": "Incident not found"}

    # Students can only view incidents they reported
    if user["role"] == "student":
        if incident.reported_by != user["id"]:
            return {"detail": "Incident not found"}

    # Staff can only view incidents assigned to them
    elif user["role"] == "staff":
        assignment = (
            db.query(Assignment)
            .filter(
                Assignment.incident_id == incident_id,
                Assignment.staff_id == user["id"]
            )
            .first()
        )

        if not assignment:
            return {"detail": "Incident not found"}

    return (
        db.query(StatusHistory)
        .filter(StatusHistory.incident_id == incident_id)
        .order_by(StatusHistory.changed_at.asc())
        .all()
    )


@router.get("/{incident_id}")
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        return {"detail": "Incident not found"}

    # Students can only view incidents they reported
    if user["role"] == "student":
        if incident.reported_by != user["id"]:
            return {"detail": "Incident not found"}

    # Staff can only view incidents assigned to them
    elif user["role"] == "staff":
        assignment = (
            db.query(Assignment)
            .filter(
                Assignment.incident_id == incident_id,
                Assignment.staff_id == user["id"]
            )
            .first()
        )

        if not assignment:
            return {"detail": "Incident not found"}

    return incident


@router.patch("/{incident_id}/status")
def update_status(
    incident_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    user=Depends(require_role("staff", "coordinator"))
):
    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        return {"detail": "Incident not found"}

    # Staff can only update incidents assigned to them
    if user["role"] == "staff":
        assignment = (
            db.query(Assignment)
            .filter(
                Assignment.incident_id == incident_id,
                Assignment.staff_id == user["id"]
            )
            .first()
        )

        if not assignment:
            return {"detail": "Incident not found"}

    incident.status = new_status

    db.add(
        StatusHistory(
            incident_id=incident_id,
            status=new_status,
            changed_by=user["id"]
        )
    )

    db.commit()
    db.refresh(incident)

    return incident