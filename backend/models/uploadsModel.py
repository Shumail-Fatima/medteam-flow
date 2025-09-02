from pydantic import BaseModel
from typing import Optional
from uuid import uuid4
from datetime import datetime

class Upload(BaseModel):
    id: str
    name: str
    type: str
    size: int
    path: str
    createdAt: str

    @staticmethod
    def create(file_name: str, content_type: str, size: int, path: str):
        return Upload(
            id=str(uuid4()),
            name=file_name,
            type=content_type,
            size=size,
            path=path,
            createdAt=datetime.utcnow().isoformat()
        )
