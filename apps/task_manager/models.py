
from django.db import models
from quicke.decorators.model import quicke_model

@quicke_model
class Conversation(models.Model):
    source = models.CharField(max_length=255, help_text="Source of the conversation")
    content = models.TextField(help_text="Content of the conversation")
    timestamp = models.DateTimeField(auto_now_add=True, help_text="Time when the conversation was created")

    def __str__(self):
        return f"Conversation from {self.source} at {self.timestamp}"

    class Meta:
        verbose_name = "Conversation"
        verbose_name_plural = "Conversations"
        ordering = ['-timestamp']
