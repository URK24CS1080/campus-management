from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models.incident import Incident
from app.models.assignment import Assignment
from app.schemas.sla import (
    SLAIncidentResponse,
    SLASummaryResponse,
)
from app.services.sla_engine import calculate_sla


router = APIRouter(
    prefix="/sla",
    tags=["sla"]
)


def get_staff_incident_ids(db: Session, user_id: int):
    """
    Get incident IDs assigned to a particular staff member.
    """
    return (
        db.query(Assignment.incident_id)
        .filter(Assignment.staff_id == user_id)
        .subquery()
    )


def get_accessible_incidents(db: Session, user):
    """
    Return incidents the current user is allowed to see.
    """

    query = db.query(Incident)

    if user["role"] == "student":
        query = query.filter(
            Incident.reported_by == user["id"]
        )

    elif user["role"] == "staff":
        assigned_ids = get_staff_incident_ids(
            db,
            user["id"]
        )

        query = query.filter(
            Incident.id.in_(assigned_ids)
        )

    # Coordinator and admin can see all incidents.

    return query.order_by(
        Incident.created_at.desc()
    ).all()


@router.get(
    "/summary",
    response_model=SLASummaryResponse
)
def get_sla_summary(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Return SLA summary for the current user's accessible incidents.
    """

    incidents = get_accessible_incidents(
        db,
        user
    )

    within_sla = 0
    at_risk = 0
    breached = 0
    no_rule = 0

    for incident in incidents:
        sla = calculate_sla(
            db,
            incident
        )

        if sla["sla_status"] == "WITHIN_SLA":
            within_sla += 1

        elif sla["sla_status"] == "AT_RISK":
            at_risk += 1

        elif sla["sla_status"] == "BREACHED":
            breached += 1

        elif sla["sla_status"] == "NO_RULE":
            no_rule += 1

    total_incidents = len(incidents)

    # Compliance is based on incidents that
    # have a configured SLA rule.
    applicable_incidents = (
        within_sla +
        at_risk +
        breached
    )

    if applicable_incidents > 0:
        compliance_percentage = round(
            (within_sla / applicable_incidents) * 100,
            2
        )
    else:
        compliance_percentage = None

    return {
        "total_incidents": total_incidents,
        "within_sla": within_sla,
        "at_risk": at_risk,
        "breached": breached,
        "no_rule": no_rule,
        "compliance_percentage": compliance_percentage
    }


@router.get(
    "/incidents",
    response_model=list[SLAIncidentResponse]
)
def get_sla_incidents(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Return SLA information for all incidents
    accessible to the current user.
    """

    incidents = get_accessible_incidents(
        db,
        user
    )

    return [
        calculate_sla(db, incident)
        for incident in incidents
    ]


@router.get(
    "/incidents/{incident_id}",
    response_model=SLAIncidentResponse
)
def get_incident_sla(
    incident_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    """
    Return SLA information for one incident.
    """

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

    # Student can only access their own incident.
    if (
        user["role"] == "student"
        and incident.reported_by != user["id"]
    ):
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    # Staff can only access assigned incidents.
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
            raise HTTPException(
                status_code=404,
                detail="Incident not found"
            )

    return calculate_sla(
        db,
        incident
    )