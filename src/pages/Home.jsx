import React from 'react';
import Layout from '../components/Layout';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, Send, History, PieChart, Users, Zap, CheckCircle2 } from 'lucide-react';

/**
 * Premium Home Page
 * 10-year experience UI/UX design: Hero section, features, statistics, and CTA.
 */
export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <Section className="relative overflow-hidden pt-20 pb-32 bg-slate-50">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-indigo-100/50 rounded-full blur-3xl -z-10" />
        
        <Container>
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Zap size={16} />
              <span>India's Leading Digital Bank</span>
            </div>
            <h1 className="text-6xl md:text-[8rem] font-black text-slate-900 tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 leading-none">
              smart <span className="text-blue-600">Bank-The E-Banking System</span>
            </h1>
            <p className="text-2xl md:text-3xl text-slate-600 mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 font-medium">
              We provide seamless, secure, and smart banking solutions for the modern Indian citizen.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <Link to="/register">
                <Button className="h-20 px-12 text-2xl bg-gradient-to-r from-blue-700 to-indigo-800 shadow-2xl shadow-blue-200 hover:scale-105 transition-transform rounded-2xl">
                  Get Started Today
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="secondary" className="h-20 px-12 text-2xl border-slate-200 text-slate-700 hover:bg-slate-100 rounded-2xl">
                  Who We Are
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* About Project Section */}
      <Section className="py-24 bg-white border-y border-slate-100">
        <Container>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">What is SmartBank?</h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                SmartBank is a revolutionary fintech platform designed to bring the power of professional banking to your fingertips. We combine cutting-edge technology with human-centric design to create a banking experience that is truly intelligent.
              </p>
              <div className="space-y-4 pt-4">
                {[
                  { title: 'Secure Infrastructure', desc: 'Built on world-class cloud security protocols.' },
                  { title: 'User-First Design', desc: 'Crafted for ease of use across all age groups.' },
                  { title: 'Real-time Operations', desc: 'No more waiting for transactions to reflect.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 size={14} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{item.title}</h4>
                      <p className="text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden aspect-square flex flex-col justify-end">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full -mr-32 -mt-32" />
              <div className="relative z-10">
                <h3 className="text-3xl font-black mb-4">Empowering <span className="text-blue-400">1 Million+</span> Users</h3>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">Join the movement towards a more efficient and transparent financial ecosystem.</p>
                <div className="flex gap-4">
                  <div className="h-2 w-20 bg-blue-600 rounded-full" />
                  <div className="h-2 w-8 bg-slate-700 rounded-full" />
                  <div className="h-2 w-8 bg-slate-700 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section className="py-16 bg-white">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Users', value: '250K+' },
              { label: 'Total Volume', value: '₹ 1.2B' },
              { label: 'Security Rating', value: 'AAA+' },
              { label: 'Support Uptime', value: '99.9%' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-black text-blue-600 mb-2">{stat.value}</p>
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Features Grid */}
      <Section className="py-32 bg-slate-50">
        <Container>
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Banking Made Simple</h2>
            <p className="text-xl text-slate-500">Powerful features designed for the modern world.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: 'Iron-Clad Security', desc: 'Bank-grade encryption and multi-factor authentication protect every transaction.' },
              { icon: Send, title: 'Instant Transfers', desc: 'Send money to anyone, anywhere, instantly with 0% transaction fees.' },
              { icon: PieChart, title: 'Smart Analytics', desc: 'Visualize your spending habits with AI-powered financial insights.' },
              { icon: CreditCard, title: 'Virtual Cards', desc: 'Generate secure virtual cards for safer online shopping experiences.' },
              { icon: Users, title: 'Joint Accounts', desc: 'Manage household finances together with shared access and transparency.' },
              { icon: History, title: 'Live Activity', desc: 'Real-time notifications for every penny that moves in or out.' }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Trust Banner */}
      <Section className="py-24 bg-blue-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <Container className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black mb-6 tracking-tight leading-tight">Ready to join the financial revolution?</h2>
              <div className="space-y-4">
                {[
                  'No hidden monthly maintenance fees',
                  'Earn 4.5% APY on your savings',
                  '24/7 Priority human support'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-emerald-400" size={20} />
                    <span className="text-lg font-medium text-blue-100">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <Link to="/register">
              <Button className="h-16 px-12 text-xl bg-white text-blue-900 hover:bg-blue-50 shadow-2xl font-black">
                Get Started Now
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
