import { Text } from "@/components/ui"; // Importing necessary UI components

export default function HelpPage() {
    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-3xl font-bold">Rainer Files Explained</h1>
            <p className="mt-4">
                Rainer files are crucial components within our project that assist in file management and code generation.
            </p>
            <p className="mt-4">
                Here's a brief overview of the main Rainer files:
            </p>
            <ul className="list-disc ml-5 mt-2">
                <li>
                    <strong>RainerFile:</strong> Represents a specific file within a project and path. It helps in managing file references within the application.
                </li>
                <li>
                    <strong>CodeGenerationData:</strong> Stores generated code data related to the Rainer files. It captures details such as the model used for generation, instructions, and response.
                </li>
                <li>
                    <strong>Endpoints:</strong> Various API endpoints are provided for creating, updating, and deleting files and directories, as well as retrieving file contents. Each of these endpoints interacts with Rainer files to facilitate efficient file management.
                </li>
                <li>
                    <strong>Admin Interface:</strong> The Rainer admin interface provides a user-friendly way to interact with the Rainer files, allowing for easy creation, updating, and searching of file records.
                </li>
                <li>
                    <strong>GPT Integration:</strong> The integration of OpenAI's GPT enables automated code generation, improving productivity and efficiency in managing Rainer files.
                </li>
            </ul>
            <p className="mt-4">
                For further details, please refer to the documentation or the individual file comments within the codebase.
            </p>
        </div>
    );
}
