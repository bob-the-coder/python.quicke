import React from 'react'

import Table from '@/components/table/Table'
import PageControls, { TPageProps, TSortColumn, TSortDirection } from '@/components/table/PageControls'

import './PagedTable.css'

import sortAsc from 'assets/svg/tables/sort_asc.svg'
import sortDesc from 'assets/svg/tables/sort_desc.svg'
import sortNone from 'assets/svg/tables/sort_none.svg'

const sortIcon = {
    asc: sortAsc,
    desc: sortDesc,
    none: sortNone
}

type TSortData = {
    column: TSortColumn,
    direction: TSortDirection
}

export type TColumnProps<TRowData> = {
    key?: TSortColumn,
    label: string,
    align?: 'left' | 'center' | 'right',
    value: (data: TRowData) => any,
}

function renderSortIcon(direction?: TSortDirection){
    if (!direction) return <></>;

    return <img className='es-table--sort-icon' src={`${sortIcon[direction]}`} alt='-' />
}

type TSortHandler = (oldSort: TSortData, newSort: TSortData) => any;

function handleSort<TRowData>(column: TColumnProps<TRowData>, sortColumn: TSortColumn, sortDirection: TSortDirection, handler?: TSortHandler) {
    if (!handler) return;

    const oldSort = {
        column: sortColumn,
        direction: sortDirection
    }

    const newDirection = column.key !== sortColumn
        ? 'asc'
        : sortDirection === 'asc' 
        ? 'desc' 
        : 'asc';

    const newSort: TSortData  = {
        column: column.key!,
        direction: newDirection as 'asc' | 'desc'
    }

    handler(oldSort, newSort);
}

function renderHeaderCell<TRowData>(column: TColumnProps<TRowData>, index: number, sortColumn: TSortColumn, sortDirection: TSortDirection, handler?: TSortHandler) {
    let columnDirection: TSortDirection = 'none'; // Initialize with default value
    if (column.key) {
        columnDirection = column.key === sortColumn
            ? sortDirection
            : 'none';
    }
    const className = column.key ? 'es-table--sortable' : '';

    return (
        <Table.HeaderCell 
            key={index} align={column.align}
            className={className}
            onClick={() => handleSort(column, sortColumn, sortDirection, handler)}
        >
            {column.label}
            {renderSortIcon(columnDirection)}
        </Table.HeaderCell>
    )
}

function renderRow<TRowData>(row: TRowData, index: number, columns: TColumnProps<TRowData>[]) {
    return (
        <Table.Row key={index}>
            {columns.map((column: TColumnProps<TRowData>, index) => (
                <Table.Cell key={index} align={column.align}>
                    {column.value(row)}
                </Table.Cell>
            ))}
        </Table.Row>
    )
}

export type TPagedTableProps<TRowData> = {
    columns: TColumnProps<TRowData>[],
    rows: TRowData[],
    page: TPageProps,
    darkMode?: boolean,
    onSort?: TSortHandler,
    onPageChange?: (page: TPageProps) => any
}

export default function PagedTable<TRowData>(props: TPagedTableProps<TRowData>) {
    const { columns, rows, page } = props;

    const pageControls = {
        ...page,
        onChange: props.onPageChange || (() => alert('Missing handler for onPageChange'))
    }

    return (
        <div className={'flex-col gap-4'}>
            <Table.Container darkMode={props.darkMode}>
                <Table.Header>
                    <Table.Row>
                        {columns.map((column, index) => renderHeaderCell(column, index, page.sortColumn, page.sortDirection, props.onSort))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {rows.map((row, index) => renderRow(row, index, columns))}
                </Table.Body>
            </Table.Container>
            <PageControls {...pageControls} />
        </div>
    )
}
