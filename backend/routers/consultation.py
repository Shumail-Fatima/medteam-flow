from sys import prefix
from fastapi import APIRouter, HTTPException, status
from pathlib import Path
from typing import List
from models.consultationModel import Consultation, Consultations
from utils.fileHandler import read_json, write_json
from uuid import uuid4
from datetime import datetime

router = APIRouter(prefix="/consultations", tags=["consultations"])

consultations_file = Path(__file__).parents[2] / "mockServer" / "data" / "Consultations.json"

def load_consultations() -> List[dict]:
    """Load consultations from JSON file"""
    data = read_json(consultations_file)
    if isinstance(data, list):
        return data
    return data.get("Consultations", []) if isinstance(data, dict) else []

def save_consultations(consultations: List[dict]) -> None:
    """Save consultations to JSON file"""
    write_json(consultations_file, {"Consultations": consultations})

@router.get("/", response_model=List[Consultation])
def get_consultations():
    """Get all consultations"""
    consultations = load_consultations()
    return [Consultation(**consult) for consult in consultations]

@router.get("/{consultation_id}", response_model=Consultation)
def get_consultation(consultation_id: str):
    """Get a specific consultation by ID"""
    consultations = load_consultations()
    for consultation in consultations:
        if consultation.get("id") == consultation_id:
            return Consultation(**consultation)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation not found")

@router.post("/", response_model=Consultation, status_code=status.HTTP_201_CREATED)
def create_consultation(consultation: Consultation):
    """Create a new consultation"""
    consultations = load_consultations()
    
    # Generate ID if not provided
    if not consultation.id:
        consultation.id = f"consult_{int(datetime.utcnow().timestamp() * 1000)}"
    
    consultation_dict = consultation.dict()
    consultations.append(consultation_dict)
    save_consultations(consultations)
    
    return consultation

@router.put("/{consultation_id}", response_model=Consultation)
def update_consultation(consultation_id: str, consultation_update: Consultation):
    """Update an existing consultation"""
    consultations = load_consultations()
    
    for i, consultation in enumerate(consultations):
        if consultation.get("id") == consultation_id:
            # Update the consultation while preserving the ID
            updated_consultation = consultation_update.dict()
            updated_consultation["id"] = consultation_id
            consultations[i] = updated_consultation
            save_consultations(consultations)
            return Consultation(**updated_consultation)
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation not found")

@router.delete("{consultation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_consultation(consultation_id: str):
    """Delete an appointment"""
    consultations = load_consultations()
    initial_count = len(consultations)
    
    consultations = [consult for consult in consultations if consult.get("id") != consultation_id]
    
    if len(consultations) == initial_count:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consultation not found")
    
    save_consultations(consultations)
    return None