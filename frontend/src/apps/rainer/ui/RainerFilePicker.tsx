"use client";

import { useState } from "react";
import { useRainer } from "../hooks";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {RainerFileTree} from "@/apps/rainer/ui/RainerFileTree";
import {RainerFile} from "@/apps/rainer/models";
import {ScrollbarCustom} from "@/components/ScrollbarCustom";


type Props = {
  branch: "backend" | "frontend";
  value?: string;
  onChange: (value: RainerFile) => void;
  label?: string;
};

export const RainerFilePicker = ({ branch, value, onChange, label = "" }: Props) => {
  const { getTree } = useRainer();
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (selected: string) => {
    onChange({ branch, path: selected });
  };

  return (
    <div className="w-full grid gap-2">
      {label && <Label>{label}</Label>}
      <Select value={value || ""} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select a ${branch} file`} />
        </SelectTrigger>
        <SelectContent className={'w-full h-100 min-w-64'} >
          <div className="w-full pb-2 border-b">
            <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border rounded w-full"
            />
          </div>
          <ScrollbarCustom noScrollX={true} className={'w-full'}>
            <RainerFileTree path={value || ""} tree={getTree![branch]} onSelect={handleChange}
                            searchQuery={searchQuery}/>
          </ScrollbarCustom>
        </SelectContent>
      </Select>
    </div>
  );
};
