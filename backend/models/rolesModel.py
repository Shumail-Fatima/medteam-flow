from pydantic import BaseModel, Field
from typing import List

class Role(BaseModel):
    id: str 
    name: str

class Roles(BaseModel):
    roles: List[Role] = Field(..., alias="Roles")
    class Config: 
        populate_by_name = True