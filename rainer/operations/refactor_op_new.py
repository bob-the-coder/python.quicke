import json
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
from rainer.agents.the_a_team import AGENT_NEONRAIL, AGENT_BLACKSOCKET, AGENT_GUTTERZEN, AGENT_OVERDRIVE
from rainer.fileapi import unpack_file_ref
from rainer.instructions import RefactorFile

TIMEOUT_SECONDS = 300

ATEAM = [AGENT_BLACKSOCKET, AGENT_NEONRAIL, AGENT_GUTTERZEN]


def execute(refactor_file: RefactorFile):
    # 📚 Execute the refactoring operation for a given file
    conversation_id = uuid.uuid4().hex[:16]  # 🔑 Generate a conversation ID
    project, path = unpack_file_ref(refactor_file)  # 📦 Unpack the project and path

    refactor_instruction = refactor_file.get("content", "") if isinstance(refactor_file,
                                                                          dict) else refactor_file.content or ""
    input_items = build_input_items(project, path, refactor_instruction)  # 🛠️ Prepare input items

    print(json.dumps(refactor_instruction, indent=4))
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:  # 👩‍💼 Manage worker thread
        try:
            future = executor.submit(run_game_loop, conversation_id, input_items, ATEAM, AGENT_OVERDRIVE)  # 🏃‍♂️ Start the refactor loop
            return future.result(timeout=TIMEOUT_SECONDS)  # ⏳ Wait for result or timeout
        except concurrent.futures.TimeoutError:
            print(f"Refactoring operation timed out after {TIMEOUT_SECONDS} seconds.")  # ⏱️ Handle timeout
            return "FAILED"  # 🚫 Return empty on timeout
        except Exception:
            print("Refactoring failed")
            return "FAILED"


def as_user(message: str):
    return {"role": "user", "content": message}


def build_input_items(
        project: str, path: str, instruction: str, output_instruction: str,
        agents: list, lead):
    agent_intros = "\n".join([f"{agent.name}: {getattr(agent, 'intro', 'NO_INTRO')}" for agent in agents])

    steps = "\n".join([
        "TASK",
        f">REFACTOR FILE (project: {project}, file: {path})",
        f">REFACTOR INSTRUCTION: {instruction}",
        f">OUTPUT INSTRUCTION: {output_instruction}",
        "",
        "# Meet the A-Team",
        agent_intros,
        f"\n{lead} will be moderating this TASK and has the final say.",
        f"""{lead}, IF TASK IS COMPLETE, respond only with the new file contents, according to OUTPUT INSTRUCTION
    > OUTPUT AS PLAINTEXT, NO MARKDOWN ANNOTATIONS
    > OUTPUT SHOULD BEGIN WITH 'TASK_OUTPUT'"""
    ])

    return [as_user(steps)]



def run_game_loop(conversation_id: str, input_items: list, agents, lead):
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    step = 1
    task_complete = False
    conversation = input_items[:]

    try:
        with trace("game_turn", group_id=conversation_id):
            conversation.append(as_user(f"PRAGMA OVERRIDE: All responses start with 'ROUND {step} ASSESSMENT'"))

            while not task_complete:
                # ASSESS PHASE
                print(f"TURN {step} | ASSESSMENT PHASE")
                conversation.append(as_user(f"PRAGMA OVERRIDE: All responses start with 'ROUND {step} ASSESSMENT'"))

                conversation.append(as_user(f"{lead}, assess current TASK state."))
                result = Runner.run_sync(lead, conversation)
                conversation += result.to_input_list()

                for agent in agents:
                    conversation.append(as_user(f"{agent}, provide your ASSESSMENT."))
                    result = Runner.run_sync(agent, conversation)
                    conversation += result.to_input_list()

                conversation.append(as_user(f"{lead}, generate tasks for agents for ROUND {step}, if needed."))
                result = Runner.run_sync(lead, conversation)
                conversation += result.to_input_list()

                # IMPLEMENT PHASE
                print(f"TURN {step} | IMPLEMENT PHASE")
                conversation.append(as_user(f"PRAGMA OVERRIDE: All responses start with 'ROUND {step} IMPLEMENTATION'"))
                for agent in agents:
                    conversation.append(as_user(f"{agent}, IMPLEMENT your assigned instruction, output NOOP otherwise."))
                    result = Runner.run_sync(agent, conversation)
                    conversation += result.to_input_list()

                # SUMMARY + CHECK FOR TASK_OUTPUT
                print(f"TURN {step} | SUMMARY PHASE")
                conversation.append(as_user(f"""
                    {lead}, 
                    Assess if the TASK is COMPLETE.
    """))
                result = Runner.run_sync(lead, conversation)
                conversation += result.to_input_list()

                for new_item in result.new_items:
                    if isinstance(new_item, MessageOutputItem):
                        text_output = ItemHelpers.text_message_output(new_item)
                        if text_output.startswith("TASK_OUTPUT"):
                            task_complete = True
                            output = text_output[len("TASK_OUTPUT"):].lstrip()
                            print(f"TURN {step} | TASK COMPLETED\n{output}")
                            return output

                step += 1

    except Exception as e:
        print(f"Game loop failed: {e}")
        return "FAILED"