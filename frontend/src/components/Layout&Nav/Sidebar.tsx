import {cn} from "@/lib/utils";
import logoPath from '@/assets/DFA.webp';
import {ArrowRight, ArrowLeft} from "lucide-react";
import {useSidebar, useTheme} from "@/lib/preferences-context";
import {ReactNode} from "react";
import {Button} from "@/components/ui/button";


interface SidebarProps {
    children: ReactNode;
    logo?: string;
}

export const Sidebar = ({
                            children,
                            logo = logoPath
                        }: SidebarProps) => {
    const {isOpen, toggle} = useSidebar();

    const {theme} = useTheme();

    return (
        <div className={cn(
            'flex flex-col h-full bg-background/80 border-r border-foreground/10 px-3 transition-[width] duration-150 ease-in-out',
            isOpen ? 'w-[14rem]' : 'w-[4rem]'
        )}>
            <div>
                <img
                    src={logo}
                    alt="logo"
                    className={cn(
                        "w-full py-2 ",
                        theme === 'dark' && "filter invert"
                    )}
                />
            </div>

            <div className="relative ">
                <hr className="border-foreground/10"/>
                <Button variant={'outline'}
                    className="absolute -right-7 top-1/2 -translate-y-1/2 z-50 bg-background border-foreground/10 border hover:bg-foreground/5 rounded-full w-8 h-8 p-0 flex items-center justify-center"
                    onClick={toggle}
                    size="sm"
                >
                    {isOpen ? <ArrowLeft size={16}/> : <ArrowRight size={16}/>}
                </Button>
            </div>

            {/* Navigation component passed as children */}
            <div className="flex-grow justify-between flex flex-col mt-5 h-full gap-4 ">
                {children}
            </div>

            {/* Options Menu - Moved to the bottom of the sidebar */}


        </div>
    );
};