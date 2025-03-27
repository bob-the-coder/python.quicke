import json
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
from rainer.agents.refactor_agent import refactor_agent  # ⚙️ Agent specialized for refactoring
from rainer.fileapi import unpack_file_ref  # 📦 Unpack file references
from rainer.instructions import RefactorFile  # 📜 Definition for refactoring files

TIMEOUT_SECONDS = 300  # ⏰ Timeout for operations in seconds

def as_user(message: str):
    return {"role": "user", "content": message}

def build_input_items(project: str, path: str, instruction: str):
    # 🛠️ Build a series of input steps for processing
    steps = "\n".join([
        "TASK",
        f">REFACTOR FILE (project: {project}, file: {path})",
        f">REFACTOR INSTRUCTION: {instruction}",
    ])
    return [as_user(steps)]


def run_refactor_loop(conversation_id: str, input_items: list):
    # 🌀 Runs a loop for refactoring until output condition is met
    try:
        asyncio.get_running_loop()  # 👀 Check for existing event loop
    except RuntimeError:
        loop = asyncio.new_event_loop()  # 🆕 Create a new event loop if none exists
        asyncio.set_event_loop(loop)  # Set the new loop

    draft = ""
    text_output = ""  # 📝 Initialize output string
    did_double_check = False

    step = 1

    try:
        while not text_output.startswith("OUTPUT_RESULT"):  # 🔄 Continue until output condition
            with trace("file refactoring", group_id=conversation_id):  # 📊 Trace the operation
                result = Runner.run_sync(refactor_agent, input_items)  # 🏃‍♂️ Run the agent synchronously
                input_items = result.to_input_list()  # 🔄 Prepare for next iteration

                for new_item in result.new_items:  # 📦 Process each new output item
                    agent_name = new_item.agent.name
                    if isinstance(new_item, MessageOutputItem):  # 💬 Handle message outputs
                        text_output = ItemHelpers.text_message_output(new_item)  # 📤 Get output text

                        if text_output.startswith("FAILED"):
                            return text_output

                        if did_double_check and text_output.startswith("NOCHANGE"):
                            return draft

                        if text_output.startswith("OUTPUT_RESULT"):
                            result = text_output.lstrip().replace("OUTPUT_RESULT", "")
                            if not did_double_check:
                                draft = result
                                text_output = "DOUBLE-CHECKING"
                                did_double_check = True
                                input_items.append(as_user("DOUBLECHECK"))
                                print(f"STEP {step} | DOUBLE-CHECKING")
                            else:
                                print(f"STEP {step} | HAS OUTPUT")
                                # 📝 Return the output excluding the header
                                return result
                        else:
                            print(f"STEP {step} | {agent_name}: WORKING : {text_output}")  # 🛠️ Show status
                    elif isinstance(new_item, HandoffOutputItem):  # 🔄 Handle handoffs
                        print(f"STEP {step} | Handed off from {new_item.source_agent.name} to {new_item.target_agent.name}")
                    elif isinstance(new_item, ToolCallItem):  # 🛠️ Handle tool calls
                        print(f"STEP {step} | {agent_name}: Calling a tool")
                    elif isinstance(new_item, ToolCallOutputItem):  # 🔧 Handle tool call outputs
                        print(f"STEP {step} | {agent_name}: Tool call output")
                    else:
                        print(f"STEP {step} | {agent_name}: Skipping item: {new_item.__class__.__name__}")  # 🚫 Unknown item type

    except Exception as e:
        print(e)
        return "FAILED"


def refactor_op(refactor_file: RefactorFile):
    # 📚 Execute the refactoring operation for a given file
    conversation_id = uuid.uuid4().hex[:16]  # 🔑 Generate a conversation ID
    project, path = unpack_file_ref(refactor_file)  # 📦 Unpack the project and path

    refactor_instruction = refactor_file.get("content", "") if isinstance(refactor_file,
                                                                          dict) else refactor_file.content or ""
    input_items = build_input_items(project, path, refactor_instruction)  # 🛠️ Prepare input items

    print(json.dumps(refactor_instruction, indent=4))
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:  # 👩‍💼 Manage worker thread
        try:
            future = executor.submit(run_refactor_loop, conversation_id, input_items)  # 🏃‍♂️ Start the refactor loop
            return future.result(timeout=TIMEOUT_SECONDS)  # ⏳ Wait for result or timeout
        except concurrent.futures.TimeoutError:
            print(f"Refactoring operation timed out after {TIMEOUT_SECONDS} seconds.")  # ⏱️ Handle timeout
            return "FAILED"  # 🚫 Return empty on timeout
        except Exception:
            print("Refactoring failed")
            return "FAILED"
