import {Container} from "@/components/base/FlexContainer";
import {cn} from "@/lib/utils";

// Ensure all models are registered by importing the model registry

import {PropsWithChildren} from 'react';


export default function Layout({children}: PropsWithChildren) {
    return (
            <Container.Landscape
                className="w-screen h-screen overflow-hidden flex font-geist">
                <div className={cn("w-full text-sm h-full")}>
                    {children}
                </div>
            </Container.Landscape>
    );
};
