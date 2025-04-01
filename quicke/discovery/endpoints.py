import importlib
from types import ModuleType
from typing import List, Dict, Tuple, Union, TypedDict
from quicke.util import merge_imports


class EndpointDiscoveryResult(TypedDict):
    """Defines the return structure for discover_endpoints()."""
    imports: List[Tuple[str, List[str]]]
    """List of TypeScript imports where each tuple represents (import_path, [imported_names])."""
    endpoints: Dict[str, Dict[str, Union[str, List[str]]]]
    """Mapping of endpoint names to their TypeScript metadata."""


def discover_endpoints(module: ModuleType) -> EndpointDiscoveryResult:
    """Discover decorated endpoints within the given module (scans `endpoints.py`)."""

    if not isinstance(module, ModuleType):
        raise TypeError(f"Expected a module, got {type(module).__name__}")

    # Load `endpoints.py` dynamically
    try:
        endpoints_module = importlib.import_module(f"{module.__name__}.endpoints")
    except ModuleNotFoundError:
        return {"imports": [], "endpoints": {}}

    imports: List[Tuple[str, Union[str, List[str]]]] = []
    print(imports)
    endpoint_mappings: Dict[str, Dict[str, Union[str, List[str]]]] = {}

    for attr_name in dir(endpoints_module):
        view_func = getattr(endpoints_module, attr_name)

        # Only process functions (not classes, modules, etc.)
        if not callable(view_func):
            continue

        # Only process decorated endpoints
        if not hasattr(view_func, "__quicke_endpoint_metadata__"):
            continue

        metadata = view_func.__quicke_endpoint_metadata__
        endpoint_name = view_func.__name__
        route_params = metadata.get("route_params", {})
        ts_imports = metadata.get("imports", [])

        # Generate final TypeScript metadata structure
        endpoint_mappings[endpoint_name] = {
            "method": metadata.get("method", "GET"),
            "response_type": metadata.get("response_type", "any"),
            "django_url": metadata.get("django_url", ""),
            "ts_url": metadata.get("ts_url", ""),
            "route_params": list(route_params.keys()),
            "query_params": metadata.get("query_params", []),
            "body_type": metadata.get("body_type", ""),
        }

        # Collect imports for merging
        imports.extend(ts_imports)

    return {
        "imports": merge_imports(imports),  # Merging new import format
        "endpoints": endpoint_mappings,
    }
