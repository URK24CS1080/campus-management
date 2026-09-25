from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rbac import require_role, get_current_user

from app.models.assignment import Assignment
from app.models.incident import Incident
from app.models.team import Team
from app.models.user import User
from app.models.notification import Notification


router = APIRouter(prefix="/incidents", tags=["assignments"])


@router.post("/{incident_id}/assign")
def assign_incident(
    incident_id: int,
    team_id: int,
    staff_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_role("coordinator"))
):

    incident = (
        db.query(Incident)
        .filter(Incident.id == incident_id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    team = (
        db.query(Team)
        .filter(Team.id == team_id)
        .first()
    )

    if not team:
        raise HTTPException(
            status_code=404,
            detail="Team not found"
        )

    staff = (
        db.query(User)
        .filter(User.id == staff_id)
        .first()
    )

    if not staff:
        raise HTTPException(
            status_code=404,
            detail="Staff member not found"
        )

    # Create assignment
    assignment = Assignment(
        incident_id=incident_id,
        team_id=team_id,
        staff_id=staff_id
    )

    db.add(assignment)

    # Update incident status
    incident.status = "ASSIGNED"

    # Notify student
    student_notification = Notification(
        user_id=incident.reported_by,
        incident_id=incident.id,
        title="Response Team Assigned",
        message=(
            f"A response team has been assigned to your incident: "
            f"{incident.title}"
        ),
        type="assigned",
        read=False
    )

    db.add(student_notification)

    # Notify assigned staff
    staff_notification = Notification(
        user_id=staff.id,
        incident_id=incident.id,
        title="Incident Assigned",
        message=(
            f"You have been assigned to incident: "
            f"{incident.title}"
        ),
        type="assigned",
        read=False
    )

    db.add(staff_notification)

    # Notify coordinator
    coordinator_notification = Notification(
        user_id=user["id"],
        incident_id=incident.id,
        title="Incident Assignment Created",
        message=(
            f"Incident {incident.title} has been assigned to "
            f"{team.name} / {staff.name}."
        ),
        type="assignment",
        read=False
    )

    db.add(coordinator_notification)

    db.commit()
    db.refresh(assignment)

    return assignment


@router.get("/{incident_id}/assignment")
def get_incident_assignment(
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
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    # Students can only view assignments for their own incidents
    if user["role"] == "student" and incident.reported_by != user["id"]:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    assignment = (
        db.query(Assignment)
        .filter(Assignment.incident_id == incident_id)
        .order_by(Assignment.assigned_at.desc())
        .first()
    )

    if not assignment:
        return {
            "assigned": False,
            "team": None,
            "staff": None
        }

    team = (
        db.query(Team)
        .filter(Team.id == assignment.team_id)
        .first()
    )

    staff = (
        db.query(User)
        .filter(User.id == assignment.staff_id)
        .first()
    )

    return {
        "assigned": True,
        "team": {
            "id": team.id if team else None,
            "name": team.name if team else "Unknown Team"
        },
        "staff": {
            "id": staff.id if staff else None,
            "name": staff.name if staff else "Unknown Staff",
            "email": staff.email if staff else None
        },
        "assigned_at": assignment.assigned_at
    }


# ---------------------------------------------------------
# GET ALL TEAMS
# ---------------------------------------------------------

@router.get("/lookup/teams")
def get_teams(
    db: Session = Depends(get_db),
    user=Depends(require_role("coordinator"))
):

    return (
        db.query(Team)
        .order_by(Team.name.asc())
        .all()
    )


# ---------------------------------------------------------
# GET ALL STAFF
# ---------------------------------------------------------

@router.get("/lookup/staff")
def get_staff(
    db: Session = Depends(get_db),
    user=Depends(require_role("coordinator"))
):

    return (
        db.query(User)
        .filter(User.role == "staff")
        .order_by(User.name.asc())
        .all()
    )