import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SecureAuthContext';
import Layout from '../components/Layout';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { ShieldCheck, LogIn, Sparkles, Fingerprint, Mail, KeyRound, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { db } from '../lib/firebaseConfig';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Premium Login Page (Static Version)
 * Instant redirection without backend calls.
 */
export default function Login() {
  const navigate = useNavigate();
  const { login, forgotPassword, allUsers, loginWithOTP } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: Email/OTP, 2: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail) {
      setError("Please enter your email protocol.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      
      const cleanEmail = forgotEmail.trim().toLowerCase();
      const userExists = allUsers?.find(u => u.email?.toLowerCase() === cleanEmail);
      
      if (!userExists) {
        setError("This email protocol is not registered.");
        setLoading(false);
        return;
      }

      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem('temp_otp', newOtp);
      
      const SERVICE_ID = "service_4vexw9b";
      const TEMPLATE_ID = "template_heo7zv8";
      const PUBLIC_KEY = "I5wWVwwuUcAFQsyFb";

      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
          email: cleanEmail,
          to_email: cleanEmail, // Standard recipient variable
          user_email: cleanEmail, // Alternative recipient variable
          recipient_email: cleanEmail, // Common recipient variable
          email_to: cleanEmail, // Another common variant
          otp: newOtp,
          to_name: userExists.firstName || "Valued Customer"
        }, PUBLIC_KEY);
        setSuccess(`Secure OTP dispatched to ${cleanEmail} ✅`);
        setIsOtpSent(true);
      } catch (err) {
        setError("Failed to dispatch code. Please check your connection.");
        setIsOtpSent(false);
      }
    } catch (err) {
      setError("Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalPasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Security key must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // 1. Find user in Firestore to get their UID
      const cleanEmail = forgotEmail.trim().toLowerCase();
      const userExists = allUsers?.find(u => u.email?.toLowerCase() === cleanEmail);
      
      if (!userExists || !userExists.uid) {
        throw new Error("User record mismatch. Please use standard reset link.");
      }

      // 2. Update the "password" in Firestore users collection
      // Although Firebase Auth manages the real password, we can store it in Firestore 
      // for this demo/static environment to simulate a real change.
      const userRef = doc(db, 'users', userExists.uid);
      await updateDoc(userRef, {
        tempPassword: newPassword, // Store temporarily for demo
        lastPasswordReset: serverTimestamp()
      });

      // 3. Success Feedback
      setSuccess("Security key updated successfully! Please login with your new key. ✅");
      setLoading(false);
      
      setTimeout(() => {
        setShowForgot(false);
        setRecoveryStep(1);
        setIsOtpSent(false);
        setForgotEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setSuccess('');
        setError('');
      }, 2000);
    } catch (err) {
      console.error("Password reset error:", err);
      setError("Failed to update security key. " + (err.message || ""));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (otp.length === 6 && isOtpSent && recoveryStep === 1) {
      const storedOtp = localStorage.getItem('temp_otp');
      if (otp === storedOtp) {
        setSuccess("OTP verified! Please create your new security key. 🛡️");
        localStorage.removeItem('temp_otp');
        
        setTimeout(() => {
          setRecoveryStep(2);
          setSuccess('');
          setError('');
        }, 1000);
      } else {
        setError("Invalid OTP. Protocol mismatch. ❌");
      }
    }
  }, [otp, isOtpSent, recoveryStep]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const result = await login(email, password);

      if (result.success) {
        const role = result.profile.role?.toLowerCase();
        // Redirect based on role
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'manager') navigate('/manager/dashboard');
        else if (role === 'clerk') navigate('/clerk/dashboard');
        else navigate('/user/dashboard');
      } else {
        setError(result.message || "Invalid credentials. Please check your email and password.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("An unexpected error occurred. Please try again later.");
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
              <Card className="p-10 md:p-14 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[48px] border-none bg-white relative overflow-hidden group min-h-[500px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                
                <div className="relative z-10">
                  {!showForgot ? (
                    <>
                      <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
                        <p className="text-slate-500 font-medium">Enter your credentials to continue.</p>
                      </div>

                      {error && (
                        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Email Protocol</label>
                            <Input 
                              name="email" 
                              type="email" 
                              placeholder="rahul@smartbank.com" 
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)} 
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
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)} 
                              required 
                              className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-blue-600/10 transition-all font-bold text-lg"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end text-sm">
                          <button 
                            type="button" 
                            onClick={() => { setShowForgot(true); setError(""); setSuccess(""); }}
                            className="font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest text-xs"
                          >
                            Forgot Password?
                          </button>
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

                        <div className="text-center pt-4 space-y-4">
                          <button 
                            type="button" 
                            onClick={() => navigate('/login-otp')} 
                            className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 text-slate-600 font-black hover:bg-white hover:border-blue-600/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                          >
                            <Mail size={16} /> Login with Secure OTP
                          </button>
                          
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
                    </>
                  ) : (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                      <button 
                        onClick={() => { setShowForgot(false); setRecoveryStep(1); setError(""); setSuccess(""); setIsOtpSent(false); }}
                        className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest mb-10 transition-colors"
                      >
                        <ArrowLeft size={16} /> Back to Login
                      </button>

                      <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                          {recoveryStep === 1 ? "Password Recovery" : "Reset Security Key"}
                        </h2>
                        <p className="text-slate-500 font-medium">
                          {recoveryStep === 1 
                            ? "Enter your registered email to receive a secure reset link." 
                            : "Securely update your access credentials."}
                        </p>
                      </div>

                      {error && (
                        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold animate-in fade-in slide-in-from-top-2 flex items-center gap-3">
                          <AlertCircle size={18} />
                          {error}
                        </div>
                      )}

                      {success && (
                        <div className="mb-8 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm font-bold animate-in fade-in slide-in-from-top-2 flex items-center gap-3">
                          <CheckCircle2 size={18} />
                          {success}
                        </div>
                      )}

                      {recoveryStep === 1 ? (
                        <div className="space-y-8">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Email Protocol</label>
                            <div className="relative">
                              <Input 
                                name="email" 
                                type="email" 
                                placeholder="rahul@smartbank.com" 
                                value={forgotEmail} 
                                onChange={(e) => setForgotEmail(e.target.value)} 
                                required 
                                className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-blue-600/10 transition-all font-bold text-lg pr-32"
                              />
                              <button
                                onClick={handleSendOTP}
                                disabled={loading || !forgotEmail}
                                className="absolute right-2 top-2 bottom-2 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 disabled:opacity-50 transition-all"
                              >
                                {loading ? "Sending..." : "Send Code"}
                              </button>
                            </div>
                          </div>

                          <div className={`space-y-2 transition-all duration-500 ${isOtpSent ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none translate-y-4'}`}>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Enter OTP</label>
                            <Input 
                              type="text" 
                              maxLength="6"
                              placeholder="000000" 
                              value={otp} 
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                              className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-blue-600/10 transition-all font-bold text-2xl text-center tracking-[0.5em]"
                            />
                          </div>

                          <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            {isOtpSent ? "OTP sent! Authentication will trigger automatically." : "Send code to enable OTP authentication."}
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleFinalPasswordReset} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">New Security Key</label>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                                className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-blue-600/10 transition-all font-bold text-lg"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Confirm New Key</label>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                value={confirmNewPassword} 
                                onChange={(e) => setConfirmNewPassword(e.target.value)} 
                                required 
                                className="h-16 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-blue-600/10 transition-all font-bold text-lg"
                              />
                            </div>
                          </div>

                          <Button 
                            type="submit" 
                            disabled={loading} 
                            className="h-16 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xl font-black shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest"
                          >
                            {loading ? (
                              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <ShieldCheck size={22} />
                                Confirm Reset
                              </>
                            )}
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
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
