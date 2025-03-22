
from typing import List, Tuple, Dict, Union


def merge_imports(imports: List[Tuple[str, Union[str, List[str]]]]) -> List[Tuple[str, List[str]]]:
    """Merge imports, ensuring no duplicates and correctly handling multi-item strings."""

    merged_imports: Dict[str, List[str]] = {}

    for path, items in imports:
        # Normalize items to a list of strings, splitting multi-import strings
        if isinstance(items, str):
            items = [imp.strip() for imp in items.split(",")]
        elif isinstance(items, list):
            flat_items = []
            for item in items:
                if isinstance(item, str):
                    flat_items.extend(imp.strip() for imp in item.split(","))
            items = flat_items
        else:
            continue  # Ignore invalid imports

        # Merge into existing imports, ensuring uniqueness
        if path in merged_imports:
            merged_imports[path].extend(items)
        else:
            merged_imports[path] = items

    # Deduplicate and sort imports for each path
    return [(path, sorted(set(names))) for path, names in merged_imports.items()]
