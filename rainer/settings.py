import json
import os

DEFAULT_GPT_MODEL = "gpt-4o-mini"


rainer_projects = os.getenv("RAINER_PROJECTS", "")

RAINER_PROJECTS = {
    p.split(",")[0]: p.split(",")[1]
    for p in rainer_projects.split(";")
}

EXCLUDED_DIRS = {
    "__pycache__",
    ".idea",
    ".vscode",
    ".pytest_cache",
    ".mypy_cache",
    ".git",
    ".venv",
    "env",
    "venv",
    "node_modules",
    "migrations",
    "op_results"
}

EXCLUDED_FILE_EXTENSIONS = {
    ".pyc",
    ".pyo",
    ".env"
}

EXCLUDED_FILE_NAMES = {
    ".DS_Store",
    "Thumbs.db",
    ".env"
}