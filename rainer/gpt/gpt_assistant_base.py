import json
import os
import logging
from typing import Optional

import openai
from django.conf import settings

from rainer.agents.prompts import COMPREHENSIVE_ASSISTANT_PROMPT
from ..settings import DEFAULT_GPT_MODEL

# Get the absolute path to the project root directory
project_root = settings.BASE_DIR if hasattr(settings, 'BASE_DIR') else ""
if not project_root:
    raise ValueError("You need to set BASE_DIR environment variable in django settings")

# Join the project root directory with the JSON file path
CONFIG_FILE = os.path.join(project_root, "openai_config.json")
logger = logging.getLogger(__name__)


class OpenAIAssistantProvider:
    def __init__(self, model: Optional[str] = None):
        self.model = model or DEFAULT_GPT_MODEL
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.config = self._load_or_create_config()

    def _load_or_create_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r") as f:
                    config = json.load(f)
            except Exception as e:
                logger.error(f"Failed to load config: {e}")
                config = {}
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
