import json
import uuid
import logging
from dataclasses import dataclass

from rainer import project_trees
from task_manager.models import Agent
from rainer.operations.lib import AgentOperationSpec
from rainer.fileapi import unpack_file_ref
from rainer.instructions import RefactorFile

# Logging setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class MakeFileSpec(AgentOperationSpec):
    def init(self):
        logging.info("Initialized MakeFileSpec with parameters")
        self.add_as_user([
            f"""
--- PROJECT FILES ---
--- THESE ARE ALL THE FILES THAT CURRENTLY EXIST IN THE PROJECT ---
{json.dumps(project_trees.get(self.project, {}))}
""",
            f"""
--- FILE CREATION REQUEST ---
PROJECT (CASE SENSITIVE): {self.project}
TARGET FILE: {self.path}
INSTRUCTION: {self.instruction}

--- GUIDELINES ---
- Implement only what is required by the file creation instruction and nothing else.
- Use `project_file_lookup` to inspect existing code if needed.
- Do not assume or create dependencies unless explicitly required.
- If the request is ambiguous, output only `>>>TASK_FAILED`.
- Otherwise, generate a complete and functional file following the given instruction.
- The final output must begin with `>>>TASK_RESULT` and nothing else.
"""
        ])

        logging.info("Initialized OVERDRIVE for file creation")

    def loop(self):
        self.add_as_user([
            f"""
OVERDRIVE, implement the file creation task.
IF the output needs refinement, return only >>>TASK_REFINEMENT.
ELSE return the final file content as a plaintext string.
REMEMBER: Final task output must start with >>>TASK_RESULT or >>>TASK_FAILED and contain the full file contents."""
        ])
        self.run_with_agent(self.lead)

    def done_if(self) -> bool:
        return (self.last_message or "").strip().startswith(">>>TASK_RESULT") or \
               (self.last_message or "").strip().startswith(">>>TASK_FAILED")


# --- Execution Entry Point ---

def execute(refactor_file: RefactorFile):
    conversation_id = uuid.uuid4().hex[:16]
    project, path = unpack_file_ref(refactor_file)
    file_instruction = refactor_file.get("content", "") if isinstance(refactor_file, dict) else refactor_file.content or ""

    # Load agents from DB
    overdrive_agent = Agent.objects.get(name="OVERDRIVE")
    supporting_agents = list(Agent.objects.filter(name__in=["NEONRAIL", "SUGARBYTE", "HEXLACE"]))

    return MakeFileSpec(
        conversation_id=conversation_id,
        project=project,
        path=path,
        instruction=file_instruction,
        max_steps=10,
        output_instruction="Output the full file contents as plaintext.",
        agents=supporting_agents,
        lead=overdrive_agent.to_runtime_agent(),
        trace=f"MAKEFILE : {project} | {path}"
    ).run()
