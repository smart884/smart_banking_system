import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SecureAuthContext';
import Layout from '../components/Layout';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ShieldCheck, LogIn, Sparkles, Fingerprint } from 'lucide-react';

/**
 * Premium Login Page (Static Version)
 * Instant redirection without backend calls.
 */
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Authenticate and Fetch Profile from Firestore
      await login(formData.email, formData.password);
      
      // Use a small timeout to ensure SecureAuthContext state is fully updated
      setTimeout(() => {
        const savedUser = localStorage.getItem('sb_static_user');
        if (savedUser) {
          const profile = JSON.parse(savedUser);
          console.log("Redirecting based on database role:", profile.role);
          
          if (profile.role === 'clerk') {
            navigate('/clerk/dashboard');
          } else if (profile.role === 'manager') {
            navigate('/manager/dashboard');
          } else {
            navigate('/user/dashboard');
          }
        } else {
          // Fallback to email-based if profile not found
          const email = formData.email.toLowerCase();
          if (email.includes('clerk')) navigate('/clerk/dashboard');
          else if (email.includes('manager')) navigate('/manager/dashboard');
          else navigate('/user/dashboard');
        }
      }, 800);

    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Section className="bg-slate-50 min-h-screen flex items-center justify-center relative overflow-hidden py-20">
        {/* Abstract Background Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] -mr-1/4 -mt-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[100px] -ml-1/4 -mb-1/4" />

        <Container className="max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left Column: Branding & Info */}
            <div className="hidden lg:block space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-4 duration-700">
                  <Sparkles size={16} />
                  <span>Secure Banking Terminal</span>
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
                  Access Your <span className="text-blue-600">Smart</span> Wealth.
                </h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                  Welcome back to India's most advanced digital banking portal. Securely manage your assets with precision.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {[
                  { icon: Fingerprint, title: 'Biometric Ready', desc: 'Secure hardware-level auth.' },
                  { icon: ShieldCheck, title: 'Encrypted', desc: 'End-to-end data protection.' }
                ].map((item, i) => (
                  <div key={i} className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-blue-600">
                      <item.icon size={24} />
                    </div>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Login Card */}
            <div className="w-full max-w-md mx-auto">
              <Card className="p-10 md:p-14 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[48px] border-none bg-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                
                <div className="relative z-10">
                  <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
                    <p className="text-slate-500 font-medium">Enter your credentials to continue.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Email Protocol</label>
                        <Input 
                          name="email" 
                          type="email" 
                          placeholder="rahul@smartbank.com" 
                          value={formData.email} 
                          onChange={handleChange} 
                          required 
                          className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-blue-600/10 transition-all font-bold text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Security Key</label>
                        <Input 
                          name="password" 
                          type="password" 
                          placeholder="••••••••" 
                          value={formData.password} 
                          onChange={handleChange} 
                          required 
                          className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-blue-600/10 transition-all font-bold text-lg"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-200 text-blue-600 focus:ring-blue-600/20 transition-all" />
                        <span className="font-bold text-slate-600 group-hover:text-slate-900">Keep me synced</span>
                      </label>
                      <button type="button" className="font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest text-xs">Recovery</button>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="h-16 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xl font-black shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <LogIn size={22} />
                          Authenticate
                        </>
                      )}
                    </Button>

                    <div className="text-center pt-4">
                      <p className="text-slate-500 font-medium">
                        New to the platform? {' '}
                        <button 
                          type="button" 
                          onClick={() => navigate('/register')} 
                          className="text-blue-600 font-black hover:underline underline-offset-4"
                        >
                          Join the Evolution
                        </button>
                      </p>
                    </div>
                  </form>
                </div>
              </Card>
              
              <p className="mt-10 text-center text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
                Protected by SmartBank Quantum Guard
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
