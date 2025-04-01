from typing import runtime_checkable, Protocol, cast

import quicke
from django.db import models

from gpt.lib import GptAgentWithIntro
from gpt.tools import project_file_lookup
from quicke.lib import BaseModel
from agents import Agent as GptAgent

@quicke.model()
class Directive(BaseModel):
    """
    Represents a directive string, classified into categories like PRAGMA, ZEN, etc.
    """

    category: str = models.CharField(max_length=100)
    value: str = models.TextField(unique=True)

    class Meta:
        ordering = ["category", "name"]



@quicke.model()
class Agent(BaseModel):
    """
    Represents an autonomous or overseer agent with attached directives and metadata.
    """
    description: str = models.TextField(default="")
    model_name: str = models.CharField(max_length=255)
    persona: str = models.TextField(default="")
    intro: str = models.TextField(default="")
    is_overseer: bool = models.BooleanField(default=False)
    active: bool = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def to_runtime_agent(self, tools=None) -> GptAgentWithIntro:
        agent_directives = "\n".join(d.directive.value for d in self.agent_directives.select_related("directive").all())

        gpt_agent = GptAgent(
            name=self.name,
            instructions=(self.persona or "") + "\n\n",
            model=self.model_name,
            tools=tools or [project_file_lookup],
        )
        gpt_agent.intro = self.intro

        return cast(GptAgentWithIntro, gpt_agent)


@quicke.model({
    "exclude_fields": ["id"],
})
class AgentDirective(BaseModel):
    """
    Through-model connecting agents to directives, enabling many-to-many linkage.
    """
    agent: Agent = models.ForeignKey(Agent, on_delete=models.CASCADE, related_name="agent_directives")
    directive: Directive = models.ForeignKey(Directive, on_delete=models.CASCADE, related_name="directive_agents")

    class Meta:
        unique_together = [("agent", "directive")]
        ordering = ["agent", "directive"]


__all__ = ["Directive", "Agent", "AgentDirective"]
