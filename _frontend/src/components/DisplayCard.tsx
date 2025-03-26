import {ReactNode} from "react";

const css = {
    card: "p-4 border border-foreground/20 rounded-lg cursor-pointer shadow-sm overflow-x-hidden flex flex-col gap-4" +
        " justify-between hover:shadow-2xl hover:shadow-foreground/10 hover:scale-105 transition hover:bg-foreground/5",
    title: "typo-card-title flex items-start gap-2",
    details: "typo-card-details text-foreground/50",
};

export function DisplayCard(props: {
    title: ReactNode,
    details?: ReactNode,
}) {
    return (
        <div className={css.card}>
            <h2 className={css.title}>{props.title}</h2>
            {props.details && (
                <div className={css.details}>
                    {props.details}
                </div>
            )}
        </div>
    )
}