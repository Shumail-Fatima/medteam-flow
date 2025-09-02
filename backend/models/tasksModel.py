from asyncio import tasks
import datetime
from pydantic import BaseModel, Field
from typing import List, Optional

class Task(BaseModel):
    id: str = Field(default_factory=lambda: f"t_{int(datetime.utcnow().timestamp() * 1000)}")
    title: str
    type: str
    status: str
    notes: Optional[str] = None
    patientId: str
    assigneeId: str
    dueAt: Optional[str] = None
    createdBy: Optional[str] = None
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    assigneeName: Optional[str] = None

class Tasks(BaseModel):
    tasks: List[Task] = Field(..., alias="Tasks")
    class Config: 
        populate_by_name = True