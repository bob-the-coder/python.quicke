// components/RainerFilePicker.tsx

"use client";

import React from "react";
import { useRainer } from "../hooks";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type FileIdentifier = {
  branch: "backend" | "frontend";
  path: string;
};

type Props = {
  branch: "backend" | "frontend";
  value?: FileIdentifier;
  onChange: (value: FileIdentifier) => void;
  label?: string;
};

interface FolderNode {
  files: FileIdentifier[];
  children: Record<string, FolderNode>;
}

function buildTree(paths: string[], branch: "backend" | "frontend"): FolderNode {
  const root: FolderNode = { files: [], children: {} };

  for (const path of paths) {
    const parts = path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        current.files.push({ branch, path });
      } else {
        if (!current.children[part]) {
          current.children[part] = { files: [], children: {} };
        }
        current = current.children[part];
      }
    }
  }

  return root;
}

function renderTree(
  node: FolderNode,
  prefix: string = ""
): React.ReactNode[] {
  const entries: React.ReactNode[] = [];

  for (const file of node.files) {
    entries.push(
      <SelectItem
        key={file.path}
        value={file.path}
        className="pl-6 font-mono text-xs"
      >
        {file.path.split("/").pop()}
      </SelectItem>
    );
  }

  for (const [dirName, subNode] of Object.entries(node.children)) {
    const fullPath = prefix ? `${prefix}/${dirName}` : dirName;

    entries.push(
      <SelectGroup key={fullPath}>
        <SelectLabel className="pl-2 text-xs font-semibold">{fullPath}/</SelectLabel>
        {renderTree(subNode, fullPath)}
      </SelectGroup>
    );
  }

  return entries;
}

export function RainerFilePicker({ branch, value, onChange, label = "" }: Props) {
  const { getTree } = useRainer();

  const filePaths = React.useMemo(() => {
    if (!getTree) return [];
    return Object.keys(getTree[branch] || {});
  }, [getTree, branch]);

  const fileTree = React.useMemo(() => buildTree(filePaths, branch), [filePaths, branch]);

  const handleChange = (selected: string) => {
    onChange({ branch, path: selected });
  };

  return (
    <div className="grid gap-2">
      {label && <Label>{label}</Label>}
      <Select value={value?.path || ""} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select a ${branch} file`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>{renderTree(fileTree)}</SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
