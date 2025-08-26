from fastapi import APIRouter, HTTPException, status
from pathlib import Path
from typing import List
from models.appointmentModel import Appointment, Appointments
from utils.fileHandler import read_json, write_json
from uuid import uuid4
from datetime import datetime

router = APIRouter(prefix="/appointments", tags=["appointments"])

# Use the same mock data file used by the frontend
appointments_file = Path(__file__).parents[2] / "mockServer" / "data" / "Appointments.json"

def load_appointments() -> List[dict]:
    """Load appointments from JSON file"""
    data = read_json(appointments_file)
    if isinstance(data, list):
        return data
    return data.get("Appointments", []) if isinstance(data, dict) else []

def save_appointments(appointments: List[dict]) -> None:
    """Save appointments to JSON file"""
    write_json(appointments_file, {"Appointments": appointments})

@router.get("/", response_model=List[Appointment])
def get_appointments():
    """Get all appointments"""
    appointments = load_appointments()
    return [Appointment(**apt) for apt in appointments]

@router.get("/{appointment_id}", response_model=Appointment)
def get_appointment(appointment_id: str):
    """Get a specific appointment by ID"""
    appointments = load_appointments()
    for appointment in appointments:
        if appointment.get("id") == appointment_id:
            return Appointment(**appointment)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

@router.post("/", response_model=Appointment, status_code=status.HTTP_201_CREATED)
def create_appointment(appointment: Appointment):
    """Create a new appointment"""
    appointments = load_appointments()
    
    # Generate ID if not provided
    if not appointment.id:
        appointment.id = f"apt_{int(datetime.utcnow().timestamp() * 1000)}"
    
    appointment_dict = appointment.dict()
    appointments.append(appointment_dict)
    save_appointments(appointments)
    
    return appointment

@router.put("/{appointment_id}", response_model=Appointment)
def update_appointment(appointment_id: str, appointment_update: Appointment):
    """Update an existing appointment"""
    appointments = load_appointments()
    
    for i, appointment in enumerate(appointments):
        if appointment.get("id") == appointment_id:
            # Update the appointment while preserving the ID
            updated_appointment = appointment_update.dict()
            updated_appointment["id"] = appointment_id
            appointments[i] = updated_appointment
            save_appointments(appointments)
            return Appointment(**updated_appointment)
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(appointment_id: str):
    """Delete an appointment"""
    appointments = load_appointments()
    initial_count = len(appointments)
    
    appointments = [apt for apt in appointments if apt.get("id") != appointment_id]
    
    if len(appointments) == initial_count:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    
    save_appointments(appointments)
    return None


