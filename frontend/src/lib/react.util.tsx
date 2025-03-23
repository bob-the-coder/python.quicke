import {FC, ForwardedRef, forwardRef, ForwardRefRenderFunction, PropsWithoutRef} from "react";
import {cn} from "@/lib/utils";

export namespace ReactUtility {
    export type PropsOf<C> = C extends FC<infer P extends object> ? P : never;

    export function createPrefab<C extends FC<PropsOf<C>>, E extends HTMLElement = HTMLElement>(
        Component: C,
        prefabProps: PropsWithoutRef<Partial<PropsOf<C>>>
    ) {
        type PrefabProps = PropsWithoutRef<Partial<PropsOf<C>>>;
        const prefab: ForwardRefRenderFunction<E, PrefabProps> = (props: PrefabProps, ref: ForwardedRef<E>)=> {
            const finalProps = {
                ...prefabProps,
                ...props
            } as PrefabProps;
            if (props instanceof Object && props.hasOwnProperty('className')) {
                // @ts-ignore
                finalProps.className = cn(props.className, prefabProps.className);
            }
            // @ts-ignore
            return <Component {...finalProps} ref={ref}/>;
        }
        
        return forwardRef(prefab) as FC<Partial<PropsOf<C>>>;
    }
    
    export type RequireOf<T, K extends keyof T> = Omit<T, K> & {
        [F in K]: T[F]
    };
}

export function $(selector: `#${string}`) {
    return document.getElementById(selector);
}