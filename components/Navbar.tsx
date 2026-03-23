import Link from 'next/link'
import { Banknote, LogIn } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="w-full bg-white shadow-soft">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Banknote className="text-secondary" />
          <span className="font-semibold text-primary">Smart Bank</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-graytext">
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/auth/login" className="btn">
            <LogIn className="w-4 h-4 mr-1" /> Login
          </Link>
          <Link href="/auth/register" className="btn">Open Account</Link>
        </div>
      </div>
    </header>
  )
}
