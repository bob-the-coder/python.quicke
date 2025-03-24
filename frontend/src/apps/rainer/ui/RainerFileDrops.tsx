import { useQuery } from '@tanstack/react-query';
import { endpoint_get_file_drops } from '../endpoints';
import { RainerFile } from '../models';
import { Button } from '@/components/ui/button';

interface RainerFileDropsProps {
    file: RainerFile;
}

const RainerFileDrops: React.FC<RainerFileDropsProps> = ({ file }) => {
    const { data: fileDrops, isLoading, error } = useQuery({
        queryKey: ['fileDrops', file],
        queryFn: () => endpoint_get_file_drops(file)
    });

    if (isLoading || !fileDrops) {
        return null;
    }

    if (error) {
        console.error('Error fetching file drops:', error);
        return "error";
    }

    return (
        <div className="flex items-center p-2 gap-1 px-4">
            {Object.entries(fileDrops).map(([group, count]) => (
                <Button key={group}
                    variant="outline" 
                    size="icon" 
                    className="flex-center relative h-12 w-12"
                >
                    <img
                        src={`/img/thnt/${group}.webp`}
                        alt={`${group} icon`}
                        className="h-10 w-10 object-contain"
                    />
                    <div className="absolute right-0 bottom-0 px-1 z-2 font-geist-mono" title={`${group}.png`}>{count}</div>
                </Button>
            ))}
        </div>
    );
};

export default RainerFileDrops;
