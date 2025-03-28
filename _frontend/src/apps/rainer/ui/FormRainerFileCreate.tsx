

"use client";

import { FormEvent, useEffect, useState } from "react";
import {useRainer, useRainerProject} from "@/apps/rainer/hooks";
import { Button } from "@/components/ui/button"; 
import { Label } from "@/components/ui/label"; 
import { RiSparkling2Fill } from "react-icons/ri"; 
import { Spinner } from "@/components/ui/spinner"; 
import { MdAutoFixHigh } from "react-icons/md"; 
import { ScrollbarCustom } from "@/components/ScrollbarCustom"; 
import { RainerFile } from "@/apps/rainer/models"; 
import FileExtensionPicker from "@/apps/rainer/ui/FileExtensionPicker"; 

type FormRainerFileCreateProps = {};

function FileReferenceList({
    files,
    onRemove
}: {
    files: RainerFile[]; 
    onRemove: (index: number) => void; 
}) {
    if (!files.length) return null;

    return (
        <ul className="list-disc list-inside flex flex-col gap-1 my-4">
            {files.map((file, index) => (
                <li key={`${file.project}-${file.path}`} className="flex justify-between items-center gap-4">
                    <span className="text-sm font-mono text-muted-foreground overflow-hidden text-ellipsis">
                        {`${file.project}/${file.path}`} 
                    </span>
                    <Button size="xs" variant="destructive" onClick={() => onRemove(index)}> 
                        Remove 🗑️
                    </Button>
                </li>
            ))}
        </ul>
    );
}

const Notification = ({ message, type, onClose }) => (
    <div className={`notification ${type}`}>
        <span>{message}</span>
        <button onClick={onClose}>✖️</button>
    </div>
);

export function FormRainerFileCreate({}: FormRainerFileCreateProps) {
    const { project } = useRainerProject();
    const {createFile} = useRainer();
    const [path, setPath] = useState(""); 
    const [instructions, setInstructions] = useState(""); 
    const [fileReferences, setFileReferences] = useState<RainerFile[]>([]); 
    const [pathInputPadding, setPathInputPadding] = useState(10); 
    const [extension, setExtension] = useState('.js'); 
    const [notification, setNotification] = useState(null);

    const projectPath = `~/${((project || {})["__path__"] || "")}/`;

    useEffect(() => {
        const pathElement = document.getElementById("project-path");
        if (pathElement) {
            const padding = pathElement.offsetWidth + 17; 
            setPathInputPadding(padding);
        }
    }, [projectPath]);

    const validateInputs = (): boolean => {
        const prohibitedCharacters = /[<>:"|?*]/;
        if (prohibitedCharacters.test(path)) {
            alert("File path contains invalid characters.");
            return false;
        }
        if (instructions.trim().length === 0) {
            alert("Instructions cannot be empty.");
            return false;
        }
        return true; 
    };

    const handleSave = async (e: FormEvent) => {
        e.preventDefault(); 
        if (!validateInputs()) return; 

        const fullPath = path.endsWith(extension) ? path : path + extension;

        try {
            createFile.mutate({
                project: project,
                path: fullPath,
                content: instructions,
                file_references: fileReferences,
            });
            setNotification({ message: 'File created successfully!', type: 'success' });
        } catch (error) {
            console.error("Error creating file:", error);
            setNotification({ message: 'Failed to create the file. Please try again.', type: 'error' });
        }
    };

    const handleFileChange = (file: RainerFile) => {
        setFileReferences(prev => {
            const isDuplicate = prev.some(
                existingFile => existingFile.project === file.project && existingFile.path === file.path
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

    const getFileReferencesByProject = () => {
        return fileReferences; 
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault(); 
            handleSave(e as unknown as FormEvent); 
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown); 
        return () => {
            window.removeEventListener('keydown', handleKeyDown); 
        };
    }, []);

    return (
        <form onSubmit={handleSave} className="flex flex-col h-full w-full"> 
            <b className="typo-h1 border-b p-4 flex items-center gap-4">
                <MdAutoFixHigh /> Create File ✨
            </b>
            <ScrollbarCustom noScrollX={true}> 
                <div className="flex flex-col gap-2 p-4">
                    <div className="w-full relative flex flex-col gap-1 pt-2">
                        <Label>Output path</Label> 
                        <div className="w-full relative flex items-center gap-2">
                            <Label id="project-path"
                                   className="text-sm absolute left-2 text-muted-foreground">{projectPath}</Label> 
                            <input
                                type="text"
                                placeholder="Enter file path" 
                                value={path}
                                onChange={(e) => setPath(e.target.value)} 
                                className={`p-2 border rounded-md text-sm w-full`} 
                                style={{paddingLeft: pathInputPadding}}
                            />
                            <FileExtensionPicker value={extension}
                                                 onChange={setExtension}/> 
                        </div>
                    </div>

                    <div className="grid gap-1">
                        <Label htmlFor="instructions-textarea" className="text-sm">Instructions</Label> 
                        <textarea
                            id="instructions-textarea"
                            className="h-56 p-4 font-mono text-sm border rounded-md" 
                            placeholder="Write your custom instruction here ✍️" 
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)} 
                        />
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                        <div>
                            <b className="font-semibold text-sm">References</b> 
                            <FileReferenceList
                                files={getFileReferencesByProject()} 
                                onRemove={handleRemoveFile} 
                            />
                        </div>
                    </div>
                </div>
            </ScrollbarCustom>

            {notification && (
                <Notification 
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)} 
                />
            )}

            <div className="p-4 border-t">
                <Button
                    type="submit" 
                    disabled={!path || !instructions || createFile.isPending} 
                >
                    Create {createFile.isPending ? <Spinner /> : <RiSparkling2Fill />} 
                </Button>
            </div>
        </form>
    );
}
