import React from 'react'

export default function StatCard({
  title,
  value,
  icon,
  className = '',
}: {
  title: string
  value: string | number
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-2xl bg-white shadow-xl p-5 flex items-center gap-4 ${className}`}>
      {icon && <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">{icon}</div>}
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  )
}
