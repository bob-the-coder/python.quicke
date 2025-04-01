import json
from typing import Optional

from agents import function_tool

from rainer.fileapi import get_rainer_file_contents, project_trees


@function_tool(
    name_override="project_file_lookup",
    description_override="Lookup files in the project directory by providing a relative file path"
)
async def project_file_lookup(project: str, path: str) -> Optional[str]:
    if not project.strip():
        return "No branch name provided"

    if not path.strip():
        return "No path provided"

    return get_rainer_file_contents(project, path) or "File does not exist"


@function_tool(
    name_override="project_tree", description_override="Provides the tree structure of the given project"
)
async def project_tree(project: str) -> str:
    return json.dumps(project_trees.get(project, {}))