from typing import List, runtime_checkable, Protocol


def load_directives(directives: List[str]):
    return "FOR ALL RESPONSES\n> " + "\n> ".join(directives)

def load_persona(persona: str):
    return f"LOAD PERSONA PROFILE (YOU BECOME):\n{persona}\n"



@runtime_checkable
class GptAgentWithIntro(Protocol):
    name: str
    instructions: str
    model: str
    tools: list
    intro: str