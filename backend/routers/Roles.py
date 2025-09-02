from sys import prefix
from fastapi import APIRouter, HTTPException, status
from pathlib import Path
from typing import List
from models.rolesModel import Role, Roles
from utils.fileHandler import read_json, write_json
from uuid import uuid4
from datetime import datetime

router = APIRouter(prefix="/roles", tags=["roles"])

roles_file = Path(__file__).parents[2] / "mockServer" / "data" / "Roles.json"

def load_roles() -> List[dict]:
    """Load role from JSON file"""
    data = read_json(roles_file)
    if isinstance(data, list):
        return data
    return data.get("Roles", []) if isinstance(data, dict) else []

def save_roles(roles: List[dict]) -> None:
    """Save roles to JSON file"""
    write_json(roles_file, {"Roles": roles})

@router.get("/", response_model=List[Role])
def get_roles():
    """Get all roles"""
    roles = load_roles()
    return [Role(**r) for r in roles]

@router.get("/{role_id}", response_model=Role)
def get_role(role_id: str):
    """Get a specific role by ID"""
    roles = load_roles()
    for role in roles:
        if role.get("id") == role_id:
            return Role(**role)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")


@router.post("/", response_model=Role, status_code=status.HTTP_201_CREATED)
def create_role(role: Role):
    """Create a new role"""
    roles = load_roles()
    
    # Generate ID if not provided
    if not role.id:
        role.id = f"r_{int(datetime.utcnow().timestamp() * 1000)}"
    
    role_dict = role.dict()
    roles.append(role_dict)
    save_roles(roles)
    
    return role

@router.put("/{role_id}", response_model=Role)
def update_role(role_id: str, role_update: Role):
    """Update an existing role"""
    roles = load_roles()
    
    for i, role in enumerate(roles):
        if role.get("id") == role_id:
            # Update the role while preserving the ID
            updated_role = role_update.dict()
            updated_role["id"] = role_id
            roles[i] = updated_role
            save_roles(roles)
            return Role(**updated_role)
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")


@router.delete("{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(role_id: str):
    """Delete an role"""
    roles = load_roles()
    initial_count = len(roles)
    
    roles = [r for r in roles if r.get("id") != role_id]
    
    if len(roles) == initial_count:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    
    save_roles(roles)
    return None