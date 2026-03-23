import React from 'react'

export default function Input({ label, className = '', ...rest }) {
  return (
    <div className="space-y-2">
      {label && <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>}
      <input className={`input ${className}`} {...rest} />
    </div>
  )
}
