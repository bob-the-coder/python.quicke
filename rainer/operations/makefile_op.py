import json
import uuid
import logging
from dataclasses import dataclass

from rainer.operations.refactor_op_new import RefactorSpec

# Logging setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

from rainer.agents.the_a_team import AGENT_NEONRAIL, AGENT_SUGARBYTE, AGENT_HEXLACE, AGENT_OVERDRIVE
from rainer.fileapi import unpack_file_ref, project_trees
from rainer.instructions import RefactorFile
from rainer.operations.lib import OperationSpec


# --- MakeFileSpec Implementation ---

@dataclass
class MakeFileSpec(RefactorSpec):
    step: int = 1

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        logging.info("Initialized MakeFileSpec(RefactorSpec) with parameters: %s", kwargs)

    def init(self):
        agent_intros = self.get_agent_intros()
        self.add_as_user([
            f"Meet the A-Team\n\n{agent_intros}",
            f"""## TASK
        ### IN PROJECT {self.project} MAKE FILE {self.path}
        ### MAKE FILE INSTRUCTION: {self.instruction}
        ### OUTPUT INSTRUCTION: {self.output_instruction}

        IMPLEMENT only what is REQUIRED by MAKE FILE INSTRUCTION, and NOTHING ELSE!
        DO NOT MAKE ASSUMPTIONS! USE project_file_lookup TOOL to find out how existing code works!""",

            f"""PROJECT STRUCTURE: {json.dumps(project_trees.get(self.project, {}))}"""
        ])
        logging.info("Initialized task for file creation in project: %s", self.project)


# --- Runtime Entry Point ---

def execute(refactor_file: RefactorFile):
    conversation_id = uuid.uuid4().hex[:16]
    project, path = unpack_file_ref(refactor_file)
    file_instruction = refactor_file.get("content", "") if isinstance(refactor_file, dict) else refactor_file.content or ""

    return MakeFileSpec(
        conversation_id=conversation_id,
        project=project,
        path=path,
        instruction=file_instruction,
        output_instruction="Output the full file contents, and nothing else",
        agents=[AGENT_NEONRAIL, AGENT_SUGARBYTE, AGENT_HEXLACE],
        lead=AGENT_OVERDRIVE,
        trace=f"MAKEFILE : {project} | {path}"
    ).run()
