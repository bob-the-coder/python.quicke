"use client";

import {FC, useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {FaAngleDown} from "react-icons/fa6";

interface FileExtensionPickerProps {
    value?: string;
    onChange?: (extension: string) => void;
}

const all_extensions = [".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".html", ".json"].concat(
    [".py", ".java", ".rb", ".php", ".go", ".js", ".csharp", ".xml"]
);

const FileExtensionPicker: FC<FileExtensionPickerProps> = ({value, onChange}) => {
    const [extension, setExtension] = useState<string | null>(null);
    const extensions = all_extensions;


    const handleExtensionChange = (newExtension: string) => {
        setExtension(newExtension);
        if (onChange) onChange(newExtension);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
                <Button variant="outline" className="w-fit">
                    {value || extension || "Select Extension"} <FaAngleDown/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {extensions.map((ext) => (
                    <DropdownMenuItem key={ext} onClick={() => handleExtensionChange(ext)}>
                        {ext}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default FileExtensionPicker;
