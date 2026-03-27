import { Link, useNavigate, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { 
  Bell, 
  LayoutDashboard, 
  CreditCard, 
  Send, 
  History, 
  Receipt, 
  User, 
  Shield, 
  ClipboardCheck, 
  Briefcase, 
  LogOut,
  ChevronRight,
  Settings,
  Search,
  Menu,
  X,
  Zap,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from './SecureAuthContext'

export default function DashboardLayout({ title, children }) {
  const { userProfile, logout, loading } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) return null

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const role = userProfile?.role?.toLowerCase() || 'customer'
  
  const getOverviewLink = () => {
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'manager': return '/manager/dashboard';
      case 'clerk': return '/clerk/dashboard';
      default: return '/user/dashboard';
    }
  }

  const navLinks = [
    { to: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/accounts', label: 'Accounts', icon: CreditCard },
    { to: '/payments', label: 'Payments', icon: Receipt },
    { to: '/services', label: 'Services', icon: Briefcase },
    { to: '/transactions', label: 'Transactions', icon: History },
  ]

  const linkCls = ({ isActive }) => 
    `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
      isActive 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'hover:bg-blue-50 text-slate-500 hover:text-blue-600'
    }`

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 flex-col bg-white border-r border-slate-100 sticky top-0 h-screen z-30">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-200">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">
              smart <span className="text-blue-600">Bank</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkCls}>
              <link.icon size={20} />
              <span className="font-bold text-sm">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl text-rose-500 font-bold hover:bg-rose-50 transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Header Mobile */}
      <header className={`lg:hidden flex items-center justify-between p-6 bg-white border-b border-slate-100 sticky top-0 z-40 transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-xl bg-slate-100 text-slate-600"><Menu size={24} /></button>
          <span className="font-black text-slate-900 tracking-tighter uppercase">smart Bank</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"><Bell size={20} /></button>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">{userProfile?.firstName?.[0]}</div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Desktop Bar */}
        <header className="hidden lg:flex items-center justify-between px-10 py-6 bg-white/80 backdrop-blur-md border-b border-slate-50 sticky top-0 z-20">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{title}</h1>
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
              <Search size={16} className="text-slate-400" />
              <input type="text" placeholder="Search accounts..." className="bg-transparent border-none outline-none text-sm font-medium w-48" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 pr-6 border-r border-slate-100">
              <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>
              <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors"><Settings size={20} /></button>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-black text-slate-900 leading-none mb-1">{userProfile?.firstName}</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-200">{userProfile?.firstName?.[0]}</div>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-500 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <div className={`absolute left-0 top-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-500 p-8 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200"><ShieldCheck size={24} /></div>
              <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">smart Bank</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-xl bg-slate-100 text-slate-400"><X size={24} /></button>
          </div>

          <nav className="space-y-4">
            {navLinks.map((link) => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-4 p-5 rounded-3xl transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <link.icon size={22} />
                <span className="font-bold text-lg">{link.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="absolute bottom-8 left-8 right-8">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 p-5 w-full rounded-3xl bg-rose-50 text-rose-500 font-bold hover:bg-rose-100 transition-all"
            >
              <LogOut size={22} />
              <span className="text-lg">Logout Session</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
