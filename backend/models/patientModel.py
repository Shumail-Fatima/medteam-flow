from pydantic import BaseModel, Field
from typing import List, Optional, Union


class EmergencyContact(BaseModel):
    name: str
    phone: str
    relationship: str


class MedicalHistory(BaseModel):
    id: str
    date: str
    type: str
    doctorId: str
    doctorName: str
    title: str
    description: str
    severity: Optional[str] = None
    dosage: Optional[str] = None
    symptoms: Optional[List[str]] = None


class Patient(BaseModel):
    id: str = Field(default_factory=str)
    name: str
    dateOfBirth: str
    email: str
    phone: str
    address: str
    emergencyContact: Optional[Union[EmergencyContact, List[EmergencyContact]]] = None
    medicalHistory: Optional[List[MedicalHistory]] = []
    allergies: Optional[List[str]] = []
    bloodType: Optional[str] = None
    createdAt: Optional[str] = None


# class Patients(BaseModel):
#     patients: List[Patient]

class Patients(BaseModel):
    patients: List[Patient] = Field(..., alias="Patients")

    class Config:
        populate_by_name = True
