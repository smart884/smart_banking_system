import React from 'react'

export default function Button({ children, variant = 'primary', full, className = '', ...rest }) {
  const base =
    variant === 'secondary'
      ? 'btn-secondary'
      : 'btn'
  const width = full ? ' w-full' : ''
  return (
    <button className={`${base}${width} ${className}`} {...rest}>
      {children}
    </button>
  )
}
