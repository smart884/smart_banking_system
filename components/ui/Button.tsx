import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost', full?: boolean }

export default function Button({ className, variant='primary', full=false, ...props }: Props) {
  return (
    <button
      className={clsx(
        'rounded-xl px-4 py-2 transition-colors',
        variant==='primary' && 'bg-secondary text-white hover:bg-primary',
        variant==='secondary' && 'bg-white text-primary border border-primary hover:bg-lightblue',
        variant==='ghost' && 'bg-transparent text-primary hover:bg-lightblue',
        full && 'w-full',
        className
      )}
      {...props}
    />
  )
}
