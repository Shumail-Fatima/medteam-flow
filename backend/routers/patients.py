from fastapi import APIRouter, HTTPException, status
from pathlib import Path
from typing import List
from models.patientModel import Patient, Patients
from utils.fileHandler import read_json, write_json
from uuid import uuid4
from datetime import datetime

router = APIRouter()

# Use the same mock data file used by the frontend (repo root/mockServer/data/Patients.json)
patients_file = Path(__file__).parents[2] / "mockServer" / "data" / "Patients.json"

mockdata_file = Path(__file__).parents[2] / "mockServer" / "data" / "mockdata.json"


def save_patients(patients: List[dict]) -> None:
    write_json(patients_file, patients)


@router.get("/patients", response_model=Patients)
def get_patients():
    data = read_json(patients_file)
    # Support both array file and object with key
    if isinstance(data, list):
        return Patients(patients=data)
    return Patients(patients=data.get("Patients") or data.get("patients") or [])
    





@router.post("/patients", response_model=Patient, status_code=status.HTTP_201_CREATED)
def add_patients(patient: Patient):
    data = read_json(patients_file)
    # normalize to list
    patients_list = data if isinstance(data, list) else (data.get("Patients") or data.get("patients") or [])
    if not patient.id:
        patient.id = f"patient_{uuid4().hex[:8]}"
    if not patient.createdAt:
        patient.createdAt = datetime.utcnow().isoformat() + "Z"
    patients_list.append(patient.dict())
    write_json(patients_file, patients_list)
    return patient


@router.put("/patients/{patient_id}", response_model=Patient)
def update_patient(patient_id: str, patient: Patient):
    data = read_json(patients_file)
    patients_list = data if isinstance(data, list) else (data.get("Patients") or data.get("patients") or [])
    for idx, p in enumerate(patients_list):
        if p.get("id") == patient_id:
            updated = patient.dict()
            updated["id"] = patient_id
            patients_list[idx] = updated
            write_json(patients_file, patients_list)
            return updated
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")


@router.delete("/patients/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: str):
    data = read_json(patients_file)
    patients_list = data if isinstance(data, list) else (data.get("Patients") or data.get("patients") or [])
    new_list = [p for p in patients_list if p.get("id") != patient_id]
    if len(new_list) == len(patients_list):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    write_json(patients_file, new_list)
    return None


