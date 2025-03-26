import json
import os
import logging
from typing import Optional
from agents import Agent, function_tool
from django.conf import settings

from ..assistant_prompts import COMPREHENSIVE_ASSISTANT_PROMPT
from ..settings import DEFAULT_GPT_MODEL
from .. import get_rainer_file_contents, trees

# Get the absolute path to the project root directory
project_root = settings.BASE_DIR if hasattr(settings, 'BASE_DIR') else ""
if not project_root:
    raise ValueError("You need to set BASE_DIR environment variable in django settings")

# Join the project root directory with the JSON file path
CONFIG_FILE = os.path.join(project_root, "openai_config.agent.json")
logger = logging.getLogger(__name__)


@function_tool(
    name_override="rainer_file_lookup", description_override="Lookup files in the rainer project directory"
)
async def rainer_file_lookup(branch: str, path: str) -> Optional[str]:
    if not branch.strip():
        return "No branch name provided"

    if not path.strip():
        return "No path provided"

    return get_rainer_file_contents(branch, path) or "File does not exist"


@function_tool(
    name_override="rainer_tree", description_override="Provides the tree structure of the rainer project"
)
async def rainer_tree() -> str:
    return json.dumps(trees)

rainer_agent = Agent(
    name="COMPREHENSIVE_ASSISTANT_PROMPT",
    instructions=COMPREHENSIVE_ASSISTANT_PROMPT,
    model=DEFAULT_GPT_MODEL,
    tools=[rainer_tree, rainer_file_lookup]
)
