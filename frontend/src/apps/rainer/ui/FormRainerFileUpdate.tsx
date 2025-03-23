"use client";

import { ReactNode, useState } from "react";
import { useRainer } from "@/apps/rainer/hooks";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RiSparkling2Fill } from "react-icons/ri";
import { RainerFilePicker } from "@/apps/rainer/ui/RainerFilePicker";

type Props = {
    branch: "backend" | "frontend";
    path: string;
    children: ReactNode;
};

export function FormRainerFileUpdate({ branch, path, children }: Props) {
    const { updateFile } = useRainer();

    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [fileReferences, setFileReferences] = useState<{ branch: string; path: string }[]>([]);
    const [instructions, setInstructions] = useState("");

    const handleSave = async () => {
        setPending(true);
        const localText = `${instructions}\n\nFile References:\n${fileReferences.map(file => `${file.branch}/${file.path}`).join("\n")}`;
        updateFile({ branch, path, content: localText });
        setPending(false);
    };

    const handleFileChange = (file: { branch: string; path: string }) => {
        setFileReferences(prev => {
            const isDuplicate = prev.some(existingFile => existingFile.branch === file.branch && existingFile.path === file.path);
            if (!isDuplicate) {
                return [...prev, file];
            }
            return prev;
        });
    };

    const handleRemoveFile = (index: number) => {
        setFileReferences(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-[600px] space-y-4" align="start">
                <div className="flex flex-col gap-2 pb-3">
                    <b className="font-bold text-foreground">REFACTOR</b>
                    <div className="flex items-center gap-2">
                        <Badge className="text-sm" variant={'outline'}>{branch}</Badge> {path}
                    </div>
                    <span className="text-xs text-gray-500">Please customize your refactoring instructions below.</span>
                </div>
                <div className="grid gap-1">
                    <Label className="text-xs" htmlFor="instructions-textarea">Instructions</Label>
                    <textarea
                        id="instructions-textarea"
                        className="h-64 p-4 font-mono text-sm border rounded-md"
                        placeholder={"Write your custom instruction here"}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                </div>
                <div>
                    <Label className="text-xs">File References</Label>
                    <ul className="list-disc list-inside">
                        {fileReferences.map((file, index) => (
                            <li key={`${file.branch}-${file.path}`} className="flex justify-between items-center">
                                <span className="text-sm font-mono">{`${file.branch}/${file.path}`}</span>
                                <Button size={'sm'} variant={'destructive'} onClick={() => handleRemoveFile(index)}>Remove</Button>
                            </li>
                        ))}
                    </ul>
                </div>
                <RainerFilePicker branch={branch} onChange={handleFileChange} />
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={pending}>
                        Refactor <RiSparkling2Fill />
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
