"use client";

import {FormEvent, useState} from "react";
import { useRainer } from "@/apps/rainer/hooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RiSparkling2Fill } from "react-icons/ri";
import { RainerFilePicker } from "@/apps/rainer/ui/RainerFilePicker";
import { Spinner } from "@/components/ui/spinner";
import {MdAutoFixHigh} from "react-icons/md";

type Props = {
    branch: "backend" | "frontend";
    path: string;
};

function FileReferenceList({ files, onRemove }: { files: { branch: string; path: string }[], onRemove: (index: number) => void }) {
    return (
        <ul className="list-disc list-inside flex flex-col gap-1 my-4">
            {files.map((file, index) => (
                <li key={`${file.branch}-${file.path}`} className="flex justify-between items-center">
                    <span className="text-sm font-mono text-muted-foreground">{`${file.branch}/${file.path}`}</span>
                    <Button size="xs" variant="destructive" onClick={() => onRemove(index)}>Remove</Button>
                </li>
            ))}
        </ul>
    );
}

export function FormRainerFileUpdate({ branch, path }: Props) {
    const { updateFile } = useRainer();

    const [fileReferences, setFileReferences] = useState<{ branch: string; path: string }[]>([]);
    const [instructions, setInstructions] = useState("");

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();
        const localText = `${instructions}\n\nFile References:\n${fileReferences.map(file => `${file.branch}/${file.path}`).join("\n")}`;

        updateFile.mutate(
            { branch, path, content: localText, file_references: fileReferences },
        );
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
        <form onSubmit={handleSave} className="flex flex-col gap-4">
            <b className="typo-h1 border-b p-4 flex items-center gap-4"><MdAutoFixHigh />Refactor</b>
            <div className="flex flex-col gap-2 px-4">
            <div className="grid gap-1">
                <Label htmlFor="instructions-textarea" className="text-sm">Instructions</Label>
                <textarea
                    id="instructions-textarea"
                    className="h-64 p-4 font-mono text-sm border rounded-md"
                    placeholder="Write your custom instruction here"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                />
            </div>
                <div className="flex flex-col gap-4 mt-2">
                    <div>
                        <b className="font-semibold text-sm">Backend References</b>
                        <FileReferenceList files={getFileReferencesByBranch("backend")} onRemove={handleRemoveFile}/>
                        <RainerFilePicker branch="backend" onChange={handleFileChange}/>
                    </div>
                    <div>
                        <b className="font-semibold text-sm">Frontend References</b>
                        <FileReferenceList files={getFileReferencesByBranch("frontend")} onRemove={handleRemoveFile}/>
                        <RainerFilePicker branch="frontend" onChange={handleFileChange}/>
                    </div>
                </div>
                <div className="flex justify-end">
                <Button type="submit" disabled={updateFile.isPending}>
                    Refactor {updateFile.isPending ? <Spinner/> : <RiSparkling2Fill/>}
                </Button>
            </div>
            </div>
        </form>
    );
}
