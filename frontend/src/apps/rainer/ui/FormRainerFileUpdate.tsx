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

function FileReferenceList({ files, onRemove }: { files: { branch: string; path: string }[], onRemove: (index: number) => void }) {
    return (
        <ul className="list-disc list-inside flex flex-col gap-1">
            {files.map((file, index) => (
                <li key={`${file.branch}-${file.path}`} className="flex justify-between items-center">
                    <span className="text-sm font-mono text-muted-foreground">{`${file.branch}/${file.path}`}</span>
                    <Button size={'xs'} variant={'destructive'} onClick={() => onRemove(index)}>Remove</Button>
                </li>
            ))}
        </ul>
    );
}

export function FormRainerFileUpdate({ branch, path, children }: Props) {
    const { updateFile } = useRainer();

    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState(false);
    const [fileReferences, setFileReferences] = useState<{ branch: string; path: string }[]>([]);
    const [instructions, setInstructions] = useState("");

    const handleSave = async () => {
        setPending(true);
        const localText = `${instructions}\n\nFile References:\n${fileReferences.map(file => `${file.branch}/${file.path}`).join("\n")}`;
        updateFile({ branch, path, content: localText, file_references: fileReferences });
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

    const getFileReferencesByBranch = (branch: string) => {
        return fileReferences.filter(file => file.branch === branch);
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
                    <Label htmlFor="instructions-textarea" className="text-sm">Instructions</Label>
                    <textarea
                        id="instructions-textarea"
                        className="h-64 p-4 font-mono text-sm border rounded-md"
                        placeholder={"Write your custom instruction here"}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                </div>
                <div>
                    <div className="w-full flex gap-2">
                    </div>
                    <div className="flex flex-col gap-4 mt-2">
                        <div className={"flex flex-col gap-2"}>
                            <h3 className="font-semibold text-sm">Backend References</h3>
                            <FileReferenceList files={getFileReferencesByBranch("backend")} onRemove={handleRemoveFile} />
                            <RainerFilePicker branch={"backend"} onChange={handleFileChange} />
                        </div>
                        <div className={"flex flex-col gap-2"}>
                            <h3 className="font-semibold text-sm">Frontend References</h3>
                            <FileReferenceList files={getFileReferencesByBranch("frontend")} onRemove={handleRemoveFile} />
                            <RainerFilePicker branch={"frontend"} onChange={handleFileChange} />
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={pending}>
                        Refactor <RiSparkling2Fill />
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
