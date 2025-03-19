import os
from django.urls import URLPattern
from typing import List, Dict, Union

from quicke.tsgen.codegen import generate_ts_imports
from quicke.lib import ensure_file, parse_ts_import, parse_django_url


class quickeEndpoints:
    def __init__(self, urlpatterns, options: Dict = dict):
        self.urlpatterns = urlpatterns
        self.ts_imports: List[Dict[str, Union[str, List[str], None]]] = []
        self.base_path = options.get("base_path", "")
        print(f"Total URL patterns found: {len(urlpatterns)}")

    def _get_ts_imports(self, func):
        """Extract and store TypeScript imports from function metadata."""
        if not hasattr(func, "ts_endpoint"):
            return

        ts_meta = func.ts_endpoint
        imports = list(ts_meta.get("imports", []))

        for ts_import in imports:
            if not ts_import:
                continue

            parse_ts_import(self.base_path, self.ts_imports, ts_import)


    def generate_ts_endpoints(self) -> str:
        """Generate TypeScript API functions from Django URL patterns."""
        ts_functions = []

        for pattern in self.urlpatterns:
            if isinstance(pattern, URLPattern):
                view_func = pattern.callback

                if hasattr(view_func, "ts_endpoint"):
                    ts_meta = view_func.ts_endpoint
                    ts_func_name = f"endpoint_{view_func.__name__}"
                    method = ts_meta.get("method", "GET").upper()
                    response_type = ts_meta.get("response_type", "any")
                    route_params = ts_meta.get("route_params", [])
                    query_params = ts_meta.get("query_params", [])
                    body_type = ts_meta.get("body_type", None)  # POST requires a body

                    # Extract URL path dynamically
                    path = pattern.pattern.describe().strip("^$")
                    ts_url = parse_django_url(path)

                    # Register TypeScript imports
                    self._get_ts_imports(view_func)

                    # Handle query params if needed
                    query_string = '"?" + new URLSearchParams(query).toString()' if query_params else ""

                    # Handle request body for POST
                    body_arg = f"body: {body_type}" if body_type else ""
                    fetch_args = f"""{{
        method: "{method}",
        headers: {{ "Content-Type": "application/json" }}{",\n        body: JSON.stringify(body)" if body_type else ""}
    }}""" if method in ["POST", "DELETE"] else ""

                    # Build function signature
                    param_input = f"params: {{ {', '.join(f'{p}: string' for p in route_params)} }}" if route_params else ""
                    query_input = f"query: {{ {', '.join(f'{q}: string' for q in query_params)} }}" if query_params else ""
                    body_input = f"{body_arg}" if body_type else ""

                    # Combine inputs
                    params_list = [p for p in [param_input, query_input, body_input] if p]
                    function_args = ", ".join(params_list)

                    # Build TypeScript function
                    ts_func = f"""
export const {ts_func_name} = async ({function_args}): Promise<{response_type}> => {{
    return fetchJSON(`/{ts_url}`{f' + {query_string}' if query_params else ''}{', ' + fetch_args if fetch_args else ''});
}};
"""
                    ts_functions.append(ts_func.strip())

        ts_imports = generate_ts_imports(self.ts_imports)
        return f"{ts_imports}\n\n" + "\n\n".join(ts_functions)

    def write_ts_to_file(self, output_path: str):
        output_path = ensure_file(output_path)

        ts_code = self.generate_ts_endpoints()

        # Ensure the directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        # Write to the file
        with open(output_path, "w", encoding="utf-8") as ts_file:
            ts_file.write(f"""import {{ fetchJSON }} from './fetch';

{ts_code}""")

        print(f"✅ TypeScript API file saved to {output_path}")

        return output_path
