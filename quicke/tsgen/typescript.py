from quicke.tsgen.endpoints import quickeEndpoints
from quicke.tsgen.models import quickeModels
from quicke.lib import BaseModel, resolve_base_path

from typing import TypedDict, Optional, Tuple, List, Type
from django.urls import URLPattern


class TypeScriptOptions(TypedDict):
    base_path: Optional[str]
    models: Tuple[str, List[Type[BaseModel]]]
    endpoints: Tuple[str, List[URLPattern]]


def generate_typescript(options: TypeScriptOptions) -> List[URLPattern]:
    base_path = options.get("base_path", "")
    if not base_path:
        raise ValueError("base_path is required")
    if not base_path.startswith("../") and not base_path.startswith("~/"):
        raise ValueError("base_path must start with '../' or '~/'")

    base_path = resolve_base_path(base_path)

    idx = base_path.rfind('/src/')
    if idx < 0:
        idx = base_path.rfind('\\src\\')

    frontend_app_path = base_path[idx:].replace('\\', '/').replace('/src/', '@/')

    models_path, models = options.get("models", (None, []))
    if models_path:
        if not models_path.endswith(".ts"):
            raise TypeError("models_path point to a '.ts' file")

        models_path = models_path.replace("~", base_path)
        quickeModels(models, {"base_path": frontend_app_path}).generate_typescript(models_path)

    endpoints_path, urlpatterns = options.get("endpoints", (None, []))
    if endpoints_path:
        if not endpoints_path.endswith(".ts"):
            raise TypeError("endpoints_path point to a '.ts' file")

        endpoints_path = endpoints_path.replace("~", base_path)
        quickeEndpoints(urlpatterns, {"base_path": frontend_app_path}).write_ts_to_file(endpoints_path)

    return urlpatterns
