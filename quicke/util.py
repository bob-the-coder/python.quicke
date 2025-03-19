from typing import List, Tuple, Dict


def merge_imports(imports: List[Tuple[str, str | List[str]]]) -> List[Tuple[str, List[str]]]:
    """Merge imports, ensuring no duplicates and combining multiple imports from the same path."""
    merged_imports: Dict[str, List[str]] = {}

    for path, items in imports:
        if isinstance(items, str):
            items = [items]  # Convert single import to list

        if path in merged_imports:
            merged_imports[path].extend(items)
        else:
            merged_imports[path] = items

    # Deduplicate entries within each import path
    return [(path, sorted(set(names))) for path, names in merged_imports.items()]