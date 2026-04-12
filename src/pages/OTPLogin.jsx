import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { ShieldCheck, LogIn, Sparkles, Fingerprint, Mail, KeyRound, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../components/SecureAuthContext';

// Components
const Layout = ({ children }) => <div className="min-h-screen bg-slate-50 font-sans text-slate-900">{children}</div>;
const Section = ({ children, className }) => <section className={`relative ${className}`}>{children}</section>;
const Container = ({ children, className }) => <div className={`container mx-auto px-6 ${className}`}>{children}</div>;
const Card = ({ children, className }) => <div className={`bg-white rounded-[48px] shadow-2xl ${className}`}>{children}</div>;
const Input = (props) => <input {...props} className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:bg-white transition-all font-bold text-lg ${props.className}`} />;
const Button = ({ children, className, disabled, ...props }) => (
  <button 
    {...props} 
    disabled={disabled}
    className={`flex items-center justify-center gap-3 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${className}`}
  >
    {children}
  </button>
);

export default function OTPLogin() {
  const navigate = useNavigate();
  const { allUsers, loginWithOTP } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isSent, setIsSent] = useState(false);

  // Initialize EmailJS with your provided credentials
  const SERVICE_ID = "service_4vexw9b";
  const TEMPLATE_ID = "template_heo7zv8";
  const PUBLIC_KEY = "I5wWVwwuUcAFQsyFb";

  // Auto-verify OTP when 6 digits are entered
  useEffect(() => {
    const autoVerify = async () => {
      if (otp.length === 6 && isSent) {
        handleVerifyOTP();
      }
    };
    autoVerify();
  }, [otp, isSent]);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!email) {
      setError("Please enter your email protocol.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const cleanEmail = email.trim().toLowerCase();
      const userExists = allUsers?.find(u => u.email?.toLowerCase() === cleanEmail);
      
      if (!userExists) {
        setError("This email protocol is not registered.");
        setLoading(false);
        return;
      }

      const newOtp = generateOTP();
      localStorage.setItem('temp_otp', newOtp);
      localStorage.setItem('temp_email', cleanEmail);

      try {
        await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID,
          {
            email: cleanEmail,
            to_email: cleanEmail, // Standard recipient variable
            user_email: cleanEmail, // Alternative recipient variable
            recipient_email: cleanEmail, // Common recipient variable
            email_to: cleanEmail, // Another common variant
            otp: newOtp,
            to_name: userExists.firstName || "Valued Customer",
          },
          PUBLIC_KEY
        );
        setSuccess(`OTP dispatched to ${cleanEmail} ✅`);
        setIsSent(true);
      } catch (emailError) {
        // Fallback removed as per user request for real email focus
        setError("Failed to dispatch code. Please check your connection.");
        setIsSent(false);
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = () => {
    setError("");

    const storedOtp = localStorage.getItem('temp_otp');
    if (otp === storedOtp) {
      setSuccess("Authentication successful! Decrypting session... 🛡️");
      localStorage.removeItem('temp_otp');
      
      // Find user to set profile manually for the OTP demo
      const cleanEmail = email.trim().toLowerCase();
      const userExists = allUsers?.find(u => u.email?.toLowerCase() === cleanEmail);
      
      if (userExists) {
         loginWithOTP(userExists);
         const role = userExists.role?.toLowerCase();
         if (role === 'admin') navigate('/admin/dashboard');
         else if (role === 'manager') navigate('/manager/dashboard');
         else if (role === 'clerk') navigate('/clerk/dashboard');
         else navigate('/user/dashboard');
       } else {
        setError("User profile synchronization failed.");
      }
    } else {
      setError("Invalid OTP. Protocol mismatch. ❌");
    }
  };

  return (
    <Layout>
      <Section className="bg-slate-50 min-h-screen flex items-center justify-center relative overflow-hidden py-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[120px] -mr-1/4 -mt-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-[100px] -ml-1/4 -mb-1/4" />

        <Container className="max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="hidden lg:block space-y-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-4 duration-700">
                  <Sparkles size={16} />
                  <span>Two-Factor Authentication</span>
                </div>
                <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
                  Secure <span className="text-blue-600">OTP</span> Access.
                </h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                  Access your financial grid using a one-time security key sent to your registered email.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {[
                  { icon: ShieldCheck, title: 'Quantum Guard', desc: 'Temporary keys for maximum safety.' },
                  { icon: Mail, title: 'Instant Delivery', desc: 'Securely dispatched to your inbox.' }
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

            <div className="w-full max-w-md mx-auto">
              <Card className="p-10 md:p-14 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                
                <div className="relative z-10">
                  <button 
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-xs uppercase tracking-widest mb-10 transition-colors"
                  >
                    <ArrowLeft size={16} /> BACK TO LOGIN
                  </button>

                  <div className="mb-10 text-center lg:text-left">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Password Recovery</h2>
                    <p className="text-slate-500 font-medium">Enter your registered email to receive a secure reset link.</p>
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

                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">EMAIL PROTOCOL</label>
                      <div className="relative">
                        <Input 
                          type="email" 
                          placeholder="rahul@smartbank.com" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          required 
                          className="pr-32"
                        />
                        <button
                          onClick={handleSendOTP}
                          disabled={loading || !email}
                          className="absolute right-2 top-2 bottom-2 px-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 disabled:opacity-50 transition-all"
                        >
                          {loading ? "Sending..." : "Send Code"}
                        </button>
                      </div>
                    </div>

                    <div className={`space-y-2 transition-all duration-500 ${isSent ? 'opacity-100 translate-y-0' : 'opacity-30 pointer-events-none translate-y-4'}`}>
                      <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">ENTER OTP</label>
                      <Input 
                        type="text" 
                        maxLength="6"
                        placeholder="000000" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                        className="text-center tracking-[0.5em] text-2xl"
                      />
                    </div>

                    <p className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      {isSent ? "OTP sent! Authentication will trigger automatically." : "Send code to enable OTP authentication."}
                    </p>
                  </div>
                </div>
              </Card>
              
              <p className="mt-10 text-center text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
                Secure 2FA Layer Enabled
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
