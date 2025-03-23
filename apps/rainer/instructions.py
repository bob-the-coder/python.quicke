from typing import TypedDict, Tuple, List

from apps import rainer
from apps.rainer import get_file_path, get_file_contents


class FileRef(TypedDict):
    branch: str
    path: str


def unpack_file_ref(file_ref: FileRef) -> Tuple[str, str]:
    branch = file_ref.get("branch", "")
    path = file_ref.get("path", "")

    return branch, path


def build_file_ref(file_ref: FileRef) -> str:
    branch, path = unpack_file_ref(file_ref)
    abs_path = get_file_path(branch, path)
    contents = get_file_contents(branch, path)

    return f"""
FILE REFERENCE - BRANCH: {branch} | PATH: {path}
FILE REFERENCE LOCATION: {abs_path}
FILE REFERENCE CONTENT: ```
{contents}
```
"""

def build_use_file_ref(file_ref: FileRef) -> str:
    branch, path = unpack_file_ref(file_ref)
    return f"USE FILE REFERENCE - BRANCH: {branch} | PATH: {path}"


class RefactorFile(TypedDict):
    branch: str
    path: str
    content: str
    file_references: List[FileRef]


def build_refactor_instructions(refactor: RefactorFile) -> List[str]:
    branch, path = unpack_file_ref(refactor)
    file_references = refactor.get("file_references", [])

    file_contents = rainer.get_file_contents(branch, path)
    abs_path = get_file_path(branch, path)

    file_reference_instructions = []
    for reference in file_references:
        use_ref = build_use_file_ref(reference)
        file_reference_instructions.append(use_ref)

    refactor_changes = refactor.get("content", "")
    refactor_instruction = f"""
REFACTOR FILE {branch} {path}
FILE PATH {abs_path}
REFACTOR INSTRUCTIONS
```{refactor_changes}```"""

    output_instructions = "OUTPUT THE UPDATED FILE AS PLAINTEXT WITHOUT MARKDOWN ANNOTATIONS"

    return [
        file_contents,
        *file_reference_instructions,
        refactor_instruction,
        output_instructions
    ]