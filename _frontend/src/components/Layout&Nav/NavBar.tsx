import {FaHome, FaUser} from "react-icons/fa";
import {Link, useLocation} from "react-router-dom";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {useSidebar} from "@/lib/preferences-context";
import {ReactNode} from "react"
import {IconType} from "react-icons";

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
    const Icon = props.icon || (() => null);
    const BUTTON = (
        <Button className={cn("w-full", props.isCollapsed ? "justify-center" : "justify-start")}
                size={'sm'}
        variant={props.isActive ? "fancy" : "ghost"}>
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
        </Button>
    )

    return props.to ? (
        <Link to={props.to} className="rounded-lg">
            {BUTTON}
        </Link>
    ) : BUTTON
}