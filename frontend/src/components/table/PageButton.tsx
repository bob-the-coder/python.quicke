import React from 'react'

function PageButton(props: {
    isCurrent?: boolean,
    page?: number,
    disabled?: boolean,
    onClick?: (page: number) => any,
    children?: any
}) {
    const { page, isCurrent, onClick } = props;

    function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        event.stopPropagation();

        if (!onClick || isCurrent || typeof page !== 'number') return;

        if (props.page !== undefined) {
            onClick(props.page);
        }
    }

    let className = 'es-table--page-button';
    if (!page) className += ' es-table--page-spread'
    if (isCurrent) className += ' es-table--page-current';

    return (
        <button key={page}
            className={className}
            disabled={props.disabled}
            onClick={handleClick}>
            {props.children || page}
        </button>
    )
}

export default PageButton;