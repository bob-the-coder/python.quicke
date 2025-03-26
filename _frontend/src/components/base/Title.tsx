import React from 'react'

import './Title.css';

type TTitleProps = {
  text?: string, 
  align?: string,
  children?: any
}

function renderTitle(props: TTitleProps, variant: string) {
  let className = `es-title ${variant}-title`;
  if (props.align) className += ` es-title--align-${props.align}`;

  return (
    <h1 className={className}>{props.children || props.text}</h1>
  )
}

const Title = {
  Page: (props: TTitleProps) => renderTitle(props, 'page'),
  Section: (props: TTitleProps) => renderTitle(props, 'section'),
  Author: (props: TTitleProps) => renderTitle(props, 'author'),
}

export default Title;