# rainer_utils.py

import os
from typing import Dict

RAINER_OPTIONS = {
    "backend": "apps",
    "frontend": "frontend/src/apps",
}


# 1. Backend-specific tree builder
def build_backend_tree(base_dir: str) -> Dict[str, str]:
    tree = {}
    abs_base = os.path.abspath(base_dir)
    for entry in os.scandir(abs_base):
        if entry.is_dir() and entry.name != "__pycache__":
            for target_file in ("endpoints.py", "models.py"):
                target_path = os.path.join(entry.path, target_file)
                if os.path.isfile(target_path):
                    rel_path = os.path.relpath(target_path, abs_base).replace("\\", "/")
                    tree[rel_path] = target_path
    return tree


# 2. Frontend keeps full recursive scan
def build_frontend_tree(base_dir: str) -> Dict[str, str]:
    tree = {}
    abs_base = os.path.abspath(base_dir)
    for root, _, files in os.walk(abs_base):
        for file in files:
            abs_path = os.path.join(root, file)
            rel_path = os.path.relpath(abs_path, abs_base).replace("\\", "/")
            tree[rel_path] = abs_path
    return tree


# 3. Unified tree builder for both branches
def build_rainer_tree() -> Dict[str, Dict[str, str]]:
    return {
        "backend": build_backend_tree(RAINER_OPTIONS["backend"]),
        "frontend": build_frontend_tree(RAINER_OPTIONS["frontend"]),
    }


trees = build_rainer_tree()
paths = {
    "backend": os.path.abspath(RAINER_OPTIONS["backend"]),
    "frontend": os.path.abspath(RAINER_OPTIONS["frontend"]),
}


# 4. File content reader
def get_file_contents(branch: str, relative_path: str) -> str:
    branch = trees[branch]
    path = branch.get(relative_path)
    if path and os.path.isfile(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    return ""


# 5. Create file in branch
def create_file(branch: str, relative_path: str, text_content: str = "") -> None:
    base_path = paths[branch]
    abs_path = os.path.join(base_path, relative_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    with open(abs_path, "w", encoding="utf-8") as f:
        f.write(text_content)


# 6. Update file contents in branch
def update_file(branch: str, relative_path: str, new_content: str) -> None:
    base_path = paths[branch]
    abs_path = os.path.join(base_path, relative_path)
    if os.path.isfile(abs_path):
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(new_content)


import shutil


# 7. Delete a file in branch
def delete_file(branch: str, relative_path: str) -> None:
    base_path = paths[branch]
    abs_path = os.path.join(base_path, relative_path)
    if os.path.isfile(abs_path):
        os.remove(abs_path)


# 8. Delete a directory (and its contents) in branch
def delete_directory(branch: str, relative_path: str) -> None:
    base_path = paths[branch]
    abs_path = os.path.join(base_path, relative_path)
    if os.path.isdir(abs_path):
        shutil.rmtree(abs_path)


# 9. Create a directory in branch
def create_directory(branch: str, relative_path: str) -> None:
    base_path = paths[branch]
    abs_path = os.path.join(base_path, relative_path)
    os.makedirs(abs_path, exist_ok=True)
