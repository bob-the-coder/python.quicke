import re
from typing import TypedDict, List, Tuple, Dict, Optional, Union
from quicke.util import merge_imports


class TsEndpointMetadataOptions(TypedDict, total=False):
    method: str
    """HTTP method ("GET", "POST", etc.). Defaults to GET."""
    response_type: str
    """TypeScript return type"""
    query_params: List[str]
    """Optional URL Search params like ["sort", "count"]"""
    body_type: str
    """Expected request body type"""
    imports: List[Tuple[str, Union[str, List[str]]]]
    """List of tuples representing TypeScript imports (<import_path>, <import_names>)"""


class TsEndpointMetadata(TsEndpointMetadataOptions, total=False):
    django_url: str
    """Generated Django URL pattern"""
    ts_url: str
    """Generated TypeScript URL pattern"""
    route_params: Dict[str, Optional[str]]
    """Extracted route parameters from URL (e.g., {"id": "UUID"})"""


def extract_route_params(base_route: str) -> Dict[str, Optional[str]]:
    """Extract named route parameters and their types from Django-style URL patterns."""
    pattern = re.compile(r"<(?P<type>\w+):(?P<param>\w+)>|<(?P<param_only>\w+)>")

    extracted_params = {}

    for match in pattern.finditer(base_route):
        param_name = match.group("param") or match.group("param_only")
        param_type = match.group("type") if match.group("param") else None
        extracted_params[param_name] = param_type

    return extracted_params


def generate_ts_url(django_url: str) -> str:
    """Convert Django-style paths to TypeScript-style."""
    # Replace "<type:param>" → "{param}"
    ts_url = re.sub(r"<[\w\d_]+:([\w\d_]+)>", r"{\1}", django_url)

    # Replace "<param>" (no type) → "{param}"
    ts_url = re.sub(r"<([\w\d_]+)>", r"{\1}", ts_url)

    return ts_url

def endpoint(url: str, metadata: TsEndpointMetadataOptions):
    """Decorator for annotating Django views with TypeScript metadata."""

    # Extract route parameters dynamically
    route_params = extract_route_params(url)

    # Generate Django and TypeScript URLs
    django_url = url
    ts_url = generate_ts_url(django_url)

    # Create a copy of metadata with extracted route_params
    ep_metadata: TsEndpointMetadata = {
        **metadata,
        "django_url": django_url,
        "ts_url": ts_url,
        "route_params": route_params,
        "imports": merge_imports(metadata.get("imports", [])),
    }

    def decorator(func):
        func.__quicke_endpoint_metadata__ = ep_metadata
        return func

    return decorator
