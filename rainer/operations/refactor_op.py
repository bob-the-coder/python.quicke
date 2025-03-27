import uuid
import concurrent.futures
import asyncio

from agents import (
    trace,
    Runner,
    MessageOutputItem,
    ItemHelpers,
    HandoffOutputItem,
    ToolCallItem,
    ToolCallOutputItem,
)
from rainer.agents import refactor_agent
from rainer.fileapi import unpack_file_ref
from rainer.instructions import RefactorFile

TIMEOUT_SECONDS = 300


def build_input_items(project: str, path: str, instruction: str):
    steps = [
        f"TASK: REFACTOR FILE (project: {project}, file: {path})",
        "USE TOOL 'project_file_lookup' to find the file",
        "USE TOOL 'project_tree' to find any other files referenced in the REFACTOR FILE",
        "USE the gathered knowledge to implement the refactoring in a way that maintains file consistency",
        f"REFACTOR INSTRUCTION: {instruction}",
        "OUTPUT the new code AS PLAINTEXT, without markdown annotations",
        "The final code output MUST BEGIN with the text 'OUTPUT_RESULT'",
    ]
    return [{"role": "user", "content": step} for step in steps]


def run_refactor_loop(conversation_id: str, input_items: list):
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    text_output = ""

    while not text_output.startswith("OUTPUT_RESULT"):
        with trace("file refactoring", group_id=conversation_id):
            result = Runner.run_sync(refactor_agent, input_items)

            for new_item in result.new_items:
                agent_name = new_item.agent.name
                if isinstance(new_item, MessageOutputItem):
                    text_output = ItemHelpers.text_message_output(new_item)
                    print(f"{agent_name}: Still working")
                elif isinstance(new_item, HandoffOutputItem):
                    print(f"Handed off from {new_item.source_agent.name} to {new_item.target_agent.name}")
                elif isinstance(new_item, ToolCallItem):
                    print(f"{agent_name}: Calling a tool")
                elif isinstance(new_item, ToolCallOutputItem):
                    print(f"{agent_name}: Tool call output: {new_item.output}")
                else:
                    print(f"{agent_name}: Skipping item: {new_item.__class__.__name__}")

            input_items = result.to_input_list()

    return text_output.replace("OUTPUT_RESULT", "")


def refactor_op(refactor_file: RefactorFile):
    conversation_id = uuid.uuid4().hex[:16]
    project, path = unpack_file_ref(refactor_file)

    refactor_instruction = refactor_file.content or ""
    input_items = build_input_items(project, path, refactor_instruction)

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(run_refactor_loop, conversation_id, input_items)
        try:
            return future.result(timeout=TIMEOUT_SECONDS)
        except concurrent.futures.TimeoutError:
            print("Refactoring operation timed out after 5 minutes.")
            return ""
