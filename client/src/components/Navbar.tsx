import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ShieldCheck, Menu, X, LogIn, UserPlus, Home, Info, Briefcase, MessageSquare, ChevronRight } from 'lucide-react'
import { useAuth } from './SecureAuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { currentUser, userProfile, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getDashboardLink = () => {
    if (!userProfile) return '/user/dashboard';
    const role = userProfile.role.toLowerCase();
    switch (role) {
      case 'admin': return '/admin/dashboard';
      case 'manager': return '/manager/dashboard';
      case 'clerk': return '/clerk/dashboard';
      case 'customer':
      case 'user':
        return '/user/dashboard';
      default: return '/user/dashboard';
    }
  }

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `relative px-4 py-2 rounded-xl transition-all duration-300 font-bold flex items-center gap-2 ${
      isActive 
        ? 'text-blue-700 bg-blue-50/50' 
        : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
    }`

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/about', label: 'About', icon: Info },
    { to: '/services', label: 'Services', icon: Briefcase },
    { to: '/contact', label: 'Contact', icon: MessageSquare },
  ]

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/80 backdrop-blur-xl shadow-lg py-3' : 'bg-transparent py-5'
    }`}>
      <div className="container-7xl flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            <ShieldCheck size={24} />
          </div>
          <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
            smart <span className="text-blue-600">Bank-E-System</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-white/50 p-1 rounded-2xl border border-slate-100 shadow-sm">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkCls as any}>
              <link.icon size={18} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <>
              <Link to={getDashboardLink()} className="btn btn-pill bg-slate-900 hover:bg-slate-800">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-secondary btn-pill">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-2 px-6 py-2.5 font-bold text-slate-700 hover:text-blue-600 transition-colors">
                <LogIn size={18} />
                Login
              </Link>
              <Link to="/register" className="btn btn-pill bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 flex items-center gap-2">
                <UserPlus size={18} />
                Join Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 transition-colors" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-100 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="container-7xl py-6 space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.to} 
                  to={link.to} 
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `flex items-center justify-between p-4 rounded-2xl transition-all ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 font-bold">
                    <link.icon size={20} />
                    {link.label}
                  </div>
                  <ChevronRight size={18} className="opacity-50" />
                </NavLink>
              ))}
            </div>
            
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              {currentUser ? (
                <>
                  <Link to={getDashboardLink()} onClick={() => setOpen(false)} className="btn h-14 rounded-2xl bg-slate-900">
                    Go to Dashboard
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary h-14 rounded-2xl">
                    Logout Account
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setOpen(false)} className="btn h-14 rounded-2xl bg-slate-100 text-slate-900 border-none shadow-none">
                    Log In
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn h-14 rounded-2xl bg-blue-600">
                    Open Free Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
