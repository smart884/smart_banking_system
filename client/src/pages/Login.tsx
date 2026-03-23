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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="w-full max-w-md mx-auto">
              <Card className="p-10 shadow-2xl shadow-slate-200/60 rounded-[48px] border-none bg-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors duration-500" />
                
                <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                    <div className="w-16 h-16 rounded-[24px] bg-blue-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-200 animate-in zoom-in duration-500">
                      <LogIn size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Login to Portal</h2>
                    <p className="text-slate-500 font-medium">Enter your registered credentials to access your dashboard.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <Input
                        label="Work Email Address"
                        type="email"
                        name="email"
                        placeholder="e.g. user@smartbank.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600"
                      />
                      <Input
                        label="Security Password"
                        type="password"
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      full 
                      loading={loading}
                      className="h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-black shadow-2xl shadow-blue-100 group"
                    >
                      <span className="flex items-center gap-2 justify-center">
                        Initialize Session <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </form>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
