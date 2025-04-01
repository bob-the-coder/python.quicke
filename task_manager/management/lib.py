import json
from pathlib import Path


def store_json_run(op: str, file: str, success: bool, result):
    # --- Path to results.json ---
    project_dir = Path(__file__).resolve().parent.parent.parent / "op_results" / op
    project_dir.mkdir(parents=True, exist_ok=True)  # Ensure directory exists

    results_path = project_dir / f"{file}.json"

    # --- Load or initialize file ---
    if results_path.exists():
        with open(results_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = {"results": {}, "errors": {}}
    else:
        data = {"results": {}, "errors": {}}

    # --- Determine next run ID ---
    all_keys = list(data["results"].keys()) + list(data["errors"].keys())
    next_index = 0 if not all_keys else max(int(k.split("_")[1]) for k in all_keys) + 1
    run_key = f"run_{next_index}"

    # --- Store result ---
    if success:
        data["results"][run_key] = result
    else:
        data["errors"][run_key] = result

    # --- Save updated file ---
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
