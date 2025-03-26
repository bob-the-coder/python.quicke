import logging
from typing import List

import openai
from django.conf import settings

from rainer.settings import DEFAULT_GPT_MODEL

logger = logging.getLogger(__name__)


class OpenAIProvider:
    def __init__(self, model):
        """Initialize OpenAI API client."""
        self.model = model or DEFAULT_GPT_MODEL
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

    def send_instructions(self, instructions: List[str]):
        if len(instructions) == 0:
            return ""

        try:
            messages = [
                {"role": "user", "content": instruction.strip()}
                for instruction in instructions if instruction.strip()
            ]

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                response_format={"type": "text"}
            )

            response_message = response.choices[0].message.content

            return response_message

        except Exception as e:
            logger.error(f"GPT ERROR: {e or 'Unknown error'}")
            return None


def get_gpt(model: str | None = None):
    return OpenAIProvider(model=model)
