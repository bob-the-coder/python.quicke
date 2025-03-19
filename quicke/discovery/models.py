import importlib
import inspect
from types import ModuleType
from typing import Dict, List, Tuple, TypedDict, get_type_hints, Any

from django.contrib.admin import ModelAdmin
from django.db import models
from django.contrib import admin

from quicke.util import merge_imports


class ModelDiscoveryResult(TypedDict):
    """Explicitly defines the return type for discover_models."""
    imports: List[Tuple[str, List[str]]]
    """List of TypeScript imports where each tuple represents (import_path, [imported_names])."""
    models: Dict[str, Dict[str, str]]
    """Mapping of model names to their TypeScript field definitions."""


def discover_models(module: ModuleType) -> ModelDiscoveryResult:
    """Discover decorated models (Django or plain Python) within the given module and generate TypeScript mappings."""

    if not isinstance(module, ModuleType):
        raise TypeError(f"Expected a module, got {type(module).__name__}")

    # Load models.py dynamically
    try:
        models_module = importlib.import_module(f"{module.__name__}.models")
    except ModuleNotFoundError:
        return {"imports": [], "models": {}}

    imports: List[Tuple[str, List[str]]] = []
    model_mappings = {}

    for attr_name in dir(models_module):
        model_cls = getattr(models_module, attr_name)

        # Only process decorated models (either Django models or basic classes)
        if not hasattr(model_cls, "model_metadata"):
            continue

        metadata = model_cls.model_metadata or {}
        model_name = metadata.get("name", model_cls.__name__)
        exclude_fields = set(metadata.get("exclude_fields", []))
        model_imports = metadata.get("imports", [])

        # Collect imports in the new format
        imports.extend(model_imports)

        map_params = model_cls, metadata, exclude_fields
        field_mappings = map_django_model(map_params) if issubclass(model_cls, models.Model) else \
            map_python_class(map_params)

        model_mappings[model_name] = field_mappings

    return {
        "imports": merge_imports(imports),  # Merging new import format
        "models": model_mappings
    }


def find_field_default(metadata, field_name):
    # Check for explicit field type overrides
    if "fields" in metadata and field_name in metadata["fields"]:
        return metadata["fields"][field_name]["type"]


def map_django_model(map_params) -> Dict[str, str]:
    model_cls, metadata, exclude_fields = map_params
    field_mappings: Dict[str, str] = {}

    if model_cls not in admin.site._registry:
        admin.site.register(model_cls, ModelAdmin)

    for field in model_cls._meta.get_fields():
        if field.name in exclude_fields:
            continue  # Skip excluded fields

        # Infer TypeScript types based on Django field types
        field_mappings[field.name] = find_field_default(metadata, field.name) or map_django_field(field)

    return field_mappings

def map_django_field(field) -> str:
    """Map Django field types to TypeScript types."""
    if isinstance(field, (models.CharField, models.TextField)):
        return "string"
    elif isinstance(field, (models.IntegerField, models.FloatField, models.DecimalField)):
        return "number"
    elif isinstance(field, models.BooleanField):
        return "boolean"
    elif isinstance(field, models.DateTimeField):
        return "Date"
    elif isinstance(field, models.UUIDField):
        return "string"
    elif isinstance(field, models.JSONField):
        return "unknown"
    elif isinstance(field, models.ForeignKey):
        return f"{field.related_model.__name__} | undefined"
    elif isinstance(field, (models.ManyToManyField, models.ForeignObjectRel)):
        return f"{field.related_model.__name__}[]"
    else:
        return "unknown"


def map_python_class(map_params) -> Dict[str, str]:
    model_cls, metadata, exclude_fields = map_params
    field_mappings: Dict[str, str] = {}
    type_hints = get_type_hints(model_cls)

    # Extract class attributes (including those without type hints)
    for field_name, field_value in inspect.getmembers(model_cls):
        if field_name == "model_metadata":
            continue  # Skip model_metadata added by decorator

        if field_name.startswith("__") or inspect.ismethod(field_value):
            continue  # Skip dunder methods and class methods

        if field_name in exclude_fields:
            continue  # Skip excluded fields

        field_mappings[field_name] = find_field_default(metadata, field_name) or \
                                     map_python_type(type_hints[field_name]) if field_name in type_hints else \
            infer_type_from_value(field_value)

    return field_mappings

def map_python_type(py_type) -> str:
    """Map Python type hints to TypeScript types."""
    type_mapping = {
        str: "string",
        int: "number",
        float: "number",
        bool: "boolean",
        list: "any[]",
        dict: "Record<string, any>",
    }
    return type_mapping.get(py_type, "unknown")  # Default to "unknown" if type is not mapped


def infer_type_from_value(value: Any) -> str:
    """Infer TypeScript type based on the default value of a class attribute."""
    if isinstance(value, str):
        return "string"
    elif isinstance(value, (int, float)):
        return "number"
    elif isinstance(value, bool):
        return "boolean"
    elif isinstance(value, list):
        return "any[]"
    elif isinstance(value, dict):
        return "Record<string, any>"
    elif value is None:
        return "unknown"
    return "unknown"  # Fallback for unrecognized types
