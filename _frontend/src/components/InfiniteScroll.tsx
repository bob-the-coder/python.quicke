import { PrefabIconLoadingSpinner } from "@/prefabs/icon-prefabs";
import { BsDot } from "react-icons/bs";
import React, { FC, ForwardedRef, forwardRef, HTMLAttributes, useEffect, useRef } from "react";
import { useDivRef } from "@/hooks/useSrollbarsRef";
import { cn } from "@/lib/utils";
import { useInfiniteQuery } from "@tanstack/react-query";

type InfiniteScrollProps<T> = {
    queryKey: string[],
    renderAs: (item: T, index?: number) => React.ReactElement,
    request: (page: number) => Promise<{ items: T[], page: number, maxPage: number }>,
    endOfList?: React.ReactElement
} & HTMLAttributes<HTMLDivElement>

const InfiniteScroll = forwardRef(<T = any>(
    props: InfiniteScrollProps<T>,
    ref: ForwardedRef<HTMLDivElement>
) => {
    const { renderAs, request, endOfList, ...baseProps } = props;
    const unmounting = useRef(false);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: props.queryKey,
        queryFn: ({ pageParam = 1 }) => request(pageParam),
        getNextPageParam: ({ page, maxPage }) => {
            return page < maxPage ? page + 1 : undefined;
        },
    });

    useEffect(() => {
        unmounting.current = false;
        return () => {
            unmounting.current = true;
        };
    }, []);

    const loadMoreRef = useDivRef();
    useIntersectionObserver({
        target: loadMoreRef,
        onIntersect: fetchNextPage,
        enabled: hasNextPage && !unmounting.current,
    });

    return (
        <div {...baseProps} className={cn('grid', props.className)} ref={ref}>
            {(data?.pages ?? []).map((page, pageIndex) =>
                page?.items.map((item, itemIndex) => (
                    <div key={`infinite_${pageIndex}_${itemIndex}`} className={'snap-center'}>
                        {renderAs(item, itemIndex)}
                    </div>
                )))
            }

            <div ref={loadMoreRef} className="flex-center flex-shrink-0 py-12">
                {(isLoading || isFetchingNextPage) && (
                    <PrefabIconLoadingSpinner size={24} />
                )}

                {!hasNextPage && !isLoading && (endOfList ? endOfList : <BsDot size={24} className={'color-alternate'} />)}
            </div>
        </div>
    );
});

export default InfiniteScroll as <T>(props: InfiniteScrollProps<T> & { ref?: ForwardedRef<HTMLDivElement>; }) => ReturnType<FC>;

function useIntersectionObserver(args: {
    onIntersect: () => void,
    target: ReturnType<typeof useDivRef>,
    enabled?: boolean,
    root?: ReturnType<typeof useDivRef>,
    rootMargin?: string,
    threshold?: number,
}) {
    const { enabled, onIntersect, root, target } = args;
    const threshold = args.threshold ?? 0.1;
    const rootMargin = args.rootMargin ?? '0px';

    useEffect(() => {
        if (!enabled) return;

        const observer = new IntersectionObserver(
            (entries) => entries.forEach((entry) => {
                if (entry.isIntersecting) onIntersect();
            }),
            {
                root: root?.current || null,
                rootMargin,
                threshold,
            }
        );

        const el = target?.current;
        if (!el) return;

        observer.observe(el);

        return () => observer.unobserve(el);
    }, [target.current, enabled]);
}
