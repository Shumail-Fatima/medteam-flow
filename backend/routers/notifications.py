from fastapi import APIRouter, HTTPException, status
from pathlib import Path
from typing import List
from models.notifModel import Notification, Notifications
from utils.fileHandler import read_json, write_json
from uuid import uuid4
from datetime import datetime

router = APIRouter()

# Use the same mock data file used by the frontend (repo root/mockServer/data/Patients.json)
notifications_file = Path(__file__).parents[2] / "mockServer" / "data" / "Notifications.json"

mockdata_file = Path(__file__).parents[2] / "mockServer" / "data" / "mockdata.json"


def save_notifications(notifications: List[dict]) -> None:
    write_json(notifications_file, notifications)


@router.get("/Notifications", response_model=Notifications)
def get_notifications():
    data = read_json(notifications_file)
    return Notifications(notifications=data["Notifications"])

@router.post("/Notifications")
def add_notifications(notifications: Notification):
    data = read_json(notifications_file)
    data["Notifications"].append(notifications.dict())
    write_json(notifications_file, data)
    return notifications


