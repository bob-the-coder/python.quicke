
import uuid  # 🆔 For generating unique identifiers
import concurrent.futures  # 🧵 For managing concurrent executions
import asyncio  # ⏳ For handling asynchronous operations

from agents import (
    trace,  # 🔍 For tracing execution for debugging
    Runner,  # 🚀 For running processes
    MessageOutputItem,  # 💬 For outputting messages
    ItemHelpers,  # 🛠️ Assists with item management
    HandoffOutputItem,  # 🔄 Represents handoffs between agents
    ToolCallItem,  # 🛠️ Represents a call to a tool
    ToolCallOutputItem,  # 🔧 Output of a tool call
)
from rainer.agents import refactor_agent  # ⚙️ Agent specialized for refactoring
from rainer.fileapi import unpack_file_ref  # 📦 Unpack file references
from rainer.instructions import RefactorFile  # 📜 Definition for refactoring files

TIMEOUT_SECONDS = 300  # ⏰ Timeout for operations in seconds

def build_input_items(project: str, path: str, instruction: str):
    # 🛠️ Build a series of input steps for processing
    steps = [
        f"TASK: REFACTOR FILE (project: {project}, file: {path})",
        "USE TOOL 'project_file_lookup' to find the file",
        "USE TOOL 'project_tree' to find any other files referenced in the REFACTOR FILE",
        "USE the gathered knowledge to implement the refactoring in a way that maintains file consistency",
        f"REFACTOR INSTRUCTION: {instruction}",
        "OUTPUT the new code AS PLAINTEXT, without markdown annotations",
        "The final code output MUST BEGIN with the text ''",
    ]
    return [{"role": "user", "content": step} for step in steps]

def run_refactor_loop(conversation_id: str, input_items: list):
    # 🌀 Runs a loop for refactoring until output condition is met
    try:
        asyncio.get_running_loop()  # 👀 Check for existing event loop
    except RuntimeError:
        loop = asyncio.new_event_loop()  # 🆕 Create a new event loop if none exists
        asyncio.set_event_loop(loop)  # Set the new loop

    text_output = ""  # 📝 Initialize output string

    while not text_output.startswith(""):  # 🔄 Continue until output condition
        with trace("file refactoring", group_id=conversation_id):  # 📊 Trace the operation
            result = Runner.run_sync(refactor_agent, input_items)  # 🏃‍♂️ Run the agent synchronously

            for new_item in result.new_items:  # 📦 Process each new output item
                agent_name = new_item.agent.name
                if isinstance(new_item, MessageOutputItem):  # 💬 Handle message outputs
                    text_output = ItemHelpers.text_message_output(new_item)  # 📤 Get output text
                    print(f"{agent_name}: Still working")  # 🛠️ Show status
                elif isinstance(new_item, HandoffOutputItem):  # 🔄 Handle handoffs
                    print(f"Handed off from {new_item.source_agent.name} to {new_item.target_agent.name}")
                elif isinstance(new_item, ToolCallItem):  # 🛠️ Handle tool calls
                    print(f"{agent_name}: Calling a tool")
                elif isinstance(new_item, ToolCallOutputItem):  # 🔧 Handle tool call outputs
                    print(f"{agent_name}: Tool call output: {new_item.output}")
                else:
                    print(f"{agent_name}: Skipping item: {new_item.__class__.__name__}")  # 🚫 Unknown item type

            input_items = result.to_input_list()  # 🔄 Prepare for next iteration

    return text_output.replace("", "")  # 📝 Return the output excluding the header

def refactor_op(refactor_file: RefactorFile):
    # 📚 Execute the refactoring operation for a given file
    conversation_id = uuid.uuid4().hex[:16]  # 🔑 Generate a conversation ID
    project, path = unpack_file_ref(refactor_file)  # 📦 Unpack the project and path

    refactor_instruction = refactor_file.get("content", "") if isinstance(refactor_file, dict) else refactor_file.content or ""
    input_items = build_input_items(project, path, refactor_instruction)  # 🛠️ Prepare input items

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:  # 👩‍💼 Manage worker thread
        future = executor.submit(run_refactor_loop, conversation_id, input_items)  # 🏃‍♂️ Start the refactor loop
        try:
            return future.result(timeout=TIMEOUT_SECONDS)  # ⏳ Wait for result or timeout
        except concurrent.futures.TimeoutError:
            print("Refactoring operation timed out after 5 minutes.")  # ⏱️ Handle timeout
            return ""  # 🚫 Return empty on timeout
