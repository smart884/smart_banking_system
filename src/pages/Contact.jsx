import React from 'react';
import Layout from '../components/Layout';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import { Mail, Phone, MapPin, MessageSquare, Clock, Globe, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e) => {
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
                        placeholder="rahul@email.com"
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
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-slate-900 resize-none" 
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all"
                  >
                    <Send size={20} />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Office Locations */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-black text-slate-900 mb-6">Our Headquarters</h2>
                <div className="flex items-start gap-6 group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">New York City, USA</h4>
                    <p className="text-slate-500 leading-relaxed">
                      123 Finance Plaza, Wall Street District<br />
                      New York, NY 10005
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900 mb-6">Customer Support</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">24/7 Priority Support</p>
                      <p className="text-sm text-slate-500">For all Elite and Corporate accounts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Mon - Fri: 9:00 AM - 6:00 PM</p>
                      <p className="text-sm text-slate-500">Standard business support hours</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 bg-slate-900 rounded-[40px] text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <h4 className="text-xl font-black mb-4">Press Inquiries</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">For media kits and press releases, please contact our PR department.</p>
                <a href="mailto:press@smartbank.com" className="text-blue-400 font-bold hover:underline">press@smartbank.com</a>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
