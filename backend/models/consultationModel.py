from pydantic import BaseModel, Field
from typing import List, Optional


class Prescription(BaseModel):
    id: str
    medication: str
    dosage: str
    frequency: str
    duration: str
    instructions: str


class Consultation(BaseModel):
    id: str = Field(default_factory=str)
    patientId: str
    patientName: str
    doctorId: str
    doctorName: str
    appointmentId: str
    date: str   # stored as string (ISO datetime). Could be datetime if you want stricter typing
    symptoms: List[str]
    diagnosis: str
    notes: str
    prescriptions: List[Prescription] = []
    followUpRequired: bool
    followUpDate: Optional[str] = None
    createdAt: str
    status: str
    uploadIds: Optional[List[str]] = []


class Consultations(BaseModel):
    consultations: List[Consultation] = Field(..., alias="Consultations")

    class Config:
        populate_by_name = True
