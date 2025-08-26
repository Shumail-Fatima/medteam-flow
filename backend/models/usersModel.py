from pydantic import BaseModel, Field
from typing import List, Optional

class User(BaseModel):
    id: str = Field(default_factory=str)
    name: str
    username: str
    email: str
    password: str
    roleId: int
    roleName: str
    createdAt: str
    specialtyId: Optional[str] = None

class Users(BaseModel):
    users: List[User] = Field(..., alias="Users")
    class Config: 
        populate_by_name = True