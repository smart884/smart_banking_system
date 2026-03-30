import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../components/SecureAuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Landmark, User, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

export default function ApplyDebitCard() {
  const { userProfile, userAccounts, addCreditCardRequest } = useAuth(); // Reusing the same service table for consistency
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accountNumber: '',
    fullName: '',
    mobile: '',
    aadhaar: '',
    pan: '',
    cardType: 'Classic',
    shippingAddress: '',
    reason: 'New Card'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        fullName: `${userProfile.firstName} ${userProfile.lastName}`,
        mobile: userProfile.contactNumber || '',
        aadhaar: userProfile.aadhaar || '',
        pan: userProfile.pan || '',
        shippingAddress: userProfile.address || ''
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
      // Reusing the same logic for service requests but with 'Debit Card Request' type
      await addCreditCardRequest({
        ...formData,
        userId: userProfile.uid,
        userName: formData.fullName,
        type: 'Debit Card Request',
        category: 'service',
        status: 'P' // Pending
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
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-6">Application Submitted!</h2>
              <p className="text-xl text-slate-600 mb-10">
                Your debit card request has been received. Your card will be dispatched to your address once verified.
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
              <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Request <span className="text-blue-600">Debit Card</span></h1>
              <p className="text-xl text-slate-600">Access your funds anytime, anywhere with our global debit cards.</p>
            </div>

            <div className="bg-white rounded-[48px] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="grid md:grid-cols-5">
                <div className="md:col-span-2 bg-slate-900 p-12 text-white">
                  <h3 className="text-2xl font-bold mb-8">Card Benefits</h3>
                  <div className="space-y-8">
                    {[
                      { icon: ShieldCheck, title: 'Secure Payments', desc: 'Enhanced chip & pin protection for all transactions.' },
                      { icon: Landmark, title: 'Zero Fees', desc: 'No ATM withdrawal charges at any SmartBank ATM.' },
                      { icon: CreditCard, title: 'Tap & Pay', desc: 'Contactless technology for faster checkout.' }
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
                </div>

                <div className="md:col-span-3 p-12">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Linked Account</label>
                      <select 
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleChange}
                        className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all appearance-none bg-white font-medium"
                      >
                        {userAccounts.map(acc => (
                          <option key={acc.accountNumber} value={acc.accountNumber}>
                            {acc.accountNumber} ({acc.accountType})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                        <Input 
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          readOnly
                          className="bg-slate-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Mobile Number</label>
                        <Input 
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
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
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Card Category</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: 'Classic', desc: 'Everyday Banking' },
                          { name: 'Platinum', desc: 'Higher Limits' }
                        ].map(type => (
                          <button 
                            key={type.name}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, cardType: type.name }))}
                            className={`p-4 rounded-2xl border-2 text-left transition-all ${
                              formData.cardType === type.name 
                                ? 'bg-blue-50 border-blue-600 shadow-lg' 
                                : 'bg-white border-slate-100 hover:border-slate-300'
                            }`}>
                            <p className="font-black text-slate-900 uppercase tracking-tighter">{type.name}</p>
                            <p className="text-[10px] font-bold text-slate-500">{type.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Shipping Address</label>
                      <div className="relative">
                        <textarea 
                          name="shippingAddress"
                          value={formData.shippingAddress}
                          onChange={handleChange}
                          required
                          rows="3"
                          className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all font-medium resize-none"
                          placeholder="Your full delivery address..."
                        />
                        <MapPin className="absolute right-4 top-4 text-slate-300" size={20} />
                      </div>
                    </div>

                    <div className="pt-6">
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-200"
                      >
                        {loading ? 'Processing Request...' : 'Request New Card'}
                      </Button>
                    </div>
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
