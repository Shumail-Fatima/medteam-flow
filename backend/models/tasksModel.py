from asyncio import tasks
from pydantic import BaseModel, Field
from typing import List

class Task(BaseModel):
    id: str = Field(default_factory=str)
    title: str
    type: str
    status: str
    notes: str
    patientId: str
    assigneeId: str
    dueAt: str
    createdBy: str
    createdAt: str
    assigneeName: str

class Tasks(BaseModel):
    tasks: List[Task] = Field(..., alias="Tasks")
    class Config: 
        populate_by_name = True