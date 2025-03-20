from django.urls import path
from django.conf import settings
import importlib
from rest_framework.views import APIView  # Import DRF's base APIView

from quicke.discovery.apps import discover_apps


def get_urlpatterns():
    """Generate urlpatterns dynamically after Django is fully loaded."""
    # Fetch discovered apps (only after Django is initialized)
    import quicke
    quicke.APP_REGISTRY = discover_apps()

    _urlpatterns = []
    for app_name, metadata in quicke.APP_REGISTRY["apps"].items():
        for endpoint_name, endpoint_data in metadata["endpoints"].items():
            django_url = endpoint_data["django_url"]

            # Dynamically import the corresponding view function/class
            try:
                module = importlib.import_module(f"{app_name}.endpoints")
                view = getattr(module, endpoint_name)
            except (ModuleNotFoundError, AttributeError):
                print(f"⚠️ Skipping endpoint '{endpoint_name}' in '{app_name}' (not found)")
                continue

            # Check if the view is a DRF APIView (class-based)
            if isinstance(view, type) and issubclass(view, APIView):
                view = view.as_view()  # Convert CBV to Django view format

            _urlpatterns.append(path(django_url, view))

    print(f"✅ Registered {len(_urlpatterns)} auto-discovered endpoints, including DRF views!")

    from quicke.tsgen.ts import generate_typescript
    if getattr(settings, "QUICKE_TS_AUTO_GENERATE", False):
        generate_typescript()

    return _urlpatterns


# Assign urlpatterns dynamically (executes only when requested)
urlpatterns = get_urlpatterns()
