import  { useState } from 'react';
import { FaAngleDown } from 'react-icons/fa';

const VioDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const features = [
        'Turbo',
        'Cruise Control',
        'Heated Seats',
        'Navigation'
    ];

    const toggleDropdown = () => {
        setIsOpen(prevState => !prevState);
    };

    const renderFeatures = () => (
        features.map((feature, index) => (
            <div 
                key={index} 
                className="dropdown-item p-2 hover:bg-gray-500 transition ease-in-out duration-200 text-white"
            >
                {feature}
            </div>
        ))
    );

    return (
        <div className="flex flex-col items-center p-5 bg-gray-800 rounded-lg shadow-lg">
            <div 
                className="flex items-center justify-between w-full p-4 bg-gray-700 rounded-lg cursor-pointer" 
                onClick={toggleDropdown}
            >
                <span className="text-white text-xl">Select Feature</span>
                <FaAngleDown className="text-white text-2xl" />
            </div>
            {isOpen && (
                <div className="mt-3 w-full bg-gray-600 rounded-lg overflow-hidden">
                    <div className="dropdown-content p-2">
                        {renderFeatures()}
                    </div>
                </div>
            )}
        </div>
    );
}

export default VioDropdown;
