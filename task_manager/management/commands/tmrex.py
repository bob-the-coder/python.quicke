# management/commands/make_requirements.py

from django.core.management.base import BaseCommand
from task_manager.operations.op_make_requirements import execute


class Command(BaseCommand):
    help = "Interactively generate a checklist of requirements for a task using OVERDRIVE."

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Checklist Generator: Quicke Project"))
        instruction = input("Enter task instruction for OVERDRIVE to analyze: ").strip()

        if not instruction:
            self.stderr.write(self.style.ERROR("✗ Instruction cannot be empty. Aborting."))
            return

        self.stdout.write(self.style.NOTICE("✓ Running operation..."))
        result = execute(project="Quicke", task_instruction=instruction)

        self.stdout.write(self.style.SUCCESS("\nResult:\n" + "-" * 40))
        self.stdout.write(result.strip())
