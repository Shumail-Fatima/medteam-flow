from fastapi import APIRouter, HTTPException, status, Query
from pathlib import Path
from typing import List, Optional
from models.notifModel import Notification, Notifications
from utils.fileHandler import read_json, write_json
from uuid import uuid4
from datetime import datetime

router = APIRouter(prefix="/notifications", tags=["notifications"])

# Use the same mock data file used by the frontend
notifications_file = Path(__file__).parents[2] / "mockServer" / "data" / "Notifications.json"

def load_notifications() -> List[dict]:
    """Load notifications from JSON file"""
    data = read_json(notifications_file)
    if isinstance(data, list):
        return data
    return data.get("Notifications", []) if isinstance(data, dict) else []

def save_notifications(notifications: List[dict]) -> None:
    """Save notifications to JSON file"""
    write_json(notifications_file, {"Notifications": notifications})

@router.get("/", response_model=List[Notification])
def get_notifications(toUserId: Optional[str] = Query(None, description="Filter notifications by recipient user ID")):
    """Get notifications, optionally filtered by toUserId"""
    notifications = load_notifications()
    
    if toUserId:
        # Filter notifications for specific user
        user_notifications = [n for n in notifications if n.get("toUserId") == toUserId]
        return [Notification(**n) for n in user_notifications]
    
    return [Notification(**n) for n in notifications]

@router.get("/{notification_id}", response_model=Notification)
def get_notification(notification_id: str):
    """Get a specific notification by ID"""
    notifications = load_notifications()
    for notification in notifications:
        if notification.get("id") == notification_id:
            return Notification(**notification)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

@router.post("/", response_model=Notification, status_code=status.HTTP_201_CREATED)
def create_notification(notification: Notification):
    """Create a new notification"""
    notifications = load_notifications()
    
    # Generate ID if not provided
    if not notification.id:
        notification.id = f"notif_{int(datetime.utcnow().timestamp() * 1000)}_{uuid4().hex[:8]}"
    
    # Set creation time if not provided
    if not notification.createdAt:
        notification.createdAt = datetime.utcnow().isoformat() + "Z"
    
    notification_dict = notification.dict()
    notifications.append(notification_dict)
    save_notifications(notifications)
    
    return notification

@router.patch("/{notification_id}", response_model=Notification)
def update_notification(notification_id: str, notification_update: dict):
    """Update a notification (e.g., mark as read)"""
    notifications = load_notifications()
    
    for i, notification in enumerate(notifications):
        if notification.get("id") == notification_id:
            # Update only the provided fields
            notifications[i].update(notification_update)
            save_notifications(notifications)
            return Notification(**notifications[i])
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: str):
    """Delete a notification"""
    notifications = load_notifications()
    initial_count = len(notifications)
    
    notifications = [n for n in notifications if n.get("id") != notification_id]
    
    if len(notifications) == initial_count:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    
    save_notifications(notifications)
    return None


