import os
from typing import Dict, Tuple

from .types import RainerFile
from .settings import RAINER_OPTIONS, EXCLUDED_FILE_EXTENSIONS, EXCLUDED_FILE_NAMES, EXCLUDED_DIRS


def unpack_file_ref(file_ref: RainerFile) -> Tuple[str, str]:
    branch = file_ref.branch or ""
    path = file_ref.path or ""

    return branch, path

def build_backend_tree(base_dir: str) -> Dict[str, str]:
    tree = {}
    abs_base = os.path.abspath(base_dir)

    for root, dirs, files in os.walk(abs_base):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

        for file in files:
            if (
                file in EXCLUDED_FILE_NAMES
                or os.path.splitext(file)[1] in EXCLUDED_FILE_EXTENSIONS
            ):
                continue

            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, abs_base).replace("\\", "/")
            tree[rel_path] = full_path

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
def build_rainer_trees() -> Dict[str, Dict[str, str]]:
    new_trees = {
        "backend": {
            **build_backend_tree(RAINER_OPTIONS["backend"]),
            "__path__": RAINER_OPTIONS["backend"],
        },
        "frontend": {
            **build_frontend_tree(RAINER_OPTIONS["frontend"]),
            "__path__": RAINER_OPTIONS["frontend"],
        }
    }

    return new_trees


# 10. Ensure migrations are created and applied
def ensure_migrations(app_name = "rainer") -> None:
    from django.db import connections
    from django.core.management import call_command
    from django.db.migrations.executor import MigrationExecutor


    """Ensure that migrations are created and applied for the given Django app."""
    try:
        # Get the connection to the database
        connection = connections['default']

        # Make migrations for the app if needed
        print(f"Making migrations for the app: {app_name}...")
        call_command("makemigrations", app_name)

        # Initialize MigrationExecutor to check the current status of migrations
        executor = MigrationExecutor(connection)

        # Get applied migrations
        applied_migrations = {migration[0]: migration[1] for migration in executor.loader.applied_migrations}

        # Get the migrations to be applied
        migration_plan = executor.migration_plan(executor.loader.graph.nodes)

        if migration_plan:
            print(f"Unapplied migrations found for {app_name}. Applying migrations...")
            # Apply unapplied migrations
            call_command("migrate", app_name)
        else:
            print(f"No unapplied migrations for {app_name}.")

    except Exception as e:
        print(f"Error occurred while checking or applying migrations for {app_name}: {e}")


trees = build_rainer_trees()
paths = {
    "backend": os.path.abspath(RAINER_OPTIONS["backend"]),
    "frontend": os.path.abspath(RAINER_OPTIONS["frontend"]),
}

# 3b. Refresh trees by rebuilding them
def refresh_trees() -> None:
    global trees
    ensure_migrations()
    trees = build_rainer_trees()


# 4. File content reader
def get_rainer_file_contents(branch: str, relative_path: str) -> str:
    branch = trees[branch]
    path = branch.get(relative_path)
    if path and os.path.isfile(path):
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    return ""


def get_rainer_file_path(branch: str, relative_path: str):
    base_path = paths[branch]
    return os.path.join(base_path, relative_path)


# 5. Create file in branch
def create_rainer_file(branch: str, relative_path: str, text_content: str = "") -> None:
    abs_path = get_rainer_file_path(branch, relative_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    with open(abs_path, "w", encoding="utf-8") as f:
        f.write(text_content)

    refresh_trees()


# 6. Update file contents in branch
def update_rainer_file(branch: str, relative_path: str, new_content: str) -> None:
    abs_path = get_rainer_file_path(branch, relative_path)
    if os.path.isfile(abs_path):
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(new_content)


import shutil


# 7. Delete a file in branch
def delete_rainer_file(branch: str, relative_path: str) -> None:
    base_path = paths[branch]
    abs_path = os.path.join(base_path, relative_path)
    if os.path.isfile(abs_path):
        os.remove(abs_path)

    refresh_trees()


# 8. Delete a directory (and its contents) in branch
def delete_rainer_directory(branch: str, relative_path: str) -> None:
    base_path = paths[branch]
    abs_path = os.path.join(base_path, relative_path)
    if os.path.isdir(abs_path):
        shutil.rmtree(abs_path)

    refresh_trees()


# 9. Create a directory in branch
def create_rainer_directory(branch: str, relative_path: str) -> None:
    base_path = paths[branch]
    abs_path = os.path.join(base_path, relative_path)
    os.makedirs(abs_path, exist_ok=True)

    refresh_trees()

