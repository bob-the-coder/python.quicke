from typing import List, Dict, Union


def generate_ts_imports(ts_imports: List[Dict[str, Union[str, List[str], None]]]) -> str:
    """Generate TypeScript import statements."""
    if not ts_imports:
        return ""

    import_lines = []
    for imp in ts_imports:
        module_path = imp["path"]
        names = imp["names"]
        default = imp["default"]

        if default and names:
            import_lines.append(f"import {default}, {{ {', '.join(names)} }} from '{module_path}';")
        elif default:
            import_lines.append(f"import {default} from '{module_path}';")
        elif names:
            import_lines.append(f"import {{ {', '.join(names)} }} from '{module_path}';")

    return "\n".join(import_lines)