"use client";

import { FormEvent, useState } from "react";
import { useRainer } from "@/apps/rainer/hooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RiSparkling2Fill } from "react-icons/ri";
import { RainerFilePicker } from "@/apps/rainer/ui/RainerFilePicker";
import { Spinner } from "@/components/ui/spinner";
import { MdAutoFixHigh } from "react-icons/md";
import { ScrollbarCustom } from "@/components/ScrollbarCustom";

type FileReference = {
    branch: "backend" | "frontend";
    path: string;
};

type FormRainerFileCreateProps = {
    branch?: "backend" | "frontend";
};

function FileReferenceList({
    files,
    onRemove
}: {
    files: FileReference[];
    onRemove: (index: number) => void
}) {
    if (!files.length) return null;
    return (
        <ul className="list-disc list-inside flex flex-col gap-1 my-4">
            {files.map((file, index) => (
                <li key={`${file.branch}-${file.path}`} className="flex justify-between items-center gap-4">
                    <span className="text-sm font-mono text-muted-foreground overflow-hidden text-ellipsis">
                        {`${file.branch}/${file.path}`}
                    </span>
                    <Button size="xs" variant="destructive" onClick={() => onRemove(index)}>
                        Remove
                    </Button>
                </li>
            ))}
        </ul>
    );
}

export function FormRainerFileCreate({ branch: initialBranch = "backend" }: FormRainerFileCreateProps) {
    const { createFile } = useRainer();

    const [branch, setBranch] = useState<"backend" | "frontend">(initialBranch);
    const [path, setPath] = useState("");
    const [instructions, setInstructions] = useState("");
    const [fileReferences, setFileReferences] = useState<FileReference[]>([]);

    const handleSave = async (e: FormEvent) => {
        e.preventDefault();

        createFile.mutate(
            { branch, path, content: instructions, file_references: fileReferences },
        );
    };

    const handleFileChange = (file: FileReference) => {
        setFileReferences(prev => {
            const isDuplicate = prev.some(
                existingFile => existingFile.branch === file.branch && existingFile.path === file.path
            );
            if (!isDuplicate) {
                return [...prev, file];
            }
            return prev;
        });
    };

    const handleRemoveFile = (index: number) => {
        setFileReferences(prev => prev.filter((_, i) => i !== index));
    };

    const getFileReferencesByBranch = (branch: "backend" | "frontend") => {
        return fileReferences.filter(file => file.branch === branch);
    };

    return (
        <form onSubmit={handleSave} className="flex flex-col h-full w-full">
            <b className="typo-h1 border-b p-4 flex items-center gap-4">
                <MdAutoFixHigh /> Create File
            </b>
            <ScrollbarCustom noScrollX={true}>
                <div className="flex flex-col gap-2 p-4">
                    <div className="flex gap-2">
                        <div className="w-fit">
                            <Label className="text-sm">Branch</Label>
                            <div className="flex gap-2">
                                <Button variant={branch === "backend" ? "default" : "outline"} onClick={() => setBranch("backend")}>
                                    Backend
                                </Button>
                                <Button variant={branch === "frontend" ? "default" : "outline"} onClick={() => setBranch("frontend")}>
                                    Frontend
                                </Button>
                            </div>
                        </div>
                        <div className="w-full">
                            <Label htmlFor="path-input" className="text-sm">Path</Label>
                            <input
                                id="path-input"
                                type="text"
                                placeholder="Enter file path"
                                value={path}
                                onChange={(e) => setPath(e.target.value)}
                                className="p-2 border rounded-md text-sm w-full"
                            />
                        </div>
                    </div>

                    <div className="grid gap-1">
                        <Label htmlFor="instructions-textarea" className="text-sm">Instructions</Label>
                        <textarea
                            id="instructions-textarea"
                            className="h-56 p-4 font-mono text-sm border rounded-md"
                            placeholder="Write your custom instruction here"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                        <div>
                            <b className="font-semibold text-sm">Backend References</b>
                            <FileReferenceList
                                files={getFileReferencesByBranch("backend")}
                                onRemove={handleRemoveFile}
                            />
                            <RainerFilePicker
                                branch="backend"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div>
                            <b className="font-semibold text-sm">Frontend References</b>
                            <FileReferenceList
                                files={getFileReferencesByBranch("frontend")}
                                onRemove={handleRemoveFile}
                            />
                            <RainerFilePicker
                                branch="frontend"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </div>
            </ScrollbarCustom>

            <div className="p-4 border-t">
                <Button
                    type="submit"
                    disabled={!branch || !path || !instructions || createFile.isPending}
                >
                    Create {createFile.isPending ? <Spinner /> : <RiSparkling2Fill />}
                </Button>
            </div>
        </form>
    );
}
