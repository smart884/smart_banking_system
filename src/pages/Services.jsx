import React from 'react';
import Layout from '../components/Layout';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import { CreditCard, Send, Wallet, PieChart, ShieldCheck, Headphones, Zap, TrendingUp, Landmark } from 'lucide-react';

export default function Services() {
  return (
    <Layout>
      {/* Hero Section */}
      <Section className="pt-24 pb-16 bg-slate-50 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-100/30 blur-[120px] rounded-full -ml-1/4 -mt-1/4" />
        <Container>
          <div className="text-center max-w-4xl mx-auto relative z-10">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">
              Banking Services <span className="text-blue-600">Perfected</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10">
              Our comprehensive suite of financial services is designed to meet your every need, from personal savings to enterprise-level wealth management.
            </p>
          </div>
        </Container>
      </Section>

      {/* Services Grid */}
      <Section className="py-24 bg-white">
        <Container>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { 
                icon: Wallet, 
                title: 'Smart Savings Accounts', 
                desc: 'Earn industry-leading interest rates with zero maintenance fees and automatic wealth-building tools.',
                features: ['4.5% APY', 'Zero Minimum Balance', 'Daily Compounding']
              },
              { 
                icon: Send, 
                title: 'Instant Global Payments', 
                desc: 'Send money across the globe instantly with 0% transaction fees and real-time exchange rates.',
                features: ['100+ Currencies', 'Instant Settlement', 'Secure Transfers']
              },
              { 
                icon: CreditCard, 
                title: 'Next-Gen Credit Cards', 
                desc: 'Unlock exclusive rewards and premium benefits with our sleek, metal credit cards and virtual cards.',
                features: ['3% Cash Back', 'Lounge Access', 'Virtual Protection']
              },
              { 
                icon: PieChart, 
                title: 'AI Wealth Management', 
                desc: 'Let our intelligent algorithms optimize your portfolio and provide personalized financial insights.',
                features: ['Auto-rebalancing', 'Risk Assessment', 'Tax Optimization']
              },
              { 
                icon: ShieldCheck, 
                title: 'Business Banking', 
                desc: 'Scale your business with dedicated tools for payroll, invoicing, and high-volume transactions.',
                features: ['API Access', 'Multi-user Roles', 'Dedicated Support']
              },
              { 
                icon: Landmark, 
                title: 'Institutional Solutions', 
                desc: 'Customized financial infrastructure for large-scale enterprises and institutional investors.',
                features: ['Custody Services', 'Liquidity Management', 'Risk Advisory']
              }
            ].map((service, i) => (
              <div key={i} className="flex flex-col h-full bg-slate-50/50 p-10 rounded-[40px] border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
                <div className="w-16 h-16 rounded-2xl bg-white text-blue-600 flex items-center justify-center mb-8 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <service.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-8 flex-grow">{service.desc}</p>
                <div className="space-y-3 pt-6 border-t border-slate-200">
                  {service.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <Zap size={16} className="text-blue-500" />
                      <span className="text-sm font-bold text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Feature Highlight */}
      <Section className="py-24 bg-slate-900 text-white">
        <Container>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/20 text-blue-400 text-sm font-bold mb-8">
                <TrendingUp size={16} />
                <span>Advanced Analytics</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight leading-tight">Your financial health, visualized in real-time.</h2>
              <p className="text-xl text-slate-400 leading-relaxed mb-10">
                Our dashboard provides deep insights into your spending habits, investment performance, and financial goals, all powered by our proprietary AI engine.
              </p>
              <div className="space-y-6">
                {[
                  { title: 'Predictive Spending', desc: 'Forecast future expenses based on historical data.' },
                  { title: 'Goal Tracking', desc: 'Set and monitor progress towards your long-term savings goals.' },
                  { title: 'Custom Alerts', desc: 'Receive real-time notifications for unusual activity or reaching limits.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <span className="font-black text-sm">{i + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-[48px] bg-gradient-to-br from-blue-600 to-indigo-800 p-1">
                <div className="w-full h-full rounded-[47px] bg-slate-900 overflow-hidden relative shadow-2xl">
                   {/* Mock UI Element */}
                   <div className="p-10 space-y-8">
                     <div className="h-12 w-1/2 bg-white/10 rounded-xl" />
                     <div className="grid grid-cols-2 gap-6">
                       <div className="h-32 bg-blue-600/20 rounded-3xl" />
                       <div className="h-32 bg-emerald-600/20 rounded-3xl" />
                     </div>
                     <div className="h-64 bg-white/5 rounded-[32px]" />
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Support Section */}
      <Section className="py-24 bg-white">
        <Container>
          <div className="bg-blue-600 rounded-[48px] p-12 md:p-24 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-48 -mt-48" />
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-600 mx-auto mb-10 shadow-2xl animate-bounce-slow">
                <Headphones size={40} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Need help? We're always here.</h2>
              <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto leading-relaxed">
                Our world-class support team is available 24/7 to assist you with any questions or concerns. Whether it's a simple query or a complex transaction, we've got you covered.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button className="h-16 px-12 rounded-2xl bg-white text-blue-600 font-black text-lg hover:bg-blue-50 transition-all shadow-xl hover:scale-105">
                  Live Chat Now
                </button>
                <button className="h-16 px-12 rounded-2xl bg-blue-700 text-white font-black text-lg hover:bg-blue-800 transition-all">
                  Browse Help Center
                </button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
