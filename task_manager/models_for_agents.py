import quicke
from django.db import models
from quicke.lib import BaseModel, quicke_choices


class DirectiveCategory(models.TextChoices):
    PRAGMA = "PRAGMA", "Pragma"
    COMM = "COMM", "Communication"
    IGN = "IGN", "Ignore"
    CLEANCODE = "CLEANCODE", "Clean Code"
    ZEN = "ZEN", "Zen"


@quicke.model({
    "fields": {
        "category": {
            "type": quicke_choices(DirectiveCategory),
        },
    }
})
class Directive(BaseModel):
    """
    Represents a directive string, classified into categories like PRAGMA, ZEN, etc.
    """

    category: str = models.CharField(max_length=32, choices=DirectiveCategory.choices)
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
    intro: str = models.TextField(default="")
    is_overseer: bool = models.BooleanField(default=False)
    active: bool = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]


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
