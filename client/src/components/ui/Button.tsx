import React from 'react'

type Variant = 'primary' | 'secondary'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  full?: boolean
}

export default function Button({ variant = 'primary', full, className = '', ...rest }: Props) {
  const base =
    variant === 'secondary'
      ? 'btn-secondary'
      : 'btn'
  const width = full ? ' w-full' : ''
  return <button className={`${base}${width} ${className}`} {...rest} />
}
