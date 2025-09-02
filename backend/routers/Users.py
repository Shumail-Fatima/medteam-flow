from sys import prefix
from fastapi import APIRouter, HTTPException, status
from pathlib import Path
from typing import List
from models.usersModel import User, Users
from utils.fileHandler import read_json, write_json
from uuid import uuid4
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

users_file = Path(__file__).parents[2] / "mockServer" / "data" / "Users.json"

def load_users() -> List[dict]:
    """Load users from JSON file"""
    data = read_json(users_file)
    if isinstance(data, list):
        return data
    return data.get("Users", []) if isinstance(data, dict) else []

def save_users(users: List[dict]) -> None:
    """Save users to JSON file"""
    write_json(users_file, {"Users": users})

@router.get("/", response_model=List[User])
def get_users():
    """Get all users"""
    users = load_users()
    return [User(**u) for u in users]

@router.get("/{user_id}", response_model=User)
def get_user(user_id: str):
    """Get a specific user by ID"""
    users = load_users()
    for user in users:
        if user.get("id") == user_id:
            return User(**user)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(user: User):
    """Create a new user"""
    users = load_users()
    
    # Generate ID if not provided
    if not user.id:
        user.id = f"u_{int(datetime.utcnow().timestamp() * 1000)}"
    
    user_dict = user.dict()
    users.append(user_dict)
    save_users(users)
    
    return user

@router.put("/{user_id}", response_model=User)
def update_user(user_id: str, user_update: User):
    """Update an existing user"""
    users = load_users()
    
    for i, user in enumerate(users):
        if user.get("id") == user_id:
            # Update the user while preserving the ID
            updated_user = user_update.dict()
            updated_user["id"] = user_id
            users[i] = updated_user
            save_users(users)
            return User(**updated_user)
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: str):
    """Delete an user"""
    users = load_users()
    initial_count = len(users)
    
    users = [u for u in users if u.get("id") != user_id]
    
    if len(users) == initial_count:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    save_users(users)
    return None