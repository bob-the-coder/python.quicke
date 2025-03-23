import Scrollbars, {ScrollbarProps} from "react-custom-scrollbars-2"
import React, {ForwardedRef, forwardRef, ReactPropTypes} from 'react';

import './horizontal-scrollable-container.scss'
import {TContainerProps} from "../base/FlexContainer";

export default forwardRef(function HorizontalScrollContainer(
    props: Partial<TContainerProps>, 
    ref: ForwardedRef<Scrollbars>
) {
    return (
        <div
            {...props}    
            style={{
                maxWidth: '100%'
            }}
                    className={`overflow-x-auto overflow-y-visible flex-shrink-0 ${props.className || ''}`}>
            
            {props.children}
        </div>
    )
})