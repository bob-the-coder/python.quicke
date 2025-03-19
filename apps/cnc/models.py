from django.db import models
import quicke
from quicke.lib import BaseModel


@quicke.model()
class Instruction(BaseModel):
    text = models.TextField(default='', blank=True)
    group = models.CharField(max_length=255, default='', blank=True)
    instruction_type = models.CharField(max_length=255, default='', blank=True)

    def __str__(self):
        name = self.name[:50]
        fullname = f"[{self.instruction_type}] {name}" if self.instruction_type else name
        if not self.group.strip(): return fullname

        return f"{self.group.replace(".", " / ").strip()} / {fullname}"

    class Meta:
        ordering = ["group", "instruction_type", "name"]


def render_argument(arg):
    if not isinstance(arg, dict): return

    name = arg.get("name").strip()
    if not name: return

    return f"{name}={arg.get("value").strip()}"


@quicke.model({
    "imports": [("~/types", "CommandArgument")],
    "fields": {
        "arguments": {
            "type": "CommandArgument[]",
        }
    }
})
class CommandTemplate(BaseModel):
    name = models.CharField(max_length=255, blank=True, default="Untitled Command")
    arguments = models.JSONField(default=list, blank=True)  # Store arguments as a dictionary

    def compile(self, debug=False):
        import re
        # Fetch related command items with full instruction details if available
        items = CommandTemplateItem.objects.filter(template=self).select_related("instruction")

        # Generate the preview text
        preview_lines = []
        for item in items:
            if item.custom_text:
                preview_lines.append(item.custom_text)
            elif item.instruction:
                preview_lines.append(item.instruction.text)

        # Extract valid arguments
        valid_arguments = {
            arg["name"]: arg["value"].strip()
            for arg in (self.arguments or [])
            if isinstance(arg, dict) and arg.get("name", "").strip() and arg.get("value", "").strip()
        }
        arguments_lines = '\n'.join(f'{name}={value}' for name, value in valid_arguments.items())
        arguments_section = f"===ARGUMENTS===\n{arguments_lines}\n\n" if valid_arguments else ""

        separator = "_" * (100 if debug else 0)

        # Replace placeholders in instructions
        def replace_placeholders(text):
            replace_single = lambda match: valid_arguments.get(match.group(1), match.group(0))
            return re.sub(r"\[([^\]]+)\]", replace_single, text)

        processed_lines = [replace_placeholders(line) for line in preview_lines]

        return f"{arguments_section}===INSTRUCTIONS===\n{f'\n{separator}\n'.join(processed_lines)}"

@quicke.model()
class CommandTemplateItem(BaseModel):
    template = models.ForeignKey(CommandTemplate, on_delete=models.CASCADE, related_name="items")
    instruction = models.ForeignKey(Instruction, null=True, blank=True, on_delete=models.SET_NULL)
    custom_text = models.TextField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

