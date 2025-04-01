# management/commands/seed_agents.py

from django.core.management.base import BaseCommand
from gpt import directives as agent_directives
from gpt import intros, personas, models
from task_manager.models import Directive, Agent, AgentDirective
from rainer.settings import DEFAULT_GPT_MODEL
from gpt import all_directives


class Command(BaseCommand):
    help = "Seed the database with predefined directives and agents"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.MIGRATE_HEADING("Seeding Directives..."))

        directive_objects = {}
        for name in dir(all_directives):
            if not name.isupper():
                continue
            value = getattr(all_directives, name)
            if not isinstance(value, str):
                continue
            category = name.split("_")[0]
            directive, _ = Directive.objects.get_or_create(
                value=value,
                defaults={"category": category}
            )
            directive_objects[value] = directive

        self.stdout.write(self.style.SUCCESS(f"✓ Seeded {len(directive_objects)} directives."))

        self.stdout.write(self.style.MIGRATE_HEADING("Seeding Agents..."))

        for attr in dir(agent_directives):
            if not attr.endswith("_DIRECTIVES"):
                continue
            agent_name = attr.removesuffix("_DIRECTIVES")
            directives_list = getattr(agent_directives, attr)
            persona = getattr(personas, f"{agent_name}_PERSONA", "NO_PERSONA")
            intro = getattr(intros, f"{agent_name}_INTRO", "NO_INTRO")
            model_name = getattr(models, f"{agent_name}_MODEL", DEFAULT_GPT_MODEL)

            agent, _ = Agent.objects.get_or_create(name=agent_name, defaults={
                "model_name": model_name,
                "persona": persona,
                "intro": intro,
            })

            for directive_value in directives_list:
                directive = directive_objects.get(directive_value)
                if directive:
                    AgentDirective.objects.get_or_create(
                        agent=agent,
                        directive=directive
                    )

        self.stdout.write(self.style.SUCCESS("✓ Seeded all agents with associated directives."))
