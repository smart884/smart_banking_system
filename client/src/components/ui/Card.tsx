import React from 'react'

type Props = {
  children: React.ReactNode
  hover?: boolean
  className?: string
}

export default function Card({ children, hover, className = '' }: Props) {
  return <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>{children}</div>
}
