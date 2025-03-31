
import { Text } from "@/components/ui"; // Importing necessary UI components

export default function HelpPage() {
    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-3xl font-bold">Quicke Project Overview</h1>
            <p className="mt-4">
                Quicke is an innovative solution designed to streamline workflows and enhance productivity by bridging the gap between frontend and backend operations. Our architecture emphasizes modular components, enabling efficient interactions across different layers of the system.
            </p>
            <p className="mt-4">
                Key features of the Quicke project include:
            </p>
            <ul className="list-disc ml-5 mt-2">
                <li>
                    <strong>User-Friendly Interface:</strong> Quicke provides an intuitive interface that enhances user experience and simplifies navigation across various functionalities.
                </li>
                <li>
                    <strong>Robust Backend Integration:</strong> Integrates seamlessly with Django REST Framework (DRF), allowing for efficient data handling through well-defined serializers and authenticators.
                </li>
                <li>
                    <strong>Real-Time Collaboration:</strong> Quicke facilitates real-time updates and notifications, helping teams to collaborate effectively, especially in dynamic environments.
                </li>
                <li>
                    <strong>Extensive Documentation:</strong> Comprehensive documentation covers API endpoints, frontend components, and best practices for utilizing Quicke’s capabilities effectively.
                </li>
                <li>
                    <strong>Modular Architecture:</strong> Designed with a modular approach, allowing developers to extend the project easily and customize features based on user needs.
                </li>
            </ul>
            <p className="mt-4">
                For more detailed insights into specific components and functionality, please explore our documentation or reach out through our support channels.
            </p>
        </div>
    );
}
