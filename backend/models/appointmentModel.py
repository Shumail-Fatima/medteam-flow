from pydantic import BaseModel, Field
from typing import List, Optional

class Appointment(BaseModel):
    id: str = Field(default_factory=str)
    patientId: str
    patientName: str
    patientAge: int   # better as int, not str
    doctorId: str
    doctorName: str
    appointmentSlot: str
    reason: str
    status: str
    consultationCompleted: bool
    createdAt: str
    specialtyName: Optional[str] = None   # spelling fixed (was "specialityName")
    createdById: Optional[str] = None


class Appointments(BaseModel):
    appointments: List[Appointment] = Field(..., alias="Appointments")

    class Config:
        populate_by_name = True
