import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { endpoint_get_file_drops } from '../endpoints';
import { FileDrops } from '../types';
import { RainerFile } from '../models';
import { Button } from '@/components/ui/button';

interface RainerFileDropsProps {
    file: RainerFile;
}

const RainerFileDrops: React.FC<RainerFileDropsProps> = ({ file }) => {
    const { data: fileDrops, isLoading, error } = useQuery<FileDrops, Error>({
        queryKey: ['fileDrops', file],
        queryFn: () => endpoint_get_file_drops(file)
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        console.error('Error fetching file drops:', error);
        return <div>Error loading file drops</div>;
    }

    return (
        <div className="flex items-center p-2 gap-1 px-4">
            {Object.entries(fileDrops).map(([group, count]) => (
                <Button key={group}
                    variant="outline" 
                    size="icon" 
                    className="flex-center relative font-geist-mono"
                >
                    <img
                        src={`/img/${group}.png`}
                        alt={`${group} icon`}
                        className="h-8 w-8 object-contain"
                    />
                    <div className="absolute right-0 bottom-0 px-1 z-2" title={`${group}.png`}>{count}</div>
                </Button>
            ))}
        </div>
    );
};

export default RainerFileDrops;
