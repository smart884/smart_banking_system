'use client'
import Link from 'next/link'
import { LayoutDashboard, CreditCard, History, Send, Receipt, User, LogOut } from 'lucide-react'
import api from '@/lib/axios'
import { useRouter } from 'next/navigation'

export default function Sidebar() {
  const router = useRouter()
  const logout = async () => {
    await api.post('/api/auth/logout')
    router.push('/auth/login')
  }
  return (
    <aside className="w-64 bg-white shadow-soft rounded-2xl p-4 h-full">
      <nav className="space-y-1">
        <Link className="flex items-center gap-2 p-2 rounded-xl hover:bg-lightblue" href="/dashboard"><LayoutDashboard className="w-4 h-4" /> Dashboard</Link>
        <Link className="flex items-center gap-2 p-2 rounded-xl hover:bg-lightblue" href="/dashboard/account"><CreditCard className="w-4 h-4" /> Account</Link>
        <Link className="flex items-center gap-2 p-2 rounded-xl hover:bg-lightblue" href="/dashboard/transfer"><Send className="w-4 h-4" /> Transfer</Link>
        <Link className="flex items-center gap-2 p-2 rounded-xl hover:bg-lightblue" href="/dashboard/transactions"><History className="w-4 h-4" /> Transactions</Link>
        <Link className="flex items-center gap-2 p-2 rounded-xl hover:bg-lightblue" href="/dashboard/billpay"><Receipt className="w-4 h-4" /> Bill Payment</Link>
        <Link className="flex items-center gap-2 p-2 rounded-xl hover:bg-lightblue" href="/dashboard/profile"><User className="w-4 h-4" /> Profile</Link>
        <button onClick={logout} className="flex items-center gap-2 p-2 rounded-xl hover:bg-lightblue w-full text-left"><LogOut className="w-4 h-4" /> Logout</button>
      </nav>
    </aside>
  )
}
