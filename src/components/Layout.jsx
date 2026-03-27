import React from 'react'
import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-slate-900 text-white py-20">
        <div className="container-7xl grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-2xl font-black tracking-tighter uppercase">smart <span className="text-blue-500">Bank-E-System</span></h3>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Empowering your financial journey with bank-grade security and cutting-edge digital experiences. The future of banking is here.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-blue-500">Products</h4>
            <ul className="space-y-4 text-slate-400 font-bold">
              <li><a href="#" className="hover:text-white transition-colors">Personal Banking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Corporate Solutions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Digital Wealth</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-blue-500">Support</h4>
            <ul className="space-y-4 text-slate-400 font-bold">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security Center</a></li>
            </ul>
          </div>
        </div>
        <div className="container-7xl mt-20 pt-8 border-t border-white/5 text-center text-slate-500 text-xs font-black uppercase tracking-[0.3em]">
          &copy; {new Date().getFullYear()} SmartBank Digital Systems. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
