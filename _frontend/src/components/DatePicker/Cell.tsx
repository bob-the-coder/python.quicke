import React from 'react'
import './Cell.scss'; 

interface CellProps {
    onClick?: () => void;
    className?: string
    children: any
}

const Cell: React.FC<CellProps> = ({ onClick, className, children }) => {
    return (
        <div onClick={onClick} className={`cell${className ? ' ' + className : ''}`}>{children}</div>
    )
}

export default Cell