import quicke
from django.db import models

from task_manager.enums import TaskType
from task_manager.models_for_agents import Agent
from quicke.lib import BaseModel


@quicke.model()
class ContextBrief(BaseModel):
    """
    Mid-level document connecting stakeholder intent to task breakdowns.
    """
    title: str = models.CharField(max_length=255)
    summary: str = models.TextField()
    version: str = models.CharField(max_length=32, default="v1.0")
    created_by: Agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True,
                                          related_name="context_briefs")
    fulfilled: bool = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at", "title"]


class TaskStatus(models.TextChoices):
    TODO = "todo", "To Do"
    IN_PROGRESS = "in_progress", "In Progress"
    REVIEW = "review", "In Review"
    DONE = "done", "Done"
    BLOCKED = "blocked", "Blocked"
    OBSOLETE = "obsolete", "Obsolete"


@quicke.model({
    "fields": {
        "type": {"type": " | ".join(f"'{c}'" for c in TaskType.choices)},
        "status": {"type": " | ".join(f"'{c}'" for c in TaskStatus.choices)},
        "checklist": {"type": "Array<{ label: string; checked: boolean }>"},
    }
})
class Task(BaseModel):
    """
    Atomic work unit assigned to agents, tied to a context and optional parent.
    """

    context: ContextBrief = models.ForeignKey(ContextBrief, on_delete=models.CASCADE, related_name="tasks")
    parent: "Task" = models.ForeignKey("self", null=True, blank=True, on_delete=models.SET_NULL,
                                       related_name="subtasks")
    type: str = models.CharField(max_length=64, choices=TaskType.choices)
    status: str = models.CharField(max_length=32, choices=TaskStatus.choices, default=TaskStatus.TODO)
    title: str = models.CharField(max_length=255)
    description: str = models.TextField()
    checklist: list[dict[str, str]] = models.JSONField(default=list)
    output_expectation: str = models.TextField(blank=True)
    assigned_to: Agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True,
                                           related_name="assigned_tasks")
    locked: bool = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at", "status", "title"]


@quicke.model({
    "exclude_fields": ["id"],
})
class TaskDependency(BaseModel):
    """
    Links two tasks to enforce ordering/dependency relationships.
    """
    dependent: Task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="blocked_by")
    depends_on: Task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="unblocks")

    class Meta:
        unique_together = [("dependent", "depends_on")]


@quicke.model()
class TaskFeedback(BaseModel):
    """
    Feedback/comments issued during review, linked to a task and optionally an agent.
    """
    task: Task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="feedback")
    submitted_by: Agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True,
                                            related_name="feedback_submitted")
    content: str = models.TextField()
    is_blocking: bool = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]


__all__ = ["ContextBrief", "Task", "TaskDependency", "TaskFeedback"]
