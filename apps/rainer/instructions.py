from typing import List

from . import *

def build_file_ref_def(file_ref: RainerFile) -> str:
    branch, path = unpack_file_ref(file_ref)
    abs_path = get_file_path(branch, path)
    contents = get_file_contents(branch, path)

    return f"""
UPDATE FILE DEFINITION
FILE REFERENCE - BRANCH: {branch} | PATH: {path}
FILE REFERENCE LOCATION: {abs_path}
FILE REFERENCE CONTENT: 
```
{contents}
```
"""

def build_use_file_ref(file_ref: RainerFile) -> str:
    branch, path = unpack_file_ref(file_ref)
    return f"USE FILE REFERENCE - BRANCH: {branch} | PATH: {path}"


class RefactorFile(RainerFile):
    branch: str
    path: str
    content: str
    file_references: List[RainerFile]

def get_file_ref_definitions(file_references: List[RainerFile]) -> List[str]:
    return [
        build_file_ref_def(reference)
        for reference in file_references
    ]

def get_file_ref_usage(file_references: List[RainerFile]) -> List[str]:
    return [
        build_use_file_ref(reference)
        for reference in file_references
    ]


def build_refactor_instructions(refactor: RefactorFile, action: str = "update") -> List[str]:
    file_references = refactor.file_references or []
    refactor_instructions = make_create_target_instructions(refactor) if action == "create" else \
                            make_update_target_instructions(refactor)

    output_instruction = """
    >OUTPUT ONLY THE FULL, UPDATED FILE CODE
    >OUTPUT AS PLAINTEXT WITHOUT MARKDOWN ANNOTATIONS"""

    return [
        *get_file_ref_usage(file_references),
        *refactor_instructions,
        output_instruction,
    ]

def make_update_target_instructions(refactor: RefactorFile) -> List[str]:
    branch, path = unpack_file_ref(refactor)
    abs_path = get_file_path(branch, path)

    refactor_target_contents = get_file_contents(branch, path)
    refactor_target = f"""
    REFACTOR FILE {branch} {path}
    REFACTOR FILE PATH {abs_path}
    REFACTOR FILE CONTENTS {branch} {path}
    ```{refactor_target_contents}"""

    refactor_changes = refactor.content or ""
    refactor_instruction = f"""
    REFACTOR INSTRUCTIONS
    ```{refactor_changes}```"""

    return [
        refactor_target,
        refactor_instruction,
    ]

def make_create_target_instructions(refactor: RefactorFile) -> [str]:
    branch, path = unpack_file_ref(refactor)
    abs_path = get_file_path(branch, path)

    refactor_target = f"""
    CREATE FILE {branch} {path}
    CREATE FILE PATH {abs_path}"""

    refactor_changes = refactor.content or ""
    refactor_instruction = f"""
    CREATE FILE INSTRUCTIONS
    ```{refactor_changes}```"""

    return [
        refactor_target,
        refactor_instruction,
    ]

