# Background job that checks for SLA breaches

from app.core.database import SessionLocal
from app.models.incident import Incident
from app.models.escalation import Escalation
from app.services.sla_engine import calculate_sla


def check_sla_breaches():
    db = SessionLocal()

    try:
        # Check incidents that are still active.
        active_incidents = (
            db.query(Incident)
            .filter(
                Incident.status.in_(
                    ["OPEN", "ACKNOWLEDGED", "ASSIGNED", "IN_PROGRESS"]
                )
            )
            .all()
        )

        for incident in active_incidents:
            sla = calculate_sla(db, incident)

            # If there is no configured SLA rule,
            # do not create a fake breach.
            if sla["sla_status"] != "BREACHED":
                continue

            # Prevent duplicate escalation records.
            already = (
                db.query(Escalation)
                .filter(
                    Escalation.incident_id == incident.id,
                    Escalation.reason == "SLA target exceeded"
                )
                .first()
            )

            if not already:
                db.add(
                    Escalation(
                        incident_id=incident.id,
                        reason="SLA target exceeded",
                        resolved=False
                    )
                )

        db.commit()

    finally:
        db.close()