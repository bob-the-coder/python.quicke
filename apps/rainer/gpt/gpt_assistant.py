import json
from typing import List, Optional

from ..gpt.gpt_assistant_base import OpenAIAssistantProvider
from ..models import CodeGenerationData
from .. import *


class GPTAssistantAPI:
    def __init__(self, model: str = None):
        self.assistant_provider = OpenAIAssistantProvider(model=model)

    def _send_request(self, content: str) -> Optional[str]:
        response = self.assistant_provider.client.beta.threads.messages.create(
            thread_id=self.assistant_provider.config["thread_id"],
            role="user",
            content=content
        )
        return response.get("content", "")

    def handle_file(self, rainer_file: RainerFile, instruction: str) -> Optional[CodeGenerationData]:
        branch, path = unpack_file_ref(rainer_file)
        file_contents = get_file_contents(branch, path)
        if not file_contents:
            return None

        generated_code = self._send_request(instruction)

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
        file_contents = get_file_contents(branch, path)
        if not file_contents:
            return []

        raw_response = self._send_request(instruction)
        if not raw_response:
            return []

        try:
            relevant_files = json.loads(raw_response)
            return [RainerFile.from_dict(ref) for ref in relevant_files]
        except json.JSONDecodeError:
            return []

    def update_file_definition(self, rainer_file: RainerFile, instruction: str) -> None:
        """Add a message to the thread without running it."""
        branch, path = unpack_file_ref(rainer_file)
        file_contents = get_file_contents(branch, path)
        if not file_contents:
            return

        content = f"Update the following file definition:\n\n{file_contents}\n\nInstruction:\n{instruction}"

        # Send the message without expecting a response
        self.assistant_provider.client.beta.threads.messages.create(
            thread_id=self.assistant_provider.config["thread_id"],
            role="user",
            content=content
        )


# Example Usage
if __name__ == "__main__":
    api = GPTAssistantAPI(model="gpt-4o")

    file = RainerFile(branch="main", path="path/to/file.py")

    # Update file definition
    api.update_file_definition(file, "Refactor this file to improve readability.")
