import uuid
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Sends a message to GPT"

    def handle(self, *args, **options):
        from agents import trace, Runner, MessageOutputItem, ItemHelpers, HandoffOutputItem, ToolCallItem, ToolCallOutputItem
        from rainer.gpt.gpt_agent_base import rainer_agent
        conversation_id = uuid.uuid4().hex[:16]

        input_items = []
        while True:
            user_input = input("Enter your message: ")
            with trace("Rainer", group_id=conversation_id):
                input_items.append({"role": "user", "content": user_input})
                result = Runner.run_sync(rainer_agent, input_items)

                for new_item in result.new_items:
                    agent_name = new_item.agent.name
                    if isinstance(new_item, MessageOutputItem):
                        print(f"{agent_name}: {ItemHelpers.text_message_output(new_item)}")
                    elif isinstance(new_item, HandoffOutputItem):
                        print(
                            f"Handed off from {new_item.source_agent.name} to {new_item.target_agent.name}"
                        )
                    elif isinstance(new_item, ToolCallItem):
                        print(f"{agent_name}: Calling a tool")
                    elif isinstance(new_item, ToolCallOutputItem):
                        print(f"{agent_name}: Tool call output: {new_item.output}")
                    else:
                        print(f"{agent_name}: Skipping item: {new_item.__class__.__name__}")
                input_items = result.to_input_list()
