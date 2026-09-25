from datetime import datetime, timedelta, timezone

from app.models.incident import Incident
from app.models.sla_rule import SLARule
from app.models.status_history import StatusHistory


AT_RISK_THRESHOLD = 0.20


def get_sla_rule(db, priority: str):
    """
    Get the SLA rule configured in the database
    for the given incident priority.
    """
    return (
        db.query(SLARule)
        .filter(SLARule.priority == priority)
        .first()
    )


def get_resolved_at(db, incident_id: int):
    """
    Get the first time the incident was marked RESOLVED.
    """
    resolved_history = (
        db.query(StatusHistory)
        .filter(
            StatusHistory.incident_id == incident_id,
            StatusHistory.status == "RESOLVED"
        )
        .order_by(StatusHistory.changed_at.asc())
        .first()
    )

    if resolved_history:
        return resolved_history.changed_at

    return None


def calculate_sla(db, incident: Incident):
    """
    Calculate SLA information for an incident.

    SLA starts when the incident is created.
    The SLA target is read from the database.
    """

    rule = get_sla_rule(db, incident.priority)

    if not rule:
        return {
            "incident_id": incident.id,
            "priority": incident.priority,
            "sla_status": "NO_RULE",
            "target_minutes": None,
            "elapsed_minutes": None,
            "remaining_minutes": None,
            "overdue_minutes": None,
            "deadline": None,
        }

    created_at = incident.created_at

    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    resolved_at = get_resolved_at(db, incident.id)

    if resolved_at:
        if resolved_at.tzinfo is None:
            resolved_at = resolved_at.replace(tzinfo=timezone.utc)

        end_time = resolved_at
    else:
        end_time = datetime.now(timezone.utc)

    elapsed_seconds = max(
        0,
        (end_time - created_at).total_seconds()
    )

    elapsed_minutes = int(elapsed_seconds // 60)

    target_minutes = rule.target_minutes

    deadline = created_at + timedelta(minutes=target_minutes)

    remaining_minutes = target_minutes - elapsed_minutes

    if resolved_at:
        if end_time <= deadline:
            sla_status = "WITHIN_SLA"
        else:
            sla_status = "BREACHED"

    else:
        if end_time > deadline:
            sla_status = "BREACHED"

        else:
            remaining_ratio = remaining_minutes / target_minutes

            if remaining_ratio <= AT_RISK_THRESHOLD:
                sla_status = "AT_RISK"
            else:
                sla_status = "WITHIN_SLA"

    overdue_minutes = max(
        0,
        elapsed_minutes - target_minutes
    )

    return {
        "incident_id": incident.id,
        "priority": incident.priority,
        "sla_status": sla_status,
        "target_minutes": target_minutes,
        "elapsed_minutes": elapsed_minutes,
        "remaining_minutes": max(0, remaining_minutes),
        "overdue_minutes": overdue_minutes,
        "deadline": deadline,
    }