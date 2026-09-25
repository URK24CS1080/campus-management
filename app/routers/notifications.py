from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.rbac import get_current_user
from app.models.notification import Notification


router = APIRouter(
    prefix="/notifications",
    tags=["notifications"]
)


# Get notifications for the logged-in user
@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user["id"])
        .order_by(Notification.created_at.desc())
        .all()
    )

    return notifications


# Mark all notifications as read
@router.patch("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    notifications = (
        db.query(Notification)
        .filter(
            Notification.user_id == user["id"],
            Notification.read == False
        )
        .all()
    )

    for notification in notifications:
        notification.read = True

    db.commit()

    return {
        "message": "All notifications marked as read",
        "count": len(notifications)
    }


# Mark one notification as read
@router.patch("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.user_id == user["id"]
        )
        .first()
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.read = True

    db.commit()
    db.refresh(notification)

    return notification