
import React, { useState } from 'react';

const validateInput = (value: string): boolean => {
    const number = parseInt(value, 10);
    return !isNaN(number) && number >= 1 && number <= 9 && value.length === 1;
};

const SudokuPage: React.FC = () => {
    const initialGrid = Array(9).fill(null).map(() => Array(9).fill(''));
    const [grid, setGrid] = useState(initialGrid);
    const [statusMessage, setStatusMessage] = useState('');

    const handleCellChange = (row: number, col: number, value: string) => {
        const isValid = validateInput(value);
        if (isValid) {
            const newGrid = [...grid];
            newGrid[row][col] = value;
            setGrid(newGrid);
            checkIfGameWon(newGrid);
        }
    };

    const checkIfGameWon = (currentGrid: string[][]) => {
        const allFilled = currentGrid.every(row => row.every(cell => cell !== ''));
        if (allFilled) {
            setStatusMessage('Congratulations! You have won the game.');
        }
    };

    const generateInitialTiles = () => {
        const initialTiles = [
            ['5', '3', '', '', '7', '', '', '', ''],
            ['6', '', '', '1', '9', '5', '', '', ''],
            ['', '9', '8', '', '', '', '', '6', ''],
            ['8', '', '', '', '6', '', '', '', '3'],
            ['4', '', '', '8', '', '3', '', '', '1'],
            ['7', '', '', '', '2', '', '', '', '6'],
            ['', '6', '', '', '', '', '2', '8', ''],
            ['', '', '', '4', '1', '9', '', '', '5'],
            ['', '', '', '', '8', '', '', '7', '9']
        ];
        setGrid(initialTiles);
    };

    return (
        <div className="flex flex-col items-center my-4">
            <h1 className="text-2xl font-bold mb-4">Sudoku Game</h1>
            <button onClick={generateInitialTiles} className="mb-4">Generate Initial Board</button>
            <div className="grid grid-cols-9 gap-2">
                {grid.map((row, rowIndex) => 
                    row.map((cell, colIndex) => (
                        <GridCell
                            key={`${rowIndex}-${colIndex}`}
                            value={cell}
                            onChange={(value) => handleCellChange(rowIndex, colIndex, value)}
                            readOnly={cell !== ''}
                        />
                    ))
                )}
            </div>
            {statusMessage && <p className="mt-4 text-green-600">{statusMessage}</p>}
        </div>
    );
};

export default SudokuPage;  

// _frontend/src/components/ui/GridCell.tsx

interface GridCellProps {
    value: string;
    onChange: (value: string) => void;
    readOnly?: boolean;
}

const GridCell: React.FC<GridCellProps> = ({ value, onChange, readOnly }) => {
    return (
        <input
            type="text"
            value={value}
            maxLength={1}
            onChange={(e) => onChange(e.target.value)}
            className={`w-12 h-12 text-center text-xl border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-400 ${readOnly ? 'bg-foreground/20' : ''}`}
            placeholder=""
            readOnly={readOnly}
        />
    );
};
