import json
import uuid
import logging
from dataclasses import dataclass

from rainer import project_trees

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
        agent_intros = self.get_agent_intros()
        self.add_as_user([
            agent_intros,
            f"""## TASK
### FROM PROJECT {self.project} REFACTOR FILE {self.path}
### REFACTOR INSTRUCTION: {self.instruction}
### OUTPUT INSTRUCTION: {self.output_instruction}

IMPLEMENT only what is REQUIRED by REFACTOR INSTRUCTION, and NOTHING ELSE!
DO NOT MAKE ASSUMPTIONS! USE project_file_lookup TOOL to find out how existing code works!""",

            f"""PROJECT STRUCTURE: {json.dumps(project_trees.get(self.project, {}))}"""
        ])
        logging.info("Initialized task for file refactoring in project: %s", self.project)

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
        self.run_with_agent(self.lead)

        for agent in self.agents:
            self.add_as_user([f"{agent.name}, offer new input, otherwise respond SKIP."])
            self.run_with_agent(agent)

        self.add_as_user([f"""{self.lead.name}, generate atomic tasks for required agents for ROUND {self.step}. 
        Output only JSON array of objects representing tasks {{ 
            "agent": "AGENT_NAME", 
            "task": "?Exactly what needs to happen?"
        }}"""])
        self.run_with_agent(self.lead)

        tasks_json = json.loads(self.last_message
                                .strip()
                                .lstrip("TASK_OUTPUT")
                                .lstrip(f"ROUND {self.step} ASSESSMENT")
                                ) or []
        print(json.dumps(tasks_json, indent=4))

    def implement_phase(self):
        self.add_as_user([f"PRAGMA OVERRIDE: All responses start with 'ROUND {self.step} IMPLEMENTATION'"])
        for agent in self.agents:
            self.add_as_user([f"{agent.name}, IMPLEMENT your assigned instruction, output NOOP otherwise."])
            self.run_with_agent(agent)

    def summary_phase(self):
        self.add_as_user([f"{self.lead.name}, can you compile a SUMMARY of the changes implemented so far?."])
        self.run_with_agent(self.lead)

        self.add_as_user([
            f"""{self.lead.name}, if the current changes satisfy REFACTOR INSTRUCTION,
> OUTPUT FULL, UPDATED CONTENTS FOR REFACTOR FILE AS PLAINTEXT, NO MARKDOWN ANNOTATIONS
> OUTPUT SHOULD BEGIN WITH 'TASK_OUTPUT'"""
        ])
        self.run_with_agent(self.lead)


# --- Runtime Entry Point ---

def execute(refactor_file: RefactorFile):
    conversation_id = uuid.uuid4().hex[:16]
    project, path = unpack_file_ref(refactor_file)
    refactor_instruction = refactor_file.get("content", "") if isinstance(refactor_file,
                                                                          dict) else refactor_file.content or ""

    return RefactorSpec(
        conversation_id=conversation_id,
        project=project,
        path=path,
        instruction=refactor_instruction,
        output_instruction="Output the full updated code for the file",
        agents=[AGENT_BLACKSOCKET, AGENT_NEONRAIL, AGENT_GUTTERZEN],
        lead=AGENT_OVERDRIVE,
        trace=f"REFACTOR : {project} | {path}"
    ).run()

