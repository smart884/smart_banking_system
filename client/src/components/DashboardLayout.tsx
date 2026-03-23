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

export default function DashboardLayout({ title, children }: { title: string; children: React.ReactNode }) {
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

  const linkCls = ({ isActive }: { isActive: boolean }) => 
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
            <NavLink key={link.to} to={link.to} className={linkCls as any}>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-100 py-3' : 'bg-transparent py-6'
        }`}>
          <div className="px-6 md:px-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-white shadow-sm border border-slate-100"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-black text-slate-900 hidden md:block">{title}</h1>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Search..." className="bg-transparent outline-none text-sm font-medium w-40" />
              </div>

              <button className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm relative group hover:bg-slate-50 transition-all">
                <Bell size={20} className="text-slate-600 group-hover:text-blue-600" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
              </button>
              
              <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900">{userProfile?.firstName} {userProfile?.lastName}</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Premium User</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-100">
                  {userProfile?.firstName?.[0]}{userProfile?.lastName?.[0]}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 md:px-10 py-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-xl font-black text-slate-900">smart Bank</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-xl bg-slate-100">
                <X size={20} />
              </button>
            </div>
            <nav className="px-4 space-y-2 mt-4">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.to} 
                  to={link.to} 
                  onClick={() => setIsSidebarOpen(false)}
                  className={linkCls as any}
                >
                  <link.icon size={20} />
                  <span className="font-bold text-sm">{link.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="absolute bottom-8 left-4 right-4 pt-6 border-t border-slate-50">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl text-rose-500 font-bold hover:bg-rose-50 transition-all"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
