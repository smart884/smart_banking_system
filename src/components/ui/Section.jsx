import React from 'react'

export default function Section({ children, className = '', id }) {
  return (
    <section id={id} className={`py-12 md:py-24 ${className}`}>
      {children}
    </section>
  )
}
