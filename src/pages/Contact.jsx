import React, { useState, useRef } from 'react';
import Layout from '../components/Layout';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import { Mail, Phone, MessageSquare, Send, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const SERVICE_ID = "service_4vexw9b";
      const TEMPLATE_ID = "template_w6be2rr"; // Updated template ID as requested
      const PUBLIC_KEY = "I5wWVwwuUcAFQsyFb";

      // Updated email as confirmed: smartbank987@gmail.com
      const RECIPIENT_EMAIL = "smartbank987@gmail.com";

      const templateParams = {
        to_email: RECIPIENT_EMAIL,
        to_name: "Smart Bank Support",
        name: form.current.name.value,
        email: form.current.email.value,
        subject: form.current.subject.value,
        message: form.current.message.value, 
        // Fallback for old templates
        otp: form.current.message.value
      };

      emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
        .then((result) => {
          console.log('Email successfully sent!');
          setSubmitted(true);
          setLoading(false);
        }, (error) => {
          console.error('Failed to send email:', error);
          setLoading(false);
          alert(`Failed to send message: ${error.text || "Unknown Error"}. Please try again later.`);
        });
    } catch (err) {
      console.error('Unexpected error in form submission:', err);
      setLoading(false);
      alert("An unexpected error occurred. Please refresh the page and try again.");
    }
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
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {[
              { icon: MessageSquare, title: 'Live Chat', desc: 'Chat with our support team in real-time.', contact: 'Available 24/7' },
              { icon: Mail, title: 'Email Us', desc: 'Get a response within 24 hours.', contact: 'support@smartbank.com' },
              { icon: Phone, title: 'Call Us', desc: 'Direct line to our customer service.', contact: '+1 (800) SMART-BANK' }
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

          <div className="max-w-4xl mx-auto">
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
                <form ref={form} onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        required 
                        className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-slate-900" 
                        placeholder="Rahul Singh"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Email Address</label>
                      <input 
                        type="email" 
                        name="email"
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
                      name="subject"
                      required 
                      className="w-full h-16 px-6 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-slate-900" 
                      placeholder="How can we help?"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Your Message</label>
                    <textarea 
                      name="message"
                      required 
                      rows={6} 
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-slate-900 resize-none" 
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-100 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
