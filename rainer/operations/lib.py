import concurrent.futures
import asyncio
import concurrent.futures
from abc import ABC, abstractmethod
from dataclasses import field
from typing import List

from agents import Agent
from agents import trace, Runner, MessageOutputItem, ItemHelpers


# --- Base OperationSpec ---

class AgentOperationSpec(ABC):
    conversation_id: str
    project: str
    path: str
    instruction: str
    output_instruction: str
    agents: List[Agent]
    lead: Agent
    timeout_seconds: int = 300
    conversation: list = field(default_factory=list)
    last_message: str = ""
    trace: str = "unknown_op"

    def __init__(self, **kwargs):
        self.conversation_id = kwargs["conversation_id"]
        self.project = kwargs["project"]
        self.path = kwargs["path"]
        self.instruction = kwargs["instruction"]
        self.output_instruction = kwargs["output_instruction"]
        self.agents = kwargs["agents"]
        self.lead = kwargs["lead"]
        self.timeout_seconds = kwargs.get("timeout_seconds", 300)
        self.conversation = kwargs.get("conversation", [])
        self.trace = kwargs.get("trace", "unknown_op")
        self.last_message = ""

    @abstractmethod
    def init(self):
        ...

    @abstractmethod
    def loop(self) -> str:
        ...

    @abstractmethod
    def done_if(self) -> bool:
        ...

    def __execute__(self) -> str:
        with trace(self.trace, group_id=self.conversation_id):
            self.init()
            return self.loop()

    def add_as_user(self, messages: List[str]):
        for msg in messages:
            self.conversation.append({"role": "user", "content": msg})
        return self

    def run_with_agent(self, agent):
        result = Runner.run_sync(agent, self.conversation, max_turns=100)
        self.conversation = result.to_input_list()

        for new_item in result.new_items:
            if isinstance(new_item, MessageOutputItem):
                self.last_message = ItemHelpers.text_message_output(new_item)

        return result

    def get_agent(self, name: str):
        for agent in self.agents:
            if agent.name == name: return agent
            else: continue
        return None

    def get_agent_intros(self):
        return "### Meet the A-Team\n\n\n".join([f"{a.name}: \"{getattr(a, 'intro', 'NO_INTRO')}\"" for a in self.agents])

    def run(self):
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            try:
                future = executor.submit(__run_loop__, self)
                return future.result(timeout=self.timeout_seconds)
            except concurrent.futures.TimeoutError:
                print(f"Refactoring operation timed out after {self.timeout_seconds} seconds.")
                return "FAILED"
            except Exception:
                print("Refactoring failed")
                return "FAILED"

def __run_loop__(spec: AgentOperationSpec):
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        asyncio.set_event_loop(asyncio.new_event_loop())
    return spec.__execute__()
