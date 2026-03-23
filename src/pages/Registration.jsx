import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../lib/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Layout from '../components/Layout';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { UserPlus, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight, Sparkles, MapPin, Phone, Mail, Fingerprint } from 'lucide-react';

/**
 * Professional Registration Page
 * Designed for a high-end fintech experience with multi-step-like sections and robust validation.
 */
export default function Registration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    contact: '',
    altContact: '',
    aadhaar: '',
    pan: '',
    address1: '',
    address2: '',
    address3: '',
    pinCode: '',
    gender: 'Male',
    dob: '',
    role: 'customer'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    // 1. Mandatory Identity Fields
    if (!formData.firstName || !formData.lastName || !formData.dob) {
      setError('Please fill in all Identity Details.');
      return false;
    }

    // 2. Contact & Email
    if (formData.contact.length !== 10 || !/^\d+$/.test(formData.contact)) {
      setError('Contact must be exactly 10 digits.');
      return false;
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return false;
    }
    
    // 3. Aadhaar (12 digits)
    const aadhaarClean = formData.aadhaar.replace(/\s/g, '');
    if (aadhaarClean.length !== 12 || !/^\d+$/.test(aadhaarClean)) {
      setError('Aadhaar must be exactly 12 digits.');
      return false;
    }
    
    // 4. PAN (5 letters + 4 digits + 1 letter)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
    if (!panRegex.test(formData.pan)) {
      setError('Invalid PAN format (e.g., ABCDE1234F).');
      return false;
    }
    
    // 5. Address validation
    if (!formData.address1 || !formData.pinCode) {
      setError('Address and PIN Code are required.');
      return false;
    }
    
    // 6. Password (min 6 chars)
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    
    // 7. Confirm Match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // 2. Save full user data in Firestore 
      await setDoc(doc(db, "users", user.uid), { 
        uid: user.uid, 
        firstName: formData.firstName, 
        middleName: formData.middleName, 
        lastName: formData.lastName, 
        gender: formData.gender, 
        dob: formData.dob, 
        address1: formData.address1, 
        address2: formData.address2, 
        address3: formData.address3, 
        pinCode: formData.pinCode, 
        contactNumber: formData.contact, 
        alternateNumber: formData.altContact, 
        email: formData.email, 
        aadhaar: formData.aadhaar, 
        pan: formData.pan, 
        userType: formData.role || "user", 
        role: formData.role || "customer", 
        status: "pending", 
        createdAt: new Date() 
      }); 

      console.log("Firebase Registration Success ✅", user.uid);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <Section className="flex items-center justify-center min-h-[80vh] bg-slate-50">
          <Container className="max-w-md">
            <Card className="text-center p-12 shadow-2xl animate-in zoom-in-95 rounded-[48px] border-none bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-green-100 text-green-600 mb-8 shadow-xl shadow-green-100 animate-bounce-slow">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Welcome Aboard!</h2>
              <p className="text-slate-500 mb-10 text-lg leading-relaxed font-medium">
                Your SmartBank account has been successfully created. You're ready to experience the future of finance.
              </p>
              <Button onClick={() => navigate('/login')} full className="h-16 rounded-2xl bg-green-600 hover:bg-green-700 text-xl font-black shadow-2xl shadow-green-200">
                Go to Login Now
              </Button>
            </Card>
          </Container>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Section className="bg-slate-50 py-20 min-h-screen relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] -ml-1/4 -mt-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[100px] -mr-1/4 -mb-1/4" />

        <Container className="max-w-5xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[32px] bg-blue-600 text-white shadow-2xl shadow-blue-200 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <UserPlus size={40} />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">Join the <span className="text-blue-600">Smart</span> Evolution</h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Open your professional digital bank account in minutes. Secure, fast, and completely digital.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Form Column */}
            <div className="lg:col-span-8">
              <Card className="shadow-2xl shadow-slate-200/50 rounded-[48px] border-none p-0 overflow-hidden bg-white">
                <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
                  {/* Error Banner */}
                  {error && (
                    <div className="p-6 bg-red-50 border-l-8 border-red-500 text-red-700 flex items-start gap-4 animate-in slide-in-from-top-4">
                      <AlertCircle className="w-6 h-6 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-black text-lg">Action Required</p>
                        <p className="font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Identity Details */}
                  <div className="p-10 md:p-12 space-y-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl shadow-sm">1</div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Identity Details</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">First Name</label>
                        <Input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Rahul" required className="h-14 rounded-xl border-slate-200 focus:ring-blue-600/10 focus:border-blue-600 font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Middle Name</label>
                        <Input name="middleName" value={formData.middleName} onChange={handleChange} placeholder="Singh" className="h-14 rounded-xl border-slate-200 focus:ring-blue-600/10 focus:border-blue-600 font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Last Name</label>
                        <Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Sharma" required className="h-14 rounded-xl border-slate-200 focus:ring-blue-600/10 focus:border-blue-600 font-medium" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 font-medium text-slate-900">
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Date of Birth</label>
                        <Input type="date" name="dob" value={formData.dob} onChange={handleChange} required className="h-14 rounded-xl border-slate-200 focus:ring-blue-600/10 focus:border-blue-600 font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Account Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full h-14 px-4 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 font-medium text-slate-900">
                          <option value="customer">Customer</option>
                          <option value="clerk">Clerk</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Address Details */}
                  <div className="p-10 md:p-12 space-y-10 bg-slate-50/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xl shadow-sm">2</div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Address Details</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Flat/House No, Building</label>
                        <Input name="address1" value={formData.address1} onChange={handleChange} placeholder="e.g. 402, Sunshine Residency" required className="h-14 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Street / Area</label>
                        <Input name="address2" value={formData.address2} onChange={handleChange} placeholder="e.g. MG Road" className="h-14 rounded-xl" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">City / Town</label>
                        <Input name="address3" value={formData.address3} onChange={handleChange} placeholder="e.g. Mumbai" className="h-14 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">PIN Code</label>
                        <Input name="pinCode" value={formData.pinCode} onChange={handleChange} placeholder="e.g. 400001" required maxLength={6} className="h-14 rounded-xl" />
                      </div>
                    </div>
                  </div>

                  {/* Contact & Legal */}
                  <div className="p-10 md:p-12 space-y-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shadow-sm">3</div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Legal & Verification</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2">
                          <Phone size={14} className="text-indigo-600" />
                          Mobile Number
                        </label>
                        <Input name="contact" maxLength={10} value={formData.contact} onChange={handleChange} placeholder="9876543210" required className="h-14 rounded-xl border-slate-200 focus:ring-indigo-600/10 focus:border-indigo-600 font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2">
                          <Mail size={14} className="text-indigo-600" />
                          Email Address
                        </label>
                        <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required className="h-14 rounded-xl border-slate-200 focus:ring-indigo-600/10 focus:border-indigo-600 font-medium" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2">
                          <Fingerprint size={14} className="text-indigo-600" />
                          Aadhaar Number
                        </label>
                        <Input name="aadhaar" maxLength={14} value={formData.aadhaar} onChange={handleChange} placeholder="1234 5678 9012" required className="h-14 rounded-xl border-slate-200 focus:ring-indigo-600/10 focus:border-indigo-600 font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1 flex items-center gap-2">
                          <ShieldCheck size={14} className="text-indigo-600" />
                          PAN Card Number
                        </label>
                        <Input name="pan" maxLength={10} value={formData.pan} onChange={handleChange} placeholder="ABCDE1234F" className="uppercase h-14 rounded-xl border-slate-200 focus:ring-indigo-600/10 focus:border-indigo-600 font-medium" required />
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="p-10 md:p-12 space-y-10 bg-slate-50/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl shadow-sm">4</div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Security Credentials</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Create Password</label>
                        <Input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" required className="h-14 rounded-xl border-slate-200 focus:ring-blue-600/10 focus:border-blue-600 font-medium" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-widest px-1">Confirm Password</label>
                        <Input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-type password" required className="h-14 rounded-xl border-slate-200 focus:ring-blue-600/10 focus:border-blue-600 font-medium" />
                      </div>
                    </div>
                  </div>

                  {/* Submit Section */}
                  <div className="p-10 md:p-12 bg-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-4 text-white/60 text-sm font-medium">
                      <ShieldCheck className="text-blue-400 shrink-0" size={24} />
                      <p>Your data is protected by bank-grade encryption and secure cloud infrastructure.</p>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <Link to="/login" className="text-white font-bold hover:text-blue-400 transition-colors whitespace-nowrap">
                        Already registered?
                      </Link>
                      <Button type="submit" disabled={loading} className="h-16 px-12 bg-blue-600 hover:bg-blue-500 text-white text-xl font-black rounded-2xl shadow-2xl shadow-blue-900/50 flex-grow md:flex-grow-0 group">
                        {loading ? (
                          <span className="flex items-center gap-3">
                            <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Creating...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Open Account
                            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Card>
            </div>

            {/* Why Join Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-10 rounded-[40px] text-white shadow-2xl shadow-blue-200/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -mr-16 -mt-16" />
                <h3 className="text-2xl font-black mb-8 tracking-tight">Why SmartBank?</h3>
                <div className="space-y-8">
                  {[
                    { icon: Sparkles, title: 'Zero Fees', desc: 'No monthly maintenance or transaction charges.' },
                    { icon: ShieldCheck, title: 'Safe & Secure', desc: 'Multi-factor authentication for every login.' },
                    { icon: MapPin, title: 'Paperless', desc: '100% digital onboarding process.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                        <item.icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                        <p className="text-white/70 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-10 rounded-[40px] bg-white shadow-xl shadow-slate-200/50 border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Need Assistance?</h3>
                <p className="text-slate-500 mb-8 text-sm font-medium leading-relaxed">Our support team is available 24/7 to help you with the registration process.</p>
                <Link to="/contact">
                  <Button variant="secondary" full className="h-12 rounded-xl border-slate-200 text-slate-700 font-bold hover:bg-slate-50">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
