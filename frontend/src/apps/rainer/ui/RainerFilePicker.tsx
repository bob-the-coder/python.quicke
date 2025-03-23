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

const buildTree = (paths: string[], branch: "backend" | "frontend"): FolderNode => {
  const root: FolderNode = { files: [], children: {} };

  paths.forEach(path => {
    const parts = path.split("/");
    let current = root;

    parts.forEach((part, i) => {
      const isFile = i === parts.length - 1;

      if (isFile) {
        current.files.push({ branch, path });
      } else {
        if (!current.children[part]) {
          current.children[part] = { files: [], children: {} };
        }
        current = current.children[part];
      }
    });
  });

  return root;
};

const renderTree = (node: FolderNode, prefix: string = ""): React.ReactNode[] => {
  const entries: React.ReactNode[] = [];

  node.files.forEach(file => {
    entries.push(
      <SelectItem key={file.path} value={file.path} className="pl-6 font-mono text-xs">
        {file.path.split("/").pop()}
      </SelectItem>
    );
  });

  Object.entries(node.children).forEach(([dirName, subNode]) => {
    const fullPath = prefix ? `${prefix}/${dirName}` : dirName;

    entries.push(
      <SelectGroup key={fullPath}>
        <SelectLabel className="pl-2 text-xs font-semibold">{fullPath}/</SelectLabel>
        {renderTree(subNode, fullPath)}
      </SelectGroup>
    );
  });

  return entries;
};

export const RainerFilePicker = ({ branch, value, onChange, label = "" }: Props) => {
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
    <div className="w-full grid gap-2">
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
};
