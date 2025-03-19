from typing import TypedDict, List, Tuple, Dict, Optional


class FieldMetadata(TypedDict, total=False):
    type: str  # TypeScript type for the field
    default: str  # Optional default value for TS


class ModelMetadata(TypedDict, total=False):
    imports: List[Tuple[str, str | List[str]]]
    """Global TypeScript imports for the model."""
    fields: Dict[str, FieldMetadata]
    """Optional per-field overrides."""
    exclude_fields: Optional[List[str]]


def model(metadata: Optional[ModelMetadata] = None):
    """Decorator for annotating Django models with TypeScript metadata."""

    def decorator(cls):
        cls.model_metadata = metadata or ModelMetadata()  # Attach metadata to the class
        return cls

    return decorator
