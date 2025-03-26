import React from 'react'

import PageButton from '@/components/table/PageButton'

import './PageControls.css'

export type TSortColumn = number | string;

export type TSortDirection = 'asc' | 'desc' | 'none';

export type TPageProps = {
    current: number,
    maxPage: number,
    pageSize: number,
    spanSize: number,
    sortColumn: TSortColumn,
    sortDirection: TSortDirection
}

type TPageControls = TPageProps & {
    onChange: (page: TPageProps) => any
}

const createSpan = (current: number, maxPage: number, spanSize: number) => {
    let spanStart = Math.max(current - spanSize, 1);
    let spanEnd = Math.min(current + spanSize, maxPage);

    if (spanStart === 1 && spanEnd < maxPage) {
        const remaining = spanSize - (current - 1);
        spanEnd = Math.min(maxPage, spanEnd + remaining);
    }

    if (spanEnd === maxPage && spanStart > 1) {
        const remaining = spanSize - (maxPage - current);
        spanStart = Math.max(1, spanStart - remaining);
    }
    return [ spanStart, spanEnd ];
}

export default function PageControls(props: TPageControls) {
    const { current, maxPage, spanSize, onChange } = props;

    function changePage(page: number) {
        if (page < 1 || page > maxPage) return;

        onChange({ ...props, current: page });
    }

    const [spanStart, spanEnd] = createSpan(current, maxPage, spanSize);
    let buttons: React.ReactNode[] = [], spanPage = spanStart;
    function addButton(page: number, label: string | number, disabledCheck?: number, currentCheck?: number) {
        buttons.push(
            <PageButton 
                key={`page_${label}`} 
                page={page} 
                onClick={changePage} 
                isCurrent={current === currentCheck}
                disabled={current === disabledCheck}
            >
                {label}
            </PageButton>
        )
    }

    addButton(1, 'First', 1);
    addButton(current - 1, 'Prev', 1);
    while (spanPage <= spanEnd) addButton(spanPage, spanPage, undefined, spanPage++);
    addButton(current + 1, 'Next', maxPage);
    addButton(maxPage, 'Last', maxPage);

    return (
        <div className='es-table--page-controls'>
            {buttons}
        </div>
    )
}
