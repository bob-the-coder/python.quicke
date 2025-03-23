import quicke
from quicke.lib import BaseModel
from typing import List, Dict, Any
from django.db import models

@quicke.model({
    "exclude_fields": ["to_dict", "from_dict"],
})
class RainerFile:
    branch: str = ""
    path: str = ""

    def __init__(self, branch: str = "", path: str = "") -> None:
        self.branch: str = branch
        self.path: str = path

    def to_dict(self) -> Dict[str, Any]:
        return {"branch": self.branch, "path": self.path}

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'RainerFile':
        return cls(branch=data.get("branch", ""), path=data.get("path", ""))

@quicke.model()
class CodeGenerationData(BaseModel):
    llm_model: str = models.CharField(max_length=255)
    instructions: List[Dict[str, Any]] = models.JSONField(default=list)
    response: str = models.TextField(default="")
    rainer_branch: str = models.CharField(max_length=255, default="")
    rainer_path: str = models.CharField(max_length=255, default="")

    @property
    def rainer_file_instance(self) -> RainerFile:
        return RainerFile(branch=self.rainer_branch, path=self.rainer_path)

    @rainer_file_instance.setter
    def rainer_file_instance(self, value: RainerFile) -> None:
        self.rainer_branch = value.branch
        self.rainer_path = value.path
