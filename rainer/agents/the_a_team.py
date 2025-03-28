from agents import Agent
from .tools import project_tree, project_file_lookup
from .lib import load_directives, load_persona
from ..settings import DEFAULT_GPT_MODEL
from . import personas, directives, intros  # New module: `intros.py` stores *_INTRO constants


def load_constant(module, const_name, default):
    return getattr(module, const_name, default)


def build_agent(name: str):
    persona = load_constant(personas, f"{name}_PERSONA", default="NO_PERSONA")
    directives = load_constant(agent_directives, f"{name}_DIRECTIVES", default=[])
    intro = load_constant(agent_intros, f"{name}_INTRO", default="NO_INTRO")

    agent = Agent(
        name=name,
        instructions=load_persona(persona) + "\n\n" + load_directives(directives),
        model=DEFAULT_GPT_MODEL,
        tools=[project_tree, project_file_lookup],
    )

    # Attach extra agent metadata
    setattr(agent, "intro", intro)
    return agent


# Instantiate all agents
AGENT_NEONRAIL = build_agent("NEONRAIL")
AGENT_SUGARBYTE = build_agent("SUGARBYTE")
AGENT_BLACKSOCKET = build_agent("BLACKSOCKET")
AGENT_CHROMEDUMP = build_agent("CHROMEDUMP")
AGENT_ZENPROXY = build_agent("ZENPROXY")
AGENT_HEXLACE = build_agent("HEXLACE")
AGENT_QUANTFLASH = build_agent("QUANTFLASH")
AGENT_GUTTERZEN = build_agent("GUTTERZEN")
AGENT_NULLDIVE = build_agent("NULLDIVE")
AGENT_CASSETTEECHO = build_agent("CASSETTEECHO")
AGENT_OVERDRIVE = build_agent("OVERDRIVE")

A_TEAM = {
    "NEONRAIL": AGENT_NEONRAIL,
    "SUGARBYTE": AGENT_SUGARBYTE,
    "BLACKSOCKET": AGENT_BLACKSOCKET,
    "CHROMEDUMP": AGENT_CHROMEDUMP,
    "ZENPROXY": AGENT_ZENPROXY,
    "HEXLACE": AGENT_HEXLACE,
    "QUANTFLASH": AGENT_QUANTFLASH,
    "GUTTERZEN": AGENT_GUTTERZEN,
    "NULLDIVE": AGENT_NULLDIVE,
    "CASSETTEECHO": AGENT_CASSETTEECHO,
    "OVERDRIVE": AGENT_OVERDRIVE,
}
