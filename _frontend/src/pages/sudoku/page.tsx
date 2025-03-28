
// _frontend/src/pages/sudoku/page.tsx

import React, { useState } from 'react';

const SudokuPage: React.FC = () => {
    const initialGrid = Array(9).fill(null).map(() => Array(9).fill(''));
    const [grid, setGrid] = useState(initialGrid);

    const handleCellChange = (row: number, col: number, value: string) => {
        const isValid = validateInput(value);
        if (isValid) {
            const newGrid = [...grid];
            newGrid[row][col] = value;
            setGrid(newGrid);
        }
    };

    return (
        <div className="flex flex-col items-center my-4">
            <h1 className="text-2xl font-bold mb-4">Sudoku Game</h1>
            <div className="grid grid-cols-9 gap-2">
                {grid.map((row, rowIndex) => 
                    row.map((cell, colIndex) => (
                        <GridCell
                            key={`${rowIndex}-${colIndex}`}
                            value={cell}
                            onChange={(value) => handleCellChange(rowIndex, colIndex, value)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default SudokuPage;

// _frontend/src/components/ui/GridCell.tsx

interface GridCellProps {
    value: string;
    onChange: (value: string) => void;
}

const GridCell: React.FC<GridCellProps> = ({ value, onChange }) => {
    return (
        <input
            type="text"
            value={value}
            maxLength={1}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 text-center text-xl border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400"
            placeholder=""
        />
    );
};


// _frontend/src/lib/validation.ts

export const validateInput = (value: string): boolean => {
    const number = parseInt(value, 10);
    return !isNaN(number) && number >= 1 && number <= 9 && value.length === 1;
};
