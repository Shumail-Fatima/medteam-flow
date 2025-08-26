from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class NotificationType(str, Enum):
    appointment = "appointment"
    consultation = "consultation"
    task = "task"
    user = "user"
    followup = "followup"
    general = "general"


class NotificationPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Notification(BaseModel):
    id: str = Field(default_factory=str)
    title: str
    message: str
    type: NotificationType
    toUserId: str
    fromUserId: Optional[str] = None
    isRead: bool = False
    createdAt: str
    # optional contextual fields
    appointmentId: Optional[str] = None
    consultationId: Optional[str] = None
    taskId: Optional[str] = None
    patientId: Optional[str] = None
    doctorId: Optional[str] = None
    priority: Optional[NotificationPriority] = None


class Notifications(BaseModel):
    notifications: List[Notification]