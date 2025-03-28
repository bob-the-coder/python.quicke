
import uuid
import logging
from dataclasses import dataclass

# Setting up logging configuration
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

from rainer.agents.the_a_team import AGENT_NEONRAIL, AGENT_BLACKSOCKET, AGENT_GUTTERZEN, AGENT_OVERDRIVE
from rainer.fileapi import unpack_file_ref
from rainer.instructions import RefactorFile
from rainer.operations.lib import OperationSpec


# --- RefactorSpec Implementation ---

@dataclass
class RefactorSpec(OperationSpec):
    step: int = 1

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        logging.info("Initialized RefactorSpec with parameters: %s", kwargs)

    def init(self):
        intros = "\n".join([f"{a.name}: \"{getattr(a, 'intro', 'NO_INTRO')}\"" for a in self.agents])
        self.add_as_user([
            "Meet the A-Team",
            intros,
            f"# PROJECT: {self.project}",
            "## TASK",
            f"### REFACTOR FILE: {self.path}",
            f"### REFACTOR INSTRUCTION: {self.instruction}",
            f"### OUTPUT INSTRUCTION: {self.output_instruction}",
            "IMPLEMENT only what is REQUIRED by REFACTOR INSTRUCTION, and NOTHING ELSE",
            "USE project_tree, and project_file_lookup TOOLS WHEN NECESSARY"
        ])
        logging.info("Initialized task for project: %s", self.project)

    def loop(self) -> str:
        while not self.done_if():
            logging.info("Entering TURN %d | ASSESSMENT PHASE", self.step)
            self.assess_phase()

            logging.info("Entering TURN %d | IMPLEMENT PHASE", self.step)
            self.implement_phase()

            logging.info("Entering TURN %d | SUMMARY PHASE", self.step)
            self.summary_phase()

            self.step += 1

        return self.last_message.lstrip("TASK_OUTPUT")

    def done_if(self) -> bool:
        return (self.last_message or "").lstrip().startswith("TASK_OUTPUT")

    def assess_phase(self):
        self.add_as_user([
            f"PRAGMA OVERRIDE: All responses start with 'ROUND {self.step} ASSESSMENT'",
            f"{self.lead.name}, assess current TASK state."
        ])
        self.run_with(self.lead)

        for agent in self.agents:
            self.add_as_user([f"{agent.name}, provide your ASSESSMENT."])
            self.run_with(agent)

        self.add_as_user([f"{self.lead.name}, generate tasks for agents for ROUND {self.step}, if needed."])
        self.run_with(self.lead)

    def implement_phase(self):
        self.add_as_user([f"PRAGMA OVERRIDE: All responses start with 'ROUND {self.step} IMPLEMENTATION'"])
        for agent in self.agents:
            self.add_as_user([f"{agent.name}, IMPLEMENT your assigned instruction, output NOOP otherwise."])
            self.run_with(agent)

    def summary_phase(self):
        self.add_as_user([f"{self.lead.name}, can you compile a SUMMARY of the changes implemented so far?."])
        self.run_with(self.lead)

        self.add_as_user([
            f"""{self.lead.name}, if the current changes satisfy REFACTOR INSTRUCTION,
> OUTPUT FULL, UPDATED CONTENTS FOR REFACTOR FILE AS PLAINTEXT, NO MARKDOWN ANNOTATIONS
> OUTPUT SHOULD BEGIN WITH 'TASK_OUTPUT'"""
        ])
        self.run_with(self.lead)


# --- Runtime Entry Point ---

def execute(refactor_file: RefactorFile):
    conversation_id = uuid.uuid4().hex[:16]
    project, path = unpack_file_ref(refactor_file)
    refactor_instruction = refactor_file.get("content", "") if isinstance(refactor_file, dict) else refactor_file.content or ""

    return RefactorSpec(
        conversation_id=conversation_id,
        project=project,
        path=path,
        instruction=refactor_instruction,
        output_instruction="Output the full updated code for the file",
        agents=[AGENT_BLACKSOCKET, AGENT_NEONRAIL, AGENT_GUTTERZEN],
        lead=AGENT_OVERDRIVE
    ).run()

# --- Core Operation Loop Executor ---
