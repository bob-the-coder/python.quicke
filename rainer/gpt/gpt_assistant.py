import json
from typing import List, Optional

from ..settings import DEFAULT_GPT_MODEL
from ..gpt.gpt_assistant_base import OpenAIAssistantProvider
from ..models import CodeGenerationData
from .. import *


class GPTAssistantAPI:
    def __init__(self, model: str = DEFAULT_GPT_MODEL):
        self.assistant_provider = OpenAIAssistantProvider(model=model)
        self.thread_id = self.assistant_provider.config["thread_id"]
        self.assistant_id = self.assistant_provider.config["assistant_id"]
        self.threads = self.assistant_provider.client.beta.threads

    def add_message(self, content: str):
        self.threads.messages.create(
            thread_id=self.thread_id,
            role="user",
            content=content,
        )

    def run(self):
        self.threads.runs.create_and_poll(
            assistant_id=self.assistant_id,
            thread_id=self.thread_id,
            max_prompt_tokens=30_000,
            max_completion_tokens=30_000,
        )

    def get_last_message(self) -> str:
        messages = self.threads.messages.list(
            thread_id=self.thread_id,
            order="desc",
            limit=1,
        )
        for message in messages.data:
            if hasattr(message, "role") and message.role == "assistant":
                return message.content
            elif isinstance(message, Dict) and message["role"] == "assistant":
                return message["content"]

        return ""

    def handle_file(self, rainer_file: RainerFile, instruction: str) -> Optional[CodeGenerationData]:
        branch, path = unpack_file_ref(rainer_file)
        file_contents = get_rainer_file_contents(branch, path)
        if not file_contents:
            return None

        self.add_message(instruction)
        self.run()

        generated_code = self.get_last_message()

        if generated_code:
            return CodeGenerationData.objects.create(
                llm_model=self.assistant_provider.model,
                instructions=[instruction],
                response=generated_code,
                rainer_branch=branch,
                rainer_path=path
            )

        return None

    def find_references(self, rainer_file: RainerFile, instruction: str) -> List[RainerFile]:
        branch, path = unpack_file_ref(rainer_file)
        file_contents = get_rainer_file_contents(branch, path)
        if not file_contents:
            return []

        self.add_message(instruction)
        self.run()

        raw_response = self.get_last_message()

        if not raw_response:
            return []

        try:
            relevant_files = json.loads(raw_response)
            return [RainerFile.from_dict(ref) for ref in relevant_files]
        except json.JSONDecodeError:
            return []

    def update_file_definition(self, rainer_file: RainerFile, instruction: str) -> str:
        """Add a message to the thread without running it."""
        branch, path = unpack_file_ref(rainer_file)
        file_contents = get_rainer_file_contents(branch, path)
        if not file_contents:
            return ""

        self.add_message(instruction)
        self.run()

        raw_response = self.get_last_message()

        return raw_response or ""


def get_gpt_assistant(model: Optional[str] = DEFAULT_GPT_MODEL):
    return GPTAssistantAPI(model=model)


# Example Usage
if __name__ == "__main__":
    api = GPTAssistantAPI(model="gpt-4o")

    file = RainerFile(branch="main", path="path/to/file.py")

    # Update file definition
    api.update_file_definition(file, "Refactor this file to improve readability.")
