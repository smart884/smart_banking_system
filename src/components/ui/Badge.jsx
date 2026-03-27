import React from 'react'

export default function Badge({ children, variant = 'neutral' }) {
  const cls =
    variant === 'success'
      ? 'badge-success'
      : variant === 'danger'
      ? 'badge-danger'
      : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700'
  return <span className={cls}>{children}</span>
}
