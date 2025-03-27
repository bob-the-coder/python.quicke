import os
import shutil
from typing import Dict, Tuple, Union

from .types import RainerFile
from .settings import RAINER_PROJECTS, EXCLUDED_FILE_EXTENSIONS, EXCLUDED_FILE_NAMES, EXCLUDED_DIRS


def unpack_file_ref(file_ref: RainerFile) -> Tuple[str, str]:
    if isinstance(file_ref, Dict):
        project = file_ref.get("project", "")
        path = file_ref.get("path", "")
        return project, path
    
    project = file_ref.project or ""
    path = file_ref.path or ""
    return project, path


def build_nested_tree(base_dir: str) -> Dict[str, Union[str, Dict]]:
    tree = {}
    abs_base = os.path.abspath(base_dir)

    for root, dirs, files in os.walk(abs_base, topdown=True):
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

        rel_root = os.path.relpath(root, abs_base).replace("\\", "/")
        node = tree
        if rel_root != ".":
            for part in rel_root.split("/"):
                node = node.setdefault(part, {})

        files = [f for f in files if
                 f not in EXCLUDED_FILE_NAMES and os.path.splitext(f)[1] not in EXCLUDED_FILE_EXTENSIONS]

        for file in files:
            node[file] = os.path.join(rel_root, file) if rel_root != "." else file

    return tree


def replace_slashes(path: str) -> str:
    return path.replace("\\", "/")


def build_rainer_trees() -> Dict[str, Dict[str, Union[str, Dict]]]:
    return {
        project: {
            "__path__": replace_slashes(path),
            **build_nested_tree(replace_slashes(path)),
        }
        for project, path in RAINER_PROJECTS.items()
    }


def refresh_trees() -> None:
    global project_trees
    project_trees = build_rainer_trees()


def get_file_path(project: str, relative_path: str) -> str:
    base_path = paths.get(project, "")

    return os.path.join(base_path, relative_path) if base_path else ""


def get_rainer_file_contents(project: str, relative_path: str) -> str:
    abs_path = get_file_path(project, relative_path)
    if abs_path and os.path.isfile(abs_path):
        with open(abs_path, "r", encoding="utf-8") as f:
            return f.read()
    return ""


def create_rainer_file(project: str, relative_path: str, text_content: str = "") -> None:
    base_path = paths.get(project, "")
    abs_path = os.path.join(base_path, relative_path) if base_path else ""
    if abs_path:
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(text_content)
        refresh_trees()


def update_rainer_file(project: str, relative_path: str, new_content: str) -> None:
    base_path = paths.get(project, "")
    abs_path = os.path.join(base_path, relative_path) if base_path else ""
    if abs_path and os.path.isfile(abs_path):
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(new_content)


def delete_rainer_file(project: str, relative_path: str) -> None:
    base_path = paths.get(project, "")
    abs_path = os.path.join(base_path, relative_path) if base_path else ""
    if abs_path and os.path.isfile(abs_path):
        os.remove(abs_path)
        refresh_trees()


def delete_rainer_directory(project: str, relative_path: str) -> None:
    base_path = paths.get(project, "")
    abs_path = os.path.join(base_path, relative_path) if base_path else ""
    if abs_path and os.path.isdir(abs_path):
        shutil.rmtree(abs_path)
        refresh_trees()


def create_rainer_directory(project: str, relative_path: str) -> None:
    base_path = paths.get(project, "")
    abs_path = os.path.join(base_path, relative_path) if base_path else ""
    if abs_path:
        os.makedirs(abs_path, exist_ok=True)
        refresh_trees()


project_trees = build_rainer_trees()
paths = {project: path for project, path in RAINER_PROJECTS.items()}
