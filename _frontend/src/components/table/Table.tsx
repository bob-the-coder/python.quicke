import React from 'react'

import './Table.css'

const classPrefix = 'es-table';

const table = function (props: { children?: any, darkMode?: boolean }) {
    return <table className={classPrefix}>{props.children}</table>;
}

const tableHeader = function (props: { children?: any }) {
    return <thead className={`${classPrefix}-header`}>{props.children}</thead>;
}

const tableBody = function (props: { children?: any }) {
    return <tbody className={`${classPrefix}-body`}>{props.children}</tbody>;
}

type TClickHandler = {
    onClick?: (args?: any) => any
}

function handleClick(event: React.MouseEvent, handler: TClickHandler) {
    event.preventDefault();
    event.stopPropagation();

    if (handler.onClick) handler.onClick();
}

const tableRow = function (props: TClickHandler & { children?: any }) {
    return <tr className={`${classPrefix}-row`} onClick={event => handleClick(event, props)}>{props.children}</tr>;
}

type TCellAlignment = 'left' | 'center' | 'right';

type TCellProps = TClickHandler & {
    children?: any,
    className?: string,
    align?: TCellAlignment
}

const tableCell = function (props: TCellProps) {
    const className = `${classPrefix}-cell cell-align-${props.align || 'left'} ${props.className}`

    return <td className={className} onClick={event => handleClick(event, props)}>
        <div className={`${classPrefix}-cell--content`}>{props.children}</div>
    </td>;
}

const tableHeaderCell = function (props: TCellProps) {
    const className = `${classPrefix}-cell ${classPrefix}-header-cell cell-align-${props.align || 'left'} ${props.className}`

    return <th className={className} onClick={event => handleClick(event, props)}>
        <div className={`${classPrefix}-cell--content`}>{props.children}</div>
    </th>;
}

const Table = {
    Container: table,
    Header: tableHeader,
    HeaderCell: tableHeaderCell,
    Body: tableBody,
    Row: tableRow,
    Cell: tableCell
}

export default Table;