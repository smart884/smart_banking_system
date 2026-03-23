import React from 'react';
import Layout from '../components/Layout';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import { Shield, Target, Award, Users, Landmark, Globe } from 'lucide-react';

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <Section className="pt-24 pb-16 bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] rounded-full -mr-1/4 -mt-1/4" />
        <Container>
          <div className="max-w-3xl relative z-10">
            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
              Redefining the <span className="text-blue-400">Future</span> of Banking
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-10">
              SmartBank isn't just a financial institution; it's a technology company built to empower individuals and businesses with the tools they need to thrive in a digital-first world.
            </p>
          </div>
        </Container>
      </Section>

      {/* Mission & Vision */}
      <Section className="py-24 bg-white">
        <Container>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold">
                <Target size={16} />
                <span>Our Mission</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Financial inclusion for everyone, everywhere.</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                We believe that access to secure and efficient banking is a fundamental right. Our mission is to break down the barriers of traditional banking, making it accessible, transparent, and rewarding for everyone.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <h4 className="text-3xl font-black text-blue-600 mb-1">10M+</h4>
                  <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Global Users</p>
                </div>
                <div>
                  <h4 className="text-3xl font-black text-blue-600 mb-1">50+</h4>
                  <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Countries</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[40px] bg-slate-100 overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=800" 
                  alt="Team collaboration" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-blue-600 text-white p-8 rounded-3xl shadow-2xl max-w-xs animate-in slide-in-from-left-10 duration-1000">
                <p className="text-lg font-bold italic">"We are building the foundation for the next century of global commerce."</p>
                <p className="mt-4 font-black text-sm uppercase tracking-widest opacity-80">— Our Founder</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section className="py-24 bg-slate-50">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">The Values that Drive Us</h2>
            <p className="text-lg text-slate-500">Integrity, innovation, and impact are at the core of everything we do.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Uncompromising Security', desc: 'We employ military-grade encryption and rigorous security protocols to ensure your data and assets are always protected.' },
              { icon: Globe, title: 'Global Accessibility', desc: 'Banking without borders. Our platform is designed to work seamlessly across different currencies and jurisdictions.' },
              { icon: Award, title: 'Customer First', desc: 'Every feature we build is designed with the user in mind, focusing on simplicity, speed, and real-world value.' },
              { icon: Users, title: 'Inclusivity', desc: 'We design for everyone, regardless of their financial background or technical expertise.' },
              { icon: Landmark, title: 'Regulatory Excellence', desc: 'We work closely with global regulators to ensure full compliance and the highest standards of financial integrity.' },
              { icon: Award, title: 'Continuous Innovation', desc: 'The world changes fast. We are constantly evolving our technology to stay ahead of the curve.' }
            ].map((value, i) => (
              <div key={i} className="bg-white p-10 rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-500 group border border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <value.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{value.title}</h3>
                <p className="text-slate-500 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-24 bg-blue-600 text-white text-center">
        <Container>
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Ready to start your journey?</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join the millions of people who have already made the switch to a smarter way of banking.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="h-16 px-10 rounded-2xl bg-white text-blue-600 font-black text-lg hover:bg-blue-50 transition-colors shadow-xl">
              Create an Account
            </button>
            <button className="h-16 px-10 rounded-2xl bg-blue-700 text-white font-black text-lg hover:bg-blue-800 transition-colors">
              Contact Sales
            </button>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
