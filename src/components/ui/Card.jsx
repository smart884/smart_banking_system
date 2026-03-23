import React from 'react'

export default function Card({ children, hover, className = '' }) {
  return <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>{children}</div>
}
