"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRainer } from "@/apps/rainer/hooks"; // Custom hook for managing file creation
import { Button } from "@/components/ui/button"; // Button component for user interactions
import { Label } from "@/components/ui/label"; // Label component for form elements
import { RiSparkling2Fill } from "react-icons/ri"; // Icon for additional visual representation
import { RainerFilePicker } from "@/apps/rainer/ui/RainerFilePicker"; // File picker component to select files
import { Spinner } from "@/components/ui/spinner"; // Spinner component to show loading status
import { MdAutoFixHigh } from "react-icons/md"; // Icon for file creation header
import { ScrollbarCustom } from "@/components/ScrollbarCustom"; // Custom scrollbar component for better UI
import { RainerFile } from "@/apps/rainer/models"; // Model representing a file structure
import FileExtensionPicker from "@/apps/rainer/ui/FileExtensionPicker"; // File extension picker component

// Props type to define the project, defaulting to "backend"
type FormRainerFileCreateProps = {
    project?: "backend" | "frontend";
};

// Component for displaying a list of file references with an option to remove them
function FileReferenceList({
    files,
    onRemove
}: {
    files: RainerFile[]; // Array of file references
    onRemove: (index: number) => void; // Callback to remove a file reference
}) {
    // Return null if there are no files to display
    if (!files.length) return null;

    return (
        <ul className="list-disc list-inside flex flex-col gap-1 my-4">
            {files.map((file, index) => (
                <li key={`${file.project}-${file.path}`} className="flex justify-between items-center gap-4">
                    <span className="text-sm font-mono text-muted-foreground overflow-hidden text-ellipsis">
                        {`${file.project}/${file.path}`} {/* Display the file path for reference */}
                    </span>
                    <Button size="xs" variant="destructive" onClick={() => onRemove(index)}> {/* Button to remove the file reference */}
                        Remove 🗑️
                    </Button>
                </li>
            ))}
        </ul>
    );
}

