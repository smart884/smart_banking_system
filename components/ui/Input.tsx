import { InputHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

type Props = InputHTMLAttributes<HTMLInputElement> & { error?: string }

const Input = forwardRef<HTMLInputElement, Props>(function Input({ className, error, ...props }, ref) {
  return (
    <div>
      <input ref={ref} className={clsx('input', error && 'border-red-500', className)} {...props} />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
})

export default Input
