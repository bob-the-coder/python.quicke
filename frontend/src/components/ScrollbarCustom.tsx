import Scrollbar from "react-scrollbars-custom";
import {FC} from "react";
import {ScrollbarProps} from "react-scrollbars-custom/dist/types/Scrollbar";
import {ReactUtility} from "@/lib/react.util.tsx";
import createPrefab = ReactUtility.createPrefab;

export const ScrollbarCustom = createPrefab(Scrollbar as unknown as FC<ScrollbarProps>, {
    thumbXProps: {style: {background: 'gray'}},
    thumbYProps: {style: {background: 'gray'}},
})