from fastapi import APIRouter, HTTPException, status, UploadFile, File
from pathlib import Path
from typing import List
from utils.fileHandler import read_json, write_json
from uuid import uuid4
from datetime import datetime
import shutil

router = APIRouter(prefix="/uploads", tags=["uploads"])

# Use the same mock data file used by the frontend
uploads_file = Path(__file__).parents[2] / "mockServer" / "data" / "Uploads.json"
#uploads_dir = Path(__file__).parents[2] / "mockServer" / "uploads"
uploads_dir = Path.home() / "Documents" / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)

def load_uploads() -> List[dict]:
    """Load uploads from JSON file"""
    data = read_json(uploads_file)
    if isinstance(data, list):
        return data
    return data.get("Uploads", []) if isinstance(data, dict) else []

def save_uploads(uploads: List[dict]) -> None:
    """Save uploads to JSON file"""
    write_json(uploads_file, {"Uploads": uploads})

@router.get("/", response_model=List[dict])
def get_uploads():
    """Get all uploaded files metadata"""
    return load_uploads()

@router.get("/{upload_id}", response_model=dict)
def get_upload(upload_id: str):
    """Get a specific uploaded file metadata"""
    uploads = load_uploads()
    for upload in uploads:
        if upload.get("id") == upload_id:
            return upload
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found")

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_upload(file: UploadFile = File(...)):
    """Upload a new file"""
    uploads = load_uploads()

    # Generate unique file name and ID
    file_id = f"upl_{int(datetime.utcnow().timestamp() * 1000)}"
    file_ext = Path(file.filename).suffix
    saved_filename = f"{file_id}{file_ext}"
    file_path = uploads_dir / saved_filename

    # Save file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Metadata
    upload_metadata = {
        "id": file_id,
        "original_filename": file.filename,
        "saved_filename": saved_filename,
        "content_type": file.content_type,
        "size": file_path.stat().st_size,
        "uploaded_at": datetime.utcnow().isoformat()
    }

    uploads.append(upload_metadata)
    save_uploads(uploads)

    return upload_metadata

@router.delete("/{upload_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_upload(upload_id: str):
    """Delete an uploaded file"""
    uploads = load_uploads()
    for upload in uploads:
        if upload.get("id") == upload_id:
            file_path = uploads_dir / upload["saved_filename"]
            if file_path.exists():
                file_path.unlink()
            uploads.remove(upload)
            save_uploads(uploads)
            return None

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Upload not found")
