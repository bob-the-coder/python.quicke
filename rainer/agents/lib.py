from typing import List

def load_directives(directives: List[str]):
    return "FOR ALL RESPONSES\n> " + "\n> ".join(directives)

def load_persona(persona: str):
    return f"LOAD PERSONA PROFILE (YOU BECOME):\n{persona}\n"