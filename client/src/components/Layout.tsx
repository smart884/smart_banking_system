import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9]">
      <Navbar />
      <main className="flex-1 animate-[fadeIn_.3s_ease]">{children}</main>
      <Footer />
    </div>
  )
}
