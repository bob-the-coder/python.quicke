import importlib
import importlib.util
from django.conf import settings
from types import ModuleType
from typing import Dict, List, Tuple, Union, TypedDict

# Import the existing discovery functions
from quicke.discovery.models import discover_models
from quicke.discovery.endpoints import discover_endpoints
from quicke.util import merge_imports



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
    n_models: int
    n_models_imports: int
    n_endpoints: int
    n_endpoints_imports: int

APP_REGISTRY: Dict[str, AppMetadata] = {}


def discover_apps():
    """Centralized discovery function for models and endpoints across all QUICKE_APPS."""

    quicke_apps: List[str] = getattr(settings, "QUICKE_APPS", [])

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

        model_imports = merge_imports(model_data["imports"])
        endpoint_imports = merge_imports(endpoint_data["imports"])
        models = model_data["models"]
        endpoints = endpoint_data["endpoints"]

        # Store metadata separately for each apps with context-specific imports
        APP_REGISTRY[app_name] = {
            "model_imports": model_imports,
            "endpoint_imports": endpoint_imports,
            "models": models,
            "endpoints": endpoints,
            "n_models": len(models),
            "n_models_imports": len(model_imports),
            "n_endpoints": len(endpoints),
            "n_endpoints_imports": len(endpoint_imports),
        }

    output_discovery()


def output_discovery():
    from quicke import APP_REGISTRY
    apps_data = [
        {
            "app_name": app_name,
            "n_models": app["n_models"],
            "n_models_imports": app["n_models_imports"],
            "n_endpoints": app["n_endpoints"],
            "n_endpoints_imports": app["n_endpoints_imports"],
        }
        for app_name, app in APP_REGISTRY.items()
    ]

    # Determine max column widths
    column_widths = {
        key: max(len(str(data[key])) for data in apps_data)
        for key in apps_data[0]
    }

    # Print formatted output
    for data in apps_data:
        print(
            f"✅  {data['app_name']:{column_widths['app_name']}} | "
            f"Models: {data['n_models']:{column_widths['n_models']}} "
            f"({data['n_models_imports']:{column_widths['n_models_imports']}} imports) | "
            f"Endpoints: {data['n_endpoints']:{column_widths['n_endpoints']}} "
            f"({data['n_endpoints_imports']:{column_widths['n_endpoints_imports']}} imports)"
        )
