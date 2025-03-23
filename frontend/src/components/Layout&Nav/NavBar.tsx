import {FaHome, FaUser} from "react-icons/fa";
import {Link, useLocation} from "react-router-dom";
import Button from "@/components/Button/Button.tsx";
import {cn} from "@/lib/utils";
import {useSidebar} from "@/lib/preferences-context";
import {useAssertions} from "@/apps/assertions/hooks.tsx";
import {IoBook} from "react-icons/io5";
import {FaAngleRight} from "react-icons/fa6";
import {ReactNode} from "react"
import {IconType} from "react-icons";
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";

const menu_items = [{
    label: "Dashboard",
    icon: FaHome,
    route: "/dashboard/overview",
}, {
    label: "Evaluations",
    icon: FaUser,
    route: "/dashboard/sources",
}];

export default function NavBar() {
    const location = useLocation();
    const {isOpen} = useSidebar();
    const collapsed = !isOpen;

    const assertions = useAssertions();
    console.log(assertions.types)

    return (
        <div className="flex flex-col gap-1 w-full">
            {menu_items.map((item) => (
                    <NavLink key={item.route}
                             to={item.route}
                             label={item.label}
                             icon={item.icon}
                             isCollapsed={collapsed}
                             isActive={location.pathname === item.route}/>
                )
            )}
            <Collapsible>
                <CollapsibleTrigger className={'w-full'}>
                    <NavLink icon={IoBook} label={"Assertions"} isCollapsed={collapsed} 
                             isActive={collapsed && location.pathname.startsWith("/dashboard/assertions/")}/>
                </CollapsibleTrigger>
                <CollapsibleContent className={"flex flex-col ml-6 border-l pl-2"}>
                    {!collapsed && assertions.types.map(type => {
                        const type_path = `/dashboard/assertions/${type}`

                        return (
                            <NavLink key={type_path}
                                     to={type_path}
                                     label={type}
                                     icon={FaAngleRight}
                                     isCollapsed={collapsed}
                                     isActive={location.pathname === type_path}/>
                        )
                    })}
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}

function NavLink(props: {
    to?: string,
    isActive?: boolean,
    isCollapsed?: boolean,
    icon?: IconType,
    label?: ReactNode
}) {
    const ButtonComponent = props.isActive ? Button.Fancy : Button.Ghost;
    const Icon = props.icon || (() => null);
    const BUTTON = (
        <ButtonComponent className={cn("w-full", props.isCollapsed ? "justify-center" : "justify-start")} size={'sm'}>
            <div
                className={cn("text-xl flex-shrink-0", props.isActive ? "text-white" : "text-foreground")}>
                <Icon/>
            </div>
            {!props.isCollapsed && (
                <span
                    className={cn("text-sm whitespace-nowrap", props.isActive ? "text-white" : "text-foreground")}>
                                    {props.label}
                                </span>
            )}
        </ButtonComponent>
    )

    return props.to ? (
        <Link to={props.to} className="rounded-lg">
            {BUTTON}
        </Link>
    ) : BUTTON
}