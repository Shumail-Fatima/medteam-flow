import json
from pathlib import Path
from typing import Any


def read_json(file_path: Path) -> Any:
    if not file_path.exists():
        return []
    with open(file_path, "r") as f:
        return json.load(f)


def write_json(file_path: Path, data: dict) -> None:
    #file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)
