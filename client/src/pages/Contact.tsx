import React from 'react';
import Layout from '../components/Layout';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import { Mail, Phone, MapPin, MessageSquare, Clock, Globe, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, you'd send the form data here
  };

  return (
    <Layout>
      {/* Hero Section */}
      <Section className="pt-24 pb-16 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-blue-100/30 blur-[120px] rounded-full -mr-1/4 -mt-1/4" />
        <Container>
          <div className="text-center max-w-4xl mx-auto relative z-10">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight">
              Let's Start a <span className="text-blue-600">Conversation</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10">
              Have questions about our services or need assistance with your account? Our team is here to help you every step of the way.
            </p>
          </div>
        </Container>
      </Section>

      {/* Contact Info Grid */}
      <Section className="py-24 bg-white">
        <Container>
          <div className="grid md:grid-cols-4 gap-8 mb-24">
            {[
              { icon: MessageSquare, title: 'Live Chat', desc: 'Chat with our support team in real-time.', contact: 'Available 24/7' },
              { icon: Mail, title: 'Email Us', desc: 'Get a response within 24 hours.', contact: 'support@smartbank.com' },
              { icon: Phone, title: 'Call Us', desc: 'Direct line to our customer service.', contact: '+1 (800) SMART-BANK' },
              { icon: Globe, title: 'Global Offices', desc: 'Visit one of our physical branches.', contact: 'Find a Location' }
            ].map((item, i) => (
              <div key={i} className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500 group text-center">
                <div className="w-16 h-16 rounded-2xl bg-white text-blue-600 flex items-center justify-center mb-6 mx-auto shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">{item.desc}</p>
                <p className="text-blue-600 font-black text-sm uppercase tracking-widest">{item.contact}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-24 items-start">
            {/* Contact Form */}
            <div className="bg-white p-10 md:p-16 rounded-[48px] shadow-2xl shadow-slate-200 border border-slate-100 relative">
              {submitted ? (
                <div className="text-center py-20 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-4">Message Received!</h2>
                  <p className="text-slate-500 mb-8">Thank you for reaching out. One of our experts will get back to you shortly.</p>
                  <button onClick={() => setSubmitted(false)} className="text-blue-600 font-bold hover:underline">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-slate-900" 
                        placeholder="Rahul Singh"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Email Address</label>
                      <input 
                        type="email" 
                        required 
                        className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-slate-900" 
                        placeholder="rahul@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Subject</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-slate-900" 
                      placeholder="How can we help?"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Your Message</label>
                    <textarea 
                      required 
                      rows={6} 
                      className="w-full px-6 py-6 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-slate-900 resize-none" 
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                  <button type="submit" className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3">
                    <Send size={20} />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-12 py-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Visit our Headquarters</h3>
                <div className="flex gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 mb-1">Financial District, Tower 7</p>
                    <p className="text-slate-500 leading-relaxed">Level 42, 100 Global Plaza,<br />Mumbai, Maharashtra 400001, India</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Support Hours</h3>
                <div className="space-y-4">
                  {[
                    { day: 'Online Support', time: '24/7 (Always Available)' },
                    { day: 'Phone Support', time: '9:00 AM — 9:00 PM IST' },
                    { day: 'Office Visit', time: '10:00 AM — 4:00 PM IST (Mon-Fri)' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-widest">{item.day}</p>
                        <p className="text-slate-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-[32px] bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[40px] rounded-full -mr-16 -mt-16" />
                <h4 className="text-xl font-bold mb-4 relative z-10">Join our growing community</h4>
                <p className="text-slate-400 mb-6 relative z-10 text-sm leading-relaxed">Stay updated with the latest news, features, and financial tips from the SmartBank team.</p>
                <div className="flex gap-4 relative z-10">
                  <button className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Globe size={18} />
                  </button>
                  <button className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <MessageSquare size={18} />
                  </button>
                  <button className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <Mail size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