// Main component for creating a file in the selected project
export function FormRainerFileCreate({ project: initialProject = "backend" }: FormRainerFileCreateProps) {
    const { createFile, getTree } = useRainer(); // Destructure createFile mutation and getTree function from useRainer hook
    const [project, setProject] = useState<"backend" | "frontend">(initialProject); // State for determining the current project
    const [path, setPath] = useState(""); // State for storing the file path input
    const [instructions, setInstructions] = useState(""); // State for storing instruction input
    const [fileReferences, setFileReferences] = useState<RainerFile[]>([]); // State for storing selected file references
    const [pathInputPadding, setPathInputPadding] = useState(10); // State for input left padding
    const [extension, setExtension] = useState('.js'); // State for storing the selected file extension

    // Construct the project path using getTree information, ensuring it uses the current project and has a trailing "/"
    const projectPath = `~/${((getTree || {})[project] || {})["__path__"] || ""}/`;

    useEffect(() => {
        const pathElement = document.getElementById("project-path");
        if (pathElement) {
            const padding = pathElement.offsetWidth + 17; // Calculate padding based on project path width
            setPathInputPadding(padding);
        }
    }, [projectPath]);

    // Handler for saving the form data when the form is submitted
    const handleSave = async (e: FormEvent) => {
        e.preventDefault(); // Prevent default form submission
        // Merge path and extension if necessary
        const fullPath = path.endsWith(extension) ? path : path + extension;
        createFile.mutate(
            { project, path: fullPath, content: instructions, file_references: fileReferences }, // Prepare the file creation payload
        );
    };

    // Handler for adding a file reference when a file is selected
    const handleFileChange = (file: RainerFile) => {
        setFileReferences(prev => {
            // Check for duplicates to avoid adding the same file reference
            const isDuplicate = prev.some(
                existingFile => existingFile.project === file.project && existingFile.path === file.path
            );
            if (!isDuplicate) {
                return [...prev, file]; // Add new file if not a duplicate
            }
            return prev; // Return previous state if duplicate
        });
    };

    // Handler for removing a file reference from the list
    const handleRemoveFile = (index: number) => {
        setFileReferences(prev => prev.filter((_, i) => i !== index)); // Filter out the file to be removed by index
    };

    // Function to get file references filtered by project type
    const getFileReferencesByProject = (project: string) => {
        return fileReferences.filter(file => file.project === project); // Return filtered references for the specified project
    };

    // Keyboard shortcut handler for submitting the form
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault(); // Prevent default save action
            handleSave(e as unknown as FormEvent); // Invoke the save handler
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown); // Add event listener for keydown
        return () => {
            window.removeEventListener('keydown', handleKeyDown); // Cleanup event listener on unmount
        };
    }, []);

    // Main render function for the component
    return (
        <form onSubmit={handleSave} className="flex flex-col h-full w-full"> {/* Form submission handler */}
            <b className="typo-h1 border-b p-4 flex items-center gap-4">
                <MdAutoFixHigh /> Create File ✨{/* Header with icon indicating that files can be created */}
            </b>
            <ScrollbarCustom noScrollX={true}> {/* Custom scrollbar for the form area */}
                <div className="flex flex-col gap-2 p-4">
                    <div className="flex gap-2">
                        <div className="w-fit">
                            <Label className="text-sm">Project</Label> {/* Label for selecting the project to work on */}
                            <div className="flex gap-2">
                                {/* Button to switch to "Backend" project */}
                                <Button variant={project === "backend" ? "default" : "outline"} onClick={() => setProject("backend")}>
                                    Backend 🖥️
                                </Button>
                                {/* Button to switch to "Frontend" project */}
                                <Button variant={project === "frontend" ? "default" : "outline"} onClick={() => setProject("frontend")}>
                                    Frontend 🌐
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full relative flex flex-col gap-1 pt-2">
                        <Label>Output path</Label> {/* Immutable label for current project path */}
                        <div className="w-full relative flex items-center gap-2">
                            <Label id="project-path"
                                   className="text-sm absolute left-2 text-muted-foreground">{projectPath}</Label> {/* Immutable label for current project path */}
                            <input
                                type="text"
                                placeholder="Enter file path" // Placeholder for input field
                                value={path}
                                onChange={(e) => setPath(e.target.value)} // Update path state on input change
                                className={`p-2 border rounded-md text-sm w-full`} // Adjusted input styling for path entry with dynamic padding
                                style={{paddingLeft: pathInputPadding}}
                            />
                            <FileExtensionPicker value={extension}
                                                 onChange={setExtension}/> {/* File extension picker component */}
                        </div>
                    </div>

                    <div className="grid gap-1">
                        <Label htmlFor="instructions-textarea" className="text-sm">Instructions</Label> {/* Label for instructions textarea */}
                        <textarea
                            id="instructions-textarea"
                            className="h-56 p-4 font-mono text-sm border rounded-md" // Textarea styling for instructions
                            placeholder="Write your custom instruction here ✍️" // Placeholder to guide user input
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)} // Update instructions state on textarea change
                        />
                    </div>

                    <div className="flex flex-col gap-4 mt-2">
                        <div>
                            <b className="font-semibold text-sm">Backend References</b> {/* Section title for backend references */}
                            <FileReferenceList
                                files={getFileReferencesByProject("backend")} // Get files specific to the backend project
                                onRemove={handleRemoveFile} // Callback to remove a file reference by index
                            />
                            <RainerFilePicker
                                project="backend" // Specify project for the file picker
                                onChange={handleFileChange} // Callback for file selection
                            />
                        </div>
                        <div>
                            <b className="font-semibold text-sm">Frontend References</b> {/* Section title for frontend references */}
                            <FileReferenceList
                                files={getFileReferencesByProject("frontend")} // Get files specific to the frontend project
                                onRemove={handleRemoveFile} // Callback to remove a file reference by index
                            />
                            <RainerFilePicker
                                project="frontend" // Specify project for the file picker
                                onChange={handleFileChange} // Callback for file selection
                            />
                        </div>
                    </div>
                </div>
            </ScrollbarCustom>

            <div className="p-4 border-t">
                <Button
                    type="submit" // Trigger the save handler on form submission
                    disabled={!project || !path || !instructions || createFile.isPending} // Disable button if form is incomplete or createFile mutation is pending
                >
                    Create {createFile.isPending ? <Spinner /> : <RiSparkling2Fill />} {/* Show spinner if loading, otherwise show sparkles icon */}
                </Button>
            </div>
        </form>
    );
}
