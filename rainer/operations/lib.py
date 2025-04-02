import concurrent.futures
import asyncio
from abc import ABC, abstractmethod
from dataclasses import field
from typing import List, Optional, Tuple

from agents import trace as conversation_trace, Runner, MessageOutputItem, ItemHelpers

from gpt.lib import GptAgentWithIntro


# --- Base OperationSpec ---

class AgentOperationSpec(ABC):
    conversation_id: str
    project: str
    instruction: str
    output_instruction: str
    lead: GptAgentWithIntro
    path: str = ""
    agents: List[GptAgentWithIntro] = field(default_factory=list)
    timeout_seconds: int = 300
    conversation: list = field(default_factory=list)
    last_message: str = ""
    max_steps: Optional[int] = None
    current_step: int = 1
    trace: str = "unknown_op"
    message_history: List[str] = field(default_factory=list)

    def __init__(
            self,
            *,
            conversation_id: str,
            project: str,
            path: Optional[str] = None,
            instruction: str,
            output_instruction: str,
            agents: Optional[List[GptAgentWithIntro]] = None,
            lead: GptAgentWithIntro,
            timeout_seconds: int = 300,
            trace: str = "unknown_op",
            conversation: Optional[List[dict]] = None,
            message_history: Optional[List[str]] = None,
            max_steps: Optional[int] = None,
    ):
        self.conversation_id = conversation_id
        self.project = project
        self.path = path if path else ""
        self.instruction = instruction
        self.output_instruction = output_instruction
        self.agents = agents if agents is not None else []
        self.lead = lead
        self.timeout_seconds = timeout_seconds
        self.trace = trace
        self.conversation = conversation if conversation is not None else []
        self.message_history = message_history if message_history is not None else []
        self.max_steps = max_steps
        self.last_message = ""
        self.current_step = 1

    @abstractmethod
    def init(self):
        ...

    @abstractmethod
    def loop(self):
        ...

    @abstractmethod
    def done_if(self) -> bool:
        ...

    def __execute__(self) -> Tuple[bool, str]:
        with conversation_trace(self.trace, group_id=self.conversation_id):
            self.add_as_user([f"--- START ---"])
            self.init()

            while True:
                if self.done_if():
                    return True, self.last_message
                if isinstance(self.max_steps, int) and self.current_step > self.max_steps:
                    return False, f"Maximum operation loop steps ({self.max_steps}) exceeded"

                self.add_as_user([f"--- ITERATION {self.current_step} ---"])
                self.loop()
                self.current_step += 1

    def add_as_user(self, messages: List[str]):
        for msg in messages:
            self.conversation.append({"role": "user", "content": msg})
        return self

    def run_with_agent(self, agent):
        result = Runner.run_sync(agent, self.conversation, max_turns=13)
        self.conversation = result.to_input_list()

        for new_item in result.new_items:
            if isinstance(new_item, MessageOutputItem):
                self.last_message = ItemHelpers.text_message_output(new_item)
                self.message_history.append(self.last_message)

        return result

    def get_agent(self, name: str):
        for agent in self.agents:
            if agent.name == name:
                return agent
            else:
                continue
        return None

    def get_agent_intros(self):
        return "### Meet the A-Team\n\n\n".join(
            [f"{a.name}: \"{getattr(a, 'intro', 'NO_INTRO')}\"" for a in self.agents])

    def run(self) -> Tuple[bool, str]:
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
            try:
                future = executor.submit(__run_asyncio_loop__, self)
                return future.result(timeout=self.timeout_seconds)
            except concurrent.futures.TimeoutError:
                error = f"Operation timed out after {self.timeout_seconds} seconds."
                print(error)
                return False, error
            except Exception as ex:
                print(ex)
                return False, str(ex)


def __run_asyncio_loop__(spec: AgentOperationSpec):
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        asyncio.set_event_loop(asyncio.new_event_loop())
    return spec.__execute__()
