import importlib
import importlib.util
from django.conf import settings
from types import ModuleType
from typing import Dict, List, Tuple, Union, TypedDict

# Import the existing discovery functions
from quicke.discovery.models import discover_models
from quicke.discovery.endpoints import discover_endpoints
from quicke.util import merge_imports

APP_REGISTRY = {
    "apps": {}
}


class AppMetadata(TypedDict):
    """Defines metadata for a single apps with context-specific imports."""
    model_imports: List[Tuple[str, List[str]]]
    """TypeScript imports specific to models."""
    endpoint_imports: List[Tuple[str, List[str]]]
    """TypeScript imports specific to endpoints."""
    models: Dict[str, Dict[str, str]]
    """Discovered Django models mapped to TypeScript types."""
    endpoints: Dict[str, Dict[str, Union[str, List[str]]]]
    """Discovered Django endpoints mapped to TypeScript functions."""


class AppRegistry(TypedDict):
    """Registry of discovered apps, each with its own metadata."""
    apps: Dict[str, AppMetadata]
    """Dictionary where keys are apps names and values contain metadata."""


def discover_apps() -> AppRegistry:
    """Centralized discovery function for models and endpoints across all QUICKE_APPS."""

    quicke_apps: List[str] = getattr(settings, "QUICKE_APPS", [])
    registry: Dict[str, AppMetadata] = {}

    for app_name in quicke_apps:
        # Check if the module exists before attempting to import it
        if importlib.util.find_spec(app_name) is None:
            print(f"⚠️ Skipping '{app_name}' (module not found)")
            continue

        try:
            module: ModuleType = importlib.import_module(app_name)
        except ModuleNotFoundError:
            print(f"⚠️ Skipping '{app_name}' (import error)")
            continue

        # Discover models & endpoints
        model_data = discover_models(module)
        endpoint_data = discover_endpoints(module)

        # Store metadata separately for each apps with context-specific imports
        registry[app_name] = {
            "model_imports": merge_imports(model_data["imports"]),
            "endpoint_imports": merge_imports(endpoint_data["imports"]),
            "models": model_data["models"],
            "endpoints": endpoint_data["endpoints"],
        }

    return {"apps": registry}
