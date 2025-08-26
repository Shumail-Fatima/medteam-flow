from sys import prefix
from fastapi import APIRouter, HTTPException, status
from pathlib import Path
from typing import List
from models.tasksModel import Task, Tasks
from utils.fileHandler import read_json, write_json
from uuid import uuid4
from datetime import datetime

router = APIRouter(prefix="/tasks", tags=["tasks"])

tasks_file = Path(__file__).parents[2] / "mockServer" / "data" / "Tasks.json"

def load_tasks() -> List[dict]:
    """Load user from JSON file"""
    data = read_json(tasks_file)
    if isinstance(data, list):
        return data
    return data.get("Tasks", []) if isinstance(data, dict) else []

def save_tasks(tasks: List[dict]) -> None:
    """Save tasks to JSON file"""
    write_json(tasks_file, {"Tasks": tasks})

@router.get("/", response_model=List[Task])
def get_tasks():
    """Get all tasks"""
    tasks = load_tasks()
    return [Task(**t) for t in tasks]

@router.get("/{task_id}", response_model=Task)
def get_tasks(task_id: str):
    """Get a specific task by ID"""
    tasks = load_tasks()
    for task in tasks:
        if task.get("id") == task_id:
            return Task(**task)
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")


@router.post("/", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(task: Task):
    """Create a new task"""
    tasks = load_tasks()
    
    # Generate ID if not provided
    if not task.id:
        task.id = f"t_{int(datetime.utcnow().timestamp() * 1000)}"
    
    task_dict = task.dict()
    tasks.append(task_dict)
    save_tasks(tasks)
    
    return task

@router.put("/{task_id}", response_model=Task)
def update_task(task_id: str, task_update: Task):
    """Update an existing task"""
    tasks = load_tasks()
    
    for i, task in enumerate(tasks):
        if task.get("id") == task_id:
            # Update the appointment while preserving the ID
            updated_task = task_update.dict()
            updated_task["id"] = task_id
            tasks[i] = updated_task
            save_tasks(tasks)
            return Task(**updated_task)
    
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")


@router.delete("{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: str):
    """Delete an task"""
    tasks = load_tasks()
    initial_count = len(tasks)
    
    tasks = [t for t in tasks if t.get("id") != task_id]
    
    if len(tasks) == initial_count:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    save_tasks(tasks)
    return None