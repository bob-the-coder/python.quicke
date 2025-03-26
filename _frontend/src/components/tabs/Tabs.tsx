import {useCallback, useEffect} from "react";
import {TContainerProps} from "../base/FlexContainer";
import {useDivRef} from "@/hooks/useSrollbarsRef";
import {cn} from "@/lib/utils";

const tabColorClass = (activeTab: number, currentTab: number) =>
    activeTab === currentTab ? 'text-foreground' : 'text-muted-foreground/70'

export function Tabs(props: TContainerProps & {
    activeTab: number,
    containerClassName?: string,
    onActiveTabChange?: (tabIndex: number) => void,
    tabProps?: TContainerProps,
}) {
    const {activeTab, onActiveTabChange, tabProps, containerClassName, ...baseProps} = props;

    const tabsRef = useDivRef();

    const handleTabChange = useCallback((tab: number) => {
        if (!onActiveTabChange) return;
        onActiveTabChange(tab);
    }, [onActiveTabChange]);

    useEffect(() => {
        if (!tabsRef.current) return;

        const tabs = tabsRef.current;
        const tab = tabs.children[activeTab];
        tab?.scrollIntoView({block: 'nearest', behavior: 'smooth', inline: 'center'})

    }, [tabsRef, activeTab]);

    return (
        <div className={cn("flex-col flex-shrink-0 overflow-hidden", containerClassName)} style={{maxWidth: '100%'}}>
            <div ref={tabsRef}
                 {...baseProps}
                 className={cn('flex w-fit max-w-full overflow-x-auto text-sm whitespace-pre flex-shrink-0', props.className)}>
                {Array.isArray(props.children) && props.children.map((child, ci) => (
                    <div key={ci}
                         {...(props.tabProps ?? {})}
                         id={`tab_wrapper_${ci}`}
                         className={`flex-shrink-0 ${tabColorClass(activeTab, ci)} ${props.tabProps?.className ?? ''}`}
                         style={props.tabProps?.style ?? {}}
                         onClick={() => handleTabChange(ci)}>
                        {child}
                    </div>
                ))}
            </div>
        </div>
    )
}