
import { Text } from "@/components/ui"; // Importing necessary UI components

export default function HelpPage() {
    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-3xl font-bold">Quicke Project Overview</h1>
            <p className="mt-4">
                Quicke is an innovative solution designed to streamline workflows and enhance productivity. Our focus is on creating a seamless integration between frontend interfaces and backend functionalities.
            </p>
            <p className="mt-4">
                Key features of the Quicke project include:
            </p>
            <ul className="list-disc ml-5 mt-2">
                <li>
                    <strong>User-Friendly Interface:</strong> Quicke provides an intuitive interface that enhances user experience and simplifies navigation.
                </li>
                <li>
                    <strong>Robust Backend Integration:</strong> Our integration with DRF ensures efficient data handling and management across the system.
                </li>
                <li>
                    <strong>Real-Time Collaboration:</strong> Quicke facilitates real-time collaboration among users, making it easier to work on projects together.
                </li>
                <li>
                    <strong>Extensive Documentation:</strong> We provide comprehensive documentation to assist users in understanding and utilizing the Quicke capabilities effectively.
                </li>
            </ul>
            <p className="mt-4">
                For more information about Quicke, feel free to explore our documentation or reach out through our support channels.
            </p>
        </div>
    );
}
