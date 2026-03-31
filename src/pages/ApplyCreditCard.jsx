import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../components/SecureAuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Landmark, User, FileText, Smartphone, IndianRupee } from 'lucide-react';

export default function ApplyCreditCard() {
  const { userProfile, userAccounts, addCreditCardRequest } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accountNumber: '',
    fullName: '',
    pan: '',
    aadhaar: '',
    mobile: '',
    email: '',
    income: '',
    employmentType: 'Salaried',
    cardType: 'Basic'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        fullName: `${userProfile.firstName} ${userProfile.lastName}`,
        mobile: userProfile.contactNumber || '',
        email: userProfile.email || ''
      }));
    }
    if (userAccounts.length > 0) {
      setFormData(prev => ({
        ...prev,
        accountNumber: userAccounts[0].accountNumber
      }));
    }
  }, [userProfile, userAccounts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addCreditCardRequest({
        ...formData,
        userId: userProfile.uid,
        userName: formData.fullName,
        type: 'Credit Card Request',
        category: 'service'
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <Section className="py-32">
          <Container>
            <div className="max-w-2xl mx-auto text-center bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <CreditCard size={48} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-6">Application Submitted!</h2>
              <p className="text-xl text-slate-600 mb-10">
                Your credit card request has been received and is currently <span className="font-bold text-amber-500">Pending (P)</span>. 
                Our team will review your details shortly.
              </p>
              <p className="text-slate-400">Redirecting to dashboard...</p>
            </div>
          </Container>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Section className="pt-32 pb-24 bg-slate-50">
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 text-center">
              <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Apply for <span className="text-blue-600">Credit Card</span></h1>
              <p className="text-xl text-slate-600">Get access to premium rewards and a flexible credit limit.</p>
            </div>

            <div className="bg-white rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="grid md:grid-cols-5">
                <div className="md:col-span-2 bg-slate-900 p-12 text-white">
                  <h3 className="text-2xl font-bold mb-8">Why Smart Credit?</h3>
                  <div className="space-y-8">
                    {[
                      { icon: IndianRupee, title: 'Higher Limit', desc: 'Get a limit based on your actual income.' },
                      { icon: CreditCard, title: 'Zero Fees', desc: 'No annual maintenance charges for first 2 years.' },
                      { icon: Landmark, title: 'Global Usage', desc: 'Accepted at over 30 million merchants worldwide.' }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                          <item.icon size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold mb-1">{item.title}</h4>
                          <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-16 p-6 rounded-3xl bg-white/5 border border-white/10">
                    <p className="text-sm italic text-slate-400">"The fastest approval process I've ever experienced in banking."</p>
                    <p className="mt-4 font-bold text-blue-400">- Satisfied Customer</p>
                  </div>
                </div>

                <div className="md:col-span-3 p-12">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Account Number</label>
                        <Input 
                          name="accountNumber"
                          value={formData.accountNumber}
                          onChange={handleChange}
                          readOnly
                          className="bg-slate-50"
                          placeholder="Loading account..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                        <Input 
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          placeholder="Your Name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">PAN Card Number</label>
                        <Input 
                          name="pan"
                          value={formData.pan}
                          onChange={handleChange}
                          required
                          placeholder="ABCDE1234F"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Aadhaar Number</label>
                        <Input 
                          name="aadhaar"
                          value={formData.aadhaar}
                          onChange={handleChange}
                          required
                          placeholder="1234 5678 9012"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Mobile Number</label>
                        <Input 
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          required
                          placeholder="+91 9876543210"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                        <Input 
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="e.g. user@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Monthly Income (₹)</label>
                      <Input 
                        name="income"
                        type="number"
                        value={formData.income}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 50000"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Employment Type</label>
                      <select 
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleChange}
                        className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all appearance-none bg-white font-medium"
                      >
                        <option>Salaried</option>
                        <option>Self-Employed</option>
                        <option>Business Owner</option>
                        <option>Student</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Card Selection</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { name: 'Basic', limit: '50,000' },
                          { name: 'Platinum', limit: '100,000' },
                          { name: 'Gold', limit: '150,000' }
                        ].map(card => (
                          <button 
                            key={card.name}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, cardType: card.name }))}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${
                              formData.cardType === card.name 
                                ? 'bg-blue-50 border-blue-600 shadow-lg' 
                                : 'bg-white border-slate-100 hover:border-slate-300'
                            }`}>
                            <p className="font-black text-slate-900">{card.name} Card</p>
                            <p className="text-[10px] font-bold text-slate-500">Limit: ₹{card.limit}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-200"
                      >
                        {loading ? 'Submitting Application...' : 'Submit Request'}
                      </Button>
                    </div>
                    
                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      By submitting, you agree to our Credit Assessment Terms.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
