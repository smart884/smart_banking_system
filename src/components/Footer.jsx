import { Github, Twitter, Linkedin, ShieldCheck, Mail, Phone, MapPin, ArrowRight, Instagram, Facebook } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-24 pb-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -mr-1/4 -mt-1/4" />
      
      <div className="container-7xl relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 mb-20">
          {/* Brand Column: Name on Left, Logo on Right */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-4 group">
              <span className="text-xl md:text-2xl font-black tracking-tighter">
                Smart Bank - <span className="text-blue-600">The E-Banking System</span>
              </span>
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-blue-900/50 overflow-hidden">
                <img src="https://firebasestorage.googleapis.com/v0/b/smart-bank-e-system.appspot.com/o/logo.png?alt=media&token=logo-placeholder" alt="Smart Bank Logo" className="w-full h-full object-contain" onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png' }} />
              </div>
            </Link>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Empowering the next generation of Indian citizens with intelligent, secure, and seamless digital banking solutions.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Twitter, label: 'Twitter' },
                { icon: Facebook, label: 'Facebook' },
                { icon: Instagram, label: 'Instagram' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Github, label: 'Github' }
              ].map((social, i) => (
                <a key={i} href="#" aria-label={social.label} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all group">
                  <social.icon size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-lg font-black uppercase tracking-widest text-blue-400">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'Services', 'Contact', 'Careers', 'Press'].map((item, i) => (
                <li key={i}>
                  <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-lg font-black uppercase tracking-widest text-blue-400">Legal</h4>
            <ul className="space-y-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security', 'Compliance'].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-lg font-black uppercase tracking-widest text-blue-400">Get in Touch</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-300">Email Support</p>
                  <p className="text-slate-400">support@smartbank.com</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-300">Call Us</p>
                  <p className="text-slate-400">+1 (800) SMART-BANK</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-300">Headquarters</p>
                  <p className="text-slate-400">Financial District, Tower 7, Mumbai</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} SmartBank Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>PCI DSS Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>ISO 27001 Certified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
