import { SelectHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = SelectHTMLAttributes<HTMLSelectElement> & { error?: string }

export default function Select({ className, error, children, ...props }: Props) {
  return (
    <div>
      <select className={clsx('input', error && 'border-red-500', className)} {...props}>
        {children}
      </select>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
}
