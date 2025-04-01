# rainer/operations/op_make_requirements.py
import json
import uuid
import logging
from dataclasses import dataclass

from rainer import project_trees
from task_manager.models import Agent
from rainer.fileapi import unpack_file_ref
from rainer.operations.lib import AgentOperationSpec

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


@dataclass
class RequirementsSpec(AgentOperationSpec):
    step: int = 1

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        logging.info("Initialized RequirementsSpec with parameters")

    def init(self):
        self.add_as_user([
            f"""
{self.lead.intro}            
## TASK DECOMPOSITION REQUEST

### PROJECT: {self.project}
### TASK REQUEST: {self.instruction}
### TASK INSTRUCTION: Generate a PLAINTEXT JSON list of strings representing minimal, explicit, actionable checklist items
which, if implemented, satisfy the original TASK REQUEST

GUIDELINES:
Use only information that can be reasonably inferred or verified by accessing project files through `project_file_lookup`.
If file inspection is required, you must issue a query stating exactly which file(s) need to be looked up.
DO NOT invent any details or dependencies unless they are strictly required.
If nothing can be done due to ambiguity, output only `<TASK_FAILED>`.
Otherwise, work step-by-step to produce a clear and complete checklist for the task.
All results must begin with `<TASK_RESULT>` and nothing else.
""",
            f"""PROJECT STRUCTURE: {json.dumps(project_trees.get(self.project, {}))}"""
        ])
        logging.info("Initialized OVERDRIVE for checklist decomposition")

    def loop(self) -> str:
        while not self.done_if():
            logging.info("TURN %d | ASSESSING CHECKLIST GENERATION", self.step)
            self.assess_phase()
            self.step += 1

        return self.last_message

    def done_if(self) -> bool:
        return (self.last_message or "").strip().startswith("<TASK_RESULT>") or \
               (self.last_message or "").strip().startswith("<TASK_FAILED>")

    def assess_phase(self):
        self.add_as_user([
            f"""
TURN {self.step}: 

OVERDRIVE, try to implement the TASK INSTRUCTION.
IF the checklist needs more refinement, output only <TASK_REFINEMENT>.
ELSE return the final checklist as a JSON list of strings.
REMEMBER: Final task output must start with <TASK_RESULT> or <TASK_FAILED> and be final."""
        ])
        self.run_with_agent(self.lead)


# --- Entry Point ---

def execute(project: str, task_instruction: str):
    conversation_id = uuid.uuid4().hex[:16]

    # Load OVERDRIVE from DB
    overdrive_agent = Agent.objects.get(name="OVERDRIVE")

    return RequirementsSpec(
        conversation_id=conversation_id,
        project=project,
        path=None,
        instruction=task_instruction,
        output_instruction="Produce a checklist of steps needed to complete the TASK INSTRUCTION",
        agents=[],
        lead=overdrive_agent.to_runtime_agent(),
        trace=f"CHECKLIST : {project} | {task_instruction}"
    ).run()
