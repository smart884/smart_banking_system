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

  const linkCls = ({ isActive }) =>
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
        {/* Logo Section: Name on Left, Logo on Right */}
        <Link to="/" className="flex items-center gap-4 group">
          <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
            Smart Bank - <span className="text-blue-600">The E-Banking System</span>
          </span>
          {/* Bank Logo Image on Right Side */}
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform overflow-hidden border border-slate-100">
            <img src="https://firebasestorage.googleapis.com/v0/b/smart-bank-e-system.appspot.com/o/logo.png?alt=media&token=logo-placeholder" alt="Smart Bank Logo" className="w-full h-full object-contain" onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png' }} />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-white/50 p-1 rounded-2xl border border-slate-100 shadow-sm">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkCls}>
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
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-600 hover:text-blue-600 transition-all">
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <div className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md transition-all duration-500 md:hidden ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 p-8 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex items-center justify-between mb-12">
             <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-100 overflow-hidden">
                <img src="https://firebasestorage.googleapis.com/v0/b/smart-bank-e-system.appspot.com/o/logo.png?alt=media&token=logo-placeholder" alt="Smart Bank Logo" className="w-full h-full object-contain" onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png' }} />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter">Smart Bank</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-3 rounded-2xl bg-slate-100 text-slate-400 hover:text-slate-900 transition-all">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-4">
            {navLinks.map((link) => (
              <NavLink 
                key={link.to} 
                to={link.to} 
                onClick={() => setOpen(false)}
                className={({ isActive }) => `flex items-center justify-between p-5 rounded-3xl transition-all ${
                  isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <link.icon size={22} />
                  <span className="font-bold text-lg">{link.label}</span>
                </div>
                <ChevronRight size={18} className={({ isActive }) => isActive ? 'opacity-100' : 'opacity-30'} />
              </NavLink>
            ))}
          </nav>

          <div className="absolute bottom-8 left-8 right-8 space-y-4">
            {currentUser ? (
              <>
                <Link to={getDashboardLink()} onClick={() => setOpen(false)} className="btn btn-pill w-full h-16 bg-slate-900 text-lg">Dashboard</Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="btn-secondary btn-pill w-full h-16 text-lg">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary btn-pill w-full h-16 text-lg flex items-center justify-center gap-3">
                  <LogIn size={20} /> Login
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn btn-pill w-full h-16 bg-blue-600 text-lg flex items-center justify-center gap-3 shadow-2xl shadow-blue-100">
                  <UserPlus size={20} /> Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
