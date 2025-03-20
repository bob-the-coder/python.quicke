import importlib
import inspect
from types import ModuleType
from typing import Dict, List, Tuple, TypedDict, get_type_hints, Any

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


    all_classes = inspect.getmembers(models_module, inspect.isclass)

    # Filter only classes defined in this module (not imported)
    local_classes = {
        name: cls
        for name, cls in all_classes
        if cls.__module__ == models_module.__name__
    }

    for model_name, model_cls in local_classes.items():
        if not hasattr(model_cls, "__quicke_model_metadata__"):
            continue  # Skip non-decorated classes

        metadata = model_cls.__quicke_model_metadata__ or {}
        ts_model_name = metadata.get("name", model_name)
        exclude_fields = set(metadata.get("exclude_fields", []))
        model_imports = metadata.get("imports", [])

        # Collect imports
        imports.extend(model_imports)

        # Map model fields to TypeScript
        map_params = model_cls, metadata, exclude_fields

        if issubclass(model_cls, models.Model):
            # ✅ Auto-assign app_label dynamically before registering
            # Extract the app label from the module name (e.g., "parent.app" → "app")
            # app_label = module.__name__.split(".")[-1]
            # if not hasattr(model_cls._meta, "app_label") or model_cls._meta.app_label != app_label:
            #     print('y')
            #     model_cls._meta.app_label = app_label
            field_mappings = map_django_model(map_params)
        else:
            field_mappings = map_python_class(map_params)

        # Store TypeScript mapping
        model_mappings[ts_model_name] = field_mappings

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
        admin.site.register(model_cls)

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
        if field_name == "__quicke_model_metadata__":
            continue  # Skip metadata field added by decorator

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
