import importlib
import inspect
from types import ModuleType
from typing import Dict, List, Tuple, TypedDict, get_type_hints, Any

from django.db import models

from quicke.util import merge_imports


class ModelDiscoveryResult(TypedDict):
    imports: List[Tuple[str, List[str]]]
    models: Dict[str, Dict[str, str]]


def discover_models(module: ModuleType) -> ModelDiscoveryResult:
    if not isinstance(module, ModuleType):
        raise TypeError(f"Expected a module, got {type(module).__name__}")

    try:
        models_module = importlib.import_module(f"{module.__name__}.models")
    except ModuleNotFoundError:
        return {"imports": [], "models": {}}

    imports: List[Tuple[str, List[str]]] = []
    model_mappings = {}

    all_classes = inspect.getmembers(models_module, inspect.isclass)

    for model_name, model_cls in all_classes:
        if not hasattr(model_cls, "__quicke_model_metadata__"):
            continue

        metadata = model_cls.__quicke_model_metadata__ or {}
        ts_model_name = metadata.get("name", model_name)
        exclude_fields = set(metadata.get("exclude_fields", []))
        model_imports = metadata.get("imports", [])

        imports.extend(model_imports)

        map_params = model_cls, metadata, exclude_fields

        if issubclass(model_cls, models.Model):
            field_mappings = map_django_model(map_params)
        else:
            field_mappings = map_python_class(map_params)

        model_mappings[ts_model_name] = field_mappings

    return {
        "imports": merge_imports(imports),
        "models": model_mappings
    }


def field_type_from_metadata(metadata, field_name):
    if "fields" in metadata and field_name in metadata["fields"]:
        return metadata["fields"][field_name]["type"]


def map_django_model(map_params) -> Dict[str, str]:
    model_cls, metadata, exclude_fields = map_params
    field_mappings: Dict[str, str] = {}

    for field in model_cls._meta.get_fields():
        if field.name in exclude_fields:
            continue

        field_mappings[field.name] = field_type_from_metadata(metadata, field.name) or map_django_field(field)

    return field_mappings


def map_django_field(field) -> str:
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

    for field_name, field_type in type_hints.items():
        if field_name == "__quicke_model_metadata__":
            continue
        if field_name.startswith("__"):
            continue
        if field_name in exclude_fields:
            continue

        field_mappings[field_name] = field_type_from_metadata(metadata, field_name) or \
                                     map_python_type(type_hints[field_name])

    return field_mappings


def map_python_type(py_type) -> str:
    type_mapping = {
        str: "string",
        int: "number",
        float: "number",
        bool: "boolean",
        list: "any[]",
        dict: "Record<string, any>",
    }
    return type_mapping.get(py_type, "unknown")


def infer_type_from_value(value: Any) -> str:
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
    return "unknown"
