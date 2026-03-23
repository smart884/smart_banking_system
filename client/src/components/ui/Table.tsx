import React from 'react'

export function Table({ children }: { children: React.ReactNode }) {
  return <table className="table">{children}</table>
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>
}

export function TRow({ children }: { children: React.ReactNode }) {
  return <tr className="border-t">{children}</tr>
}

export function TH({ children }: { children: React.ReactNode }) {
  return <th className="text-left p-3 text-xs uppercase tracking-wide text-gray-600">{children}</th>
}

export function TD({ children }: { children: React.ReactNode }) {
  return <td className="p-3 text-sm">{children}</td>
}
