# rainer/operations/op_make_requirements.py
import json
import uuid
import logging

from rainer import project_trees
from task_manager.models import Agent
from rainer.operations.lib import AgentOperationSpec

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


class RequirementsSpec(AgentOperationSpec):
    def init(self):
        logging.info("Initialized RequirementsSpec with parameters")
        self.add_as_user([
            f"""
--- PROJECT FILES ---
--- THESE ARE ALL THE FILES THAT CURRENTLY EXIST IN THE PROJECT --- 
{json.dumps(project_trees.get(self.project, {}))}
""",
            f"""
--- TASK DECOMPOSITION REQUEST ---
PROJECT (CASE SENSITIVE): {self.project}
INTENDED OUTCOME: {self.instruction}
TASK INSTRUCTION: {self.output_instruction}

--- GUIDELINES ---
- Use only information that can be reasonably inferred or verified by accessing project files through `project_file_lookup`.
- If file inspection is required, you must issue a query stating exactly which file(s) need to be looked up.
- DO NOT invent any details or dependencies unless they are strictly required.
- If nothing can be done due to ambiguity, output only `>>>TASK_FAILED`.
- Otherwise, work step-by-step to produce a clear and complete checklist for the task.
- All results must begin with `>>>TASK_RESULT` and nothing else.
"""
        ])

        logging.info("Initialized OVERDRIVE for checklist decomposition")

    def loop(self):
        self.add_as_user([
            f"""
OVERDRIVE, try to implement the TASK INSTRUCTION.
IF the checklist needs more refinement, output only >>>TASK_REFINEMENT.
ELSE return the final checklist as a JSON list of strings.
REMEMBER: Final task output must start with >>>TASK_RESULT or >>>TASK_FAILED and be final."""
        ])
        self.run_with_agent(self.lead)

    def done_if(self) -> bool:
        return (self.last_message or "").strip().startswith(">>>TASK_RESULT") or \
            (self.last_message or "").strip().startswith(">>>TASK_FAILED")


# --- Entry Point ---

def execute(project: str, task_instruction: str):
    conversation_id = uuid.uuid4().hex[:16]

    # Load OVERDRIVE from DB
    overdrive_agent = Agent.objects.get(name="OVERDRIVE")

    return RequirementsSpec(
        conversation_id=conversation_id,
        project=project,
        instruction=task_instruction,
        max_steps=10,
        output_instruction="Generate a PLAINTEXT JSON list of strings representing minimal, explicit, actionable checklist items which, if implemented, result in the INTENDED OUTCOME",
        lead=overdrive_agent.to_runtime_agent(),
        trace=f"CHECKLIST : {project} | {task_instruction}"
    ).run()
