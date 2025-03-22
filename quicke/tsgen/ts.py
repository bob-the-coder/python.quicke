from typing import List, Union
from django.conf import settings
from quicke.lib import resolve_base_path
from quicke.tsgen.snippets import FETCH_JSON
import os

TS_MODELS_FILENAME = "models.ts"
TS_ENDPOINTS_FILENAME = "endpoints.ts"
TS_FETCH_JSON_FILENAME = "fetchJSON"
TS_OUTPUT_DIR = getattr(settings, "QUICKE_TS_OUTPUT_DIR", "")


def generate_typescript():
    """Generate TypeScript models and API endpoints for each discovered app."""
    from quicke import APP_REGISTRY

    base_output_dir = resolve_base_path(TS_OUTPUT_DIR)

    # Generate fetchJSON.ts once at the base output directory
    generate_fetch_json(base_output_dir)

    for app_name, app in APP_REGISTRY.items():
        app_output_dir = os.path.join(base_output_dir, app_name.replace(".", "/"))

        # Ensure app directory exists
        os.makedirs(app_output_dir, exist_ok=True)

        # Generate models.ts
        if not app["n_models"]:
            print(f"⚠️ No models discovered in {app_name}. Skipping code generation")
        else:
            generate_typescript_models(app["models"], app["model_imports"], app_output_dir)

        # Generate endpoints.ts
        if not app["n_endpoints"]:
            print(f"⚠️ No endpoints discovered in {app_name}. Skipping code generation")
        else:
            generate_typescript_endpoints(app["endpoints"], app["endpoint_imports"], app_output_dir, base_output_dir)


def generate_fetch_json(output_dir: str):
    """Generate the fetchJSON utility file in the base output directory."""
    ts_path = os.path.join(output_dir, TS_FETCH_JSON_FILENAME)
    write_ts_file(ts_path, FETCH_JSON)


def generate_typescript_models(models: dict, model_imports: list, output_dir: str):
    """Generate TypeScript model definitions with relative imports."""
    ts_code = ["// Auto-generated TypeScript models\n"]

    # Adjust import paths relative to the app folder
    model_imports = adjust_import_paths(model_imports, output_dir)

    # Generate imports
    ts_code.append(generate_ts_imports(model_imports))

    for model_name, fields in models.items():
        ts_code.append(f"export type {model_name} = {{")
        for field_name, field_type in fields.items():
            ts_code.append(f"  {field_name}: {field_type};")  # No default values
        ts_code.append("}\n")

    ts_path = os.path.join(output_dir, TS_MODELS_FILENAME)
    write_ts_file(ts_path, "\n".join(ts_code))


def generate_typescript_endpoints(endpoints: dict, endpoint_imports: list, output_dir: str, base_output_dir: str):
    """Generate TypeScript API functions with relative imports."""
    ts_code = ["// Auto-generated TypeScript API functions\n"]

    # Adjust import paths relative to the app folder
    endpoint_imports = adjust_import_paths(endpoint_imports, output_dir)

    # Compute the relative import path for fetchJSON.ts
    fetch_json_import = get_relative_import(output_dir, base_output_dir, TS_FETCH_JSON_FILENAME)
    ts_code.append(f"import {{ fetchJSON }} from '{fetch_json_import}';\n")

    ts_code.append(generate_ts_imports(endpoint_imports) + "\n")

    for endpoint_name, metadata in endpoints.items():
        method = metadata["method"].upper()
        response_type = metadata["response_type"]
        ts_url = metadata["ts_url"]
        route_params = metadata.get("route_params", [])
        query_params = metadata.get("query_params", [])
        body_type = metadata.get("body_type", "")

        # Function parameters
        params = []
        if route_params:
            params.append(f"params: {{ {', '.join(f'{param}: string' for param in route_params)} }}")
        if query_params:
            params.append(f"query?: {{ {', '.join(f'{param}?: string' for param in query_params)} }}")
        if body_type:
            params.append(f"body: {body_type}")

        param_str = "\n\t" + ",\n\t".join(params) + "\n" if params else ""

        # Generate query string if query parameters exist
        query_str = " + (query ? '?' + new URLSearchParams(query).toString() : '')" if query_params else ""

        # Construct URL with path params
        formatted_ts_url = f"`{ts_url.replace('{', '${params.')} ` " if route_params else f"'{ts_url}'"

        # Generate function
        ts_code.append(f"export async function endpoint_{endpoint_name}({param_str}): Promise<{response_type}> {{")

        # Request options
        request_options = [f'method: "{method}"']
        if body_type:
            request_options.append("body: JSON.stringify(body)")
        request_options_str = "\n\t\t" + ",\n\t\t".join(request_options) + "\n\t" if request_options else ""

        # Fetch call
        ts_code.append(f'\treturn fetchJSON({formatted_ts_url}{query_str}, {{{request_options_str}}});')
        ts_code.append("}\n")

    ts_path = os.path.join(output_dir, TS_ENDPOINTS_FILENAME)
    write_ts_file(ts_path, "\n".join(ts_code))


def get_relative_import(output_dir: str, base_output_dir: str, filename: str) -> str:
    """Compute the relative import path from the given app directory to the base output directory."""
    rel_path = os.path.relpath(base_output_dir, output_dir)
    return f"{rel_path}/{filename}".replace("\\", "/")  # Normalize for cross-platform compatibility


def write_ts_file(file_path: str, content: str):
    """Write TypeScript file only if content has changed."""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            if f.read() == content:
                print(f"☑️ No changes in {file_path}. Skipping write.")
                return

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
        print(f"✅ TypeScript definitions updated: {file_path}")


def adjust_import_paths(imports: list, output_dir: str) -> list:
    """Adjust `~` paths to be relative to the app folder."""
    adjusted_imports = []
    for imp in imports:
        module_path = imp[0]
        names = imp[1] if len(imp) > 1 else []

        # Convert "~" into "./" for relative paths
        if module_path.startswith("~"):
            module_path = os.path.relpath(module_path.replace("~", output_dir), output_dir)
            if not module_path.startswith("."):
                module_path = f"./{module_path}"  # Ensure relative import syntax

        adjusted_imports.append([module_path, names])

    return adjusted_imports


def generate_ts_imports(ts_imports: List[List[Union[str, List[str]]]]) -> str:
    """Generate TypeScript import statements from the new imports structure, ensuring proper merging."""

    if not ts_imports:
        return ""

    merged_imports = {}

    for imp in ts_imports:
        module_path = imp[0]
        names = imp[1] if len(imp) > 1 else []

        # Normalize names into a list (splitting if needed)
        if isinstance(names, str):
            names = [name.strip() for name in names.split(",")]
        elif isinstance(names, list):
            flat_names = []
            for item in names:
                if isinstance(item, str):
                    flat_names.extend(name.strip() for name in item.split(","))
            names = flat_names

        # Merge imports from the same module path
        if module_path in merged_imports:
            merged_imports[module_path].update(names)
        else:
            merged_imports[module_path] = set(names)

    import_lines = []

    for module_path, names in merged_imports.items():
        if names:
            import_lines.append(f"import {{ {', '.join(sorted(names))} }} from '{module_path}';")
        else:
            import_lines.append(f"import '{module_path}';")  # Support for side-effect imports

    return "\n".join(import_lines)
