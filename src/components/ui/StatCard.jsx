import React from 'react'

export default function StatCard({ label, value, icon: Icon, color = 'blue' }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-emerald-600 bg-emerald-50',
    red: 'text-rose-600 bg-rose-50',
    amber: 'text-amber-600 bg-amber-50'
  }

  return (
    <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {Icon && <Icon size={20} />}
        </div>
      </div>
      <h3 className="text-3xl font-black text-slate-900">{value}</h3>
    </div>
  )
}
