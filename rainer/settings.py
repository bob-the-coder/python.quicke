
DEFAULT_GPT_MODEL = "gpt-4o-mini"


RAINER_OPTIONS = {
    "backend": "apps",
    "frontend": "_frontend/src",
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
}

EXCLUDED_FILE_EXTENSIONS = {
    ".pyc",
    ".pyo",
}

EXCLUDED_FILE_NAMES = {
    ".DS_Store",
    "Thumbs.db",
}