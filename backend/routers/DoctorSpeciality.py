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
    return

def save_consultations(consultations: List[dict]) -> None:
    return

@router.get("/", response_model=List[Consultation])
def get_consultations():
    return

@router.get("/{consultation_id}", response_model=Consultation)
def get_consultation(consultation_id: str):
    return

@router.post("/", response_model=Consultation, status_code=status.HTTP_201_CREATED)
def create_consultation(consultation: Consultation):
    return

@router.put("/{consultation_id}", response_model=Consultation)
def update_consultation(consultation_id: str, consultation_update: Consultation):
    return

@router.delete("{consultation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_consultation(consultation_id: str):
    return