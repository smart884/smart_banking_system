import React from 'react'

export default function Container({ children, className = '' }) {
  return (
    <div className={`container-7xl ${className}`}>
      {children}
    </div>
  )
}
