import os
import re
from typing import List, Dict, Union
import uuid
from django.db import models
from django.db.models.options import Options

class BaseModel(models.Model):
    """Django model extension with UUID pk, name, and CUD timestamps"""
    id = models.UUIDField(primary_key=True, editable=False, auto_created=True, default=uuid.uuid4)
    name = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    _meta: Options
    class Meta:
        abstract = True


    def to_dict(self, exclude=None):
        """
        Convert model instance to dictionary, including inherited fields.
        If a field's value is another BaseModel instance, recursively call to_dict().
        :param exclude: Optional list of field names to exclude.
        :return: Dictionary representation of the model instance.
        """
        exclude = set(exclude or [])
        data = {}

        for field in self._meta.get_fields():
            if field.name in exclude:
                continue

            value = getattr(self, field.name)

            if isinstance(value, BaseModel):
                # Recursively call to_dict() on related BaseModel instances
                data[field.name] = value.to_dict()
            elif field.is_relation and field.many_to_one:
                # Include foreign key ID instead of the whole object (if not BaseModel)
                data[field.name + "_id"] = value.id if value else None
            elif field.concrete:
                data[field.name] = value

        return data


def ensure_file(output_path: str):
    script_dir = os.path.dirname(os.path.realpath(__file__))  # `realpath()` resolves symlinks
    output_path = os.path.abspath(os.path.join(script_dir, output_path))
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    if not os.path.exists(output_path):
        open(output_path, 'w').close()

    return output_path


def resolve_base_path(base_path: str) -> str:
    """Resolve `base_path` to an absolute path based on its prefix."""
    if not base_path:
        raise ValueError("base_path is required")

    script_dir = os.path.dirname(os.path.realpath(__file__))  # Current script's directory
    project_root = os.path.abspath(os.path.join(script_dir, "../..", ".."))  # Move up to solution_dir

    if base_path.startswith("./"):
        # Resolve relative path to the current script's directory
        return os.path.abspath(os.path.join(script_dir, base_path[2:]))

    elif base_path.startswith("../"):
        # Resolve relative path to the parent of the current script's directory
        return os.path.abspath(os.path.join(script_dir, base_path))

    elif base_path.startswith("~/"):
        # Replace `~` with the parent of the Django project root
        return os.path.abspath(os.path.join(project_root, base_path[2:]))

    else:
        # If no special prefix, return as is
        return base_path


def parse_ts_import(base_path: str, ts_imports: List[Dict[str, Union[str, List[str], None]]], ts_import):
    if not isinstance(ts_import, tuple) or not (1 <= len(ts_import) <= 3):
        raise ValueError(f"Invalid ts_import format': {ts_import}")

    module_path = ts_import[0].replace("~", base_path)
    export_name = ts_import[1] if len(ts_import) > 1 else None
    default_export = ts_import[2] if len(ts_import) > 2 else None

    # Check if module_path is already present
    existing_import = next((imp for imp in ts_imports if imp["path"] == module_path), None)

    if existing_import:
        # Merge export names
        if export_name and export_name not in existing_import["names"]:
            existing_import["names"].append(export_name)
        # Set default export if it's not already set
        if default_export and existing_import["default"] is None:
            existing_import["default"] = default_export
    else:
        # If not found, add a new entry
        ts_imports.append({
            "path": module_path,
            "names": [export_name] if export_name else [],
            "default": default_export
        })

def parse_django_url(url_pattern: str) -> str:
    """Converts Django URL pattern to TypeScript string interpolation."""
    return re.sub(r"<(?:\w+:)?(\w+)>", r"${params.\1}", url_pattern).replace("'", "")