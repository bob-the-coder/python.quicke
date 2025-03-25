from typing import Any, Dict

import quicke


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