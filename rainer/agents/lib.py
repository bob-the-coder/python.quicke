from typing import List

def load_directives(directives: List[str]):
    return "FOR ALL RESPONSES\n> " + "\n> ".join(directives)
