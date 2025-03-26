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

type Props = {
    project: string;
    path: string;
};

// Component for displaying a list of file references 🔄
function FileReferenceList({ files, onRemove }: { files: { project: string; path: string }[], onRemove: (index: number) => void }) {
    if (!files.length) return null; // No files to display ❌
    return (
        <ul className="list-disc list-inside flex flex-col gap-1 my-4">
            {files.map((file, index) => (
                <li key={`${file.project}-${file.path}`} className="flex justify-between items-center gap-4">
                    <span className="text-sm font-mono text-muted-foreground overflow-hidden text-ellipsis">
                        {`${file.project}/${file.path}`} {/* Display the file path 👁️ */}
                    </span>
                    <Button size="xs" variant="destructive" onClick={() => onRemove(index)}>Remove</Button> {/* Remove button 🗑️ */}
                </li>
            ))}
        </ul>
    );
}

export function FormRainerFileUpdate({ project, path }: Props) {
    const { updateFile } = useRainer(); // Hook to manage file updates 📡

    const [fileReferences, setFileReferences] = useState<{ project: string; path: string }[]>([]); // State to hold file references 📂
    const [instructions, setInstructions] = useState(""); // State to hold instructions ✍️

    const handleSave = async (e: FormEvent) => {
        e.preventDefault(); // Prevent default form submission 🚫

        updateFile.mutate(
            { project, path, content: instructions, file_references: fileReferences }, // Update file request 🔄
        );
    };

    const handleFileChange = (file: { project: string; path: string }) => {
        setFileReferences(prev => {
            const isDuplicate = prev.some(existingFile => existingFile.project === file.project && existingFile.path === file.path); // Check for duplicates ⚠️
            if (!isDuplicate) {
                return [...prev, file]; // Add new file reference ➕
            }
            return prev; // Return existing references if duplicate found 🔁
        });
    };

    const handleRemoveFile = (index: number) => {
        setFileReferences(prev => prev.filter((_, i) => i !== index)); // Remove file reference by index ❌
    };

    const getFileReferencesByProject = (project: string) => {
        return fileReferences.filter(file => file.project === project); // Filter file references by project 🔍
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'Enter') {
            handleSave(e as any); // Save on Ctrl + Enter ⌨️
        }
    };

    return (
        <form onSubmit={handleSave} className="flex flex-col h-full w-full" onKeyDown={handleKeyDown}>
            <b className="typo-h1 border-b p-4 flex items-center gap-4"><MdAutoFixHigh />Refactor</b> {/* Header for form section 🛠️ */}
            <ScrollbarCustom noScrollX={true}> {/* Custom scrollbar for better UX ⬇️ */}
                <div className="flex flex-col gap-2 p-4">
                    <div className="grid gap-1">
                        <Label htmlFor="instructions-textarea" className="text-sm">Instructions</Label> {/* Label for instructions textarea 📋 */}
                        <textarea
                            id="instructions-textarea"
                            className="h-64 p-4 font-mono text-sm border rounded-md"
                            placeholder="Write your custom instruction here" // Placeholder text for textarea 📝
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)} // Update instructions state on change 🔄
                        />
                    </div>
                    <div className="flex flex-col gap-4 mt-2">
                        <div>
                            <b className="font-semibold text-sm">Backend References</b> {/* Backend references header 🔧 */}
                            <FileReferenceList files={getFileReferencesByProject("backend")}
                                               onRemove={handleRemoveFile} /> {/* Display list of backend files 📂 */}
                            <RainerFilePicker project="backend" onChange={handleFileChange} /> {/* File picker for backend files 📥 */}
                        </div>
                        <div>
                            <b className="font-semibold text-sm">Frontend References</b> {/* Frontend references header 🖥️ */}
                            <FileReferenceList files={getFileReferencesByProject("frontend")}
                                               onRemove={handleRemoveFile} /> {/* Display list of frontend files 📂 */}
                            <RainerFilePicker project="frontend" onChange={handleFileChange} /> {/* File picker for frontend files 📥 */}
                        </div>
                    </div>
                </div>
            </ScrollbarCustom>
            <div className="p-4 border-t">
                <Button type="submit" disabled={!instructions || updateFile.isPending}>
                    Refactor {updateFile.isPending ? <Spinner /> : <RiSparkling2Fill />} {/* Submit button to refactor with spinner while loading ⏳ */}
                </Button>
            </div>
        </form>
    );
}
