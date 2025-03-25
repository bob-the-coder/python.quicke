import json
import os
import logging
from typing import Optional

import openai
from django.conf import settings

from apps.rainer.assistant_prompts import COMPREHENSIVE_ASSISTANT_PROMPT
from apps.rainer.settings import DEFAULT_GPT_MODEL

logger = logging.getLogger(__name__)

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "openai_config.json")

class OpenAIAssistantProvider:
    def __init__(self, model: Optional[str] = None):
        self.model = model or DEFAULT_GPT_MODEL
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.config = self._load_or_create_config()

    def _load_or_create_config(self):
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, "r") as f:
                config = json.load(f)
        else:
            config = {}

        assistant_id = config.get("assistant_id")
        thread_id = config.get("thread_id")

        if not assistant_id:
            logger.info("Creating new assistant...")
            assistant_id = self._create_assistant()
            config["assistant_id"] = assistant_id

        if not thread_id:
            logger.info("Creating new thread...")
            thread_id = self._create_thread()
            config["thread_id"] = thread_id

        self._save_config(config)

        return config

    def _create_assistant(self):
        response = self.client.beta.assistants.create(
            name="COMPREHENSIVE_ASSISTANT_PROMPT",
            instructions=COMPREHENSIVE_ASSISTANT_PROMPT,
            model=self.model
        )
        return response.id

    def _create_thread(self):
        response = self.client.beta.threads.create()
        return response.id

    def _save_config(self, config):
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=4)

def get_gpt_assistant(model: Optional[str] = None):
    return OpenAIAssistantProvider(model=model)
