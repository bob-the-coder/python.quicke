# management/commands/make_requirements.py
import json
from pathlib import Path

from django.core.management.base import BaseCommand

from task_manager.management.lib import store_json_run
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
        success, result = execute(project="Quicke", task_instruction=instruction)

        # --- Print final output ---
        self.stdout.write(self.style.SUCCESS("\nResult:\n" + "-" * 40))
        self.stdout.write(result.strip())

        store_result = json.loads(result.lstrip(">>>TASK_RESULT").strip()) \
            if success and result.lstrip().startswith(">>>TASK_RESULT") \
            else (result or "Failed to generate result").strip()

        store_json_run("gpt-4-turbo", f"{instruction[:20]}", success, store_result)

