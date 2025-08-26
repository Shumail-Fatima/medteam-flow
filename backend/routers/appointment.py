from fastapi import APIRouter, HTTPException, status
from pathlib import Path
from typing import List
from models.appointmentModel import Appointment, Appointments
from utils.fileHandler import read_json, write_json
from uuid import uuid4
from datetime import datetime

router = APIRouter()

# Use the same mock data file used by the frontend (repo root/mockServer/data/Patients.json)
appointments_file = Path(__file__).parents[2] / "mockServer" / "data" / "Appointments.json"

mockdata_file = Path(__file__).parents[2] / "mockServer" / "data" / "mockdata.json"


def save_appointments(appointments: List[dict]) -> None:
    write_json(appointments_file, appointments)


@router.get("/Appointments", response_model=Appointments)
def get_appointments():
    data = read_json(appointments_file)
    return Appointments(appointments=data["Appointments"])

@router.post("/Appointments")
def add_appointments(appointments: Appointment):
    data = read_json(appointments_file)
    data["Appointments"].append(appointments.dict())
    write_json(appointments_file, data)
    return appointments


