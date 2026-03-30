import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../components/SecureAuthContext';
import { useNavigate } from 'react-router-dom';
import { Landmark, User, Briefcase, IndianRupee, Calendar, CheckCircle2 } from 'lucide-react';

export default function ApplyPersonalLoan() {
  const { userProfile, userAccounts, addCreditCardRequest } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accountNumber: '',
    fullName: '',
    mobile: '',
    email: '',
    aadhaar: '',
    pan: '',
    loanAmount: '50000',
    tenure: '12',
    employmentType: 'Salaried',
    monthlyIncome: '',
    purpose: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        fullName: `${userProfile.firstName} ${userProfile.lastName}`,
        mobile: userProfile.contactNumber || '',
        email: userProfile.email || '',
        aadhaar: userProfile.aadhaar || '',
        pan: userProfile.pan || ''
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
        type: 'Personal Loan Request',
        category: 'loan',
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
              <h2 className="text-4xl font-black text-slate-900 mb-6">Loan Application Submitted!</h2>
              <p className="text-xl text-slate-600 mb-10">
                Your personal loan request is now under review. We will notify you once a decision is made.
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
              <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Apply for a <span className="text-blue-600">Personal Loan</span></h1>
              <p className="text-xl text-slate-600">Flexible loans for your personal needs, with competitive interest rates.</p>
            </div>

            <div className="bg-white rounded-[48px] shadow-2xl border border-slate-100 p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label">Loan Amount (₹)</label>
                    <Input 
                      name="loanAmount"
                      type="number"
                      value={formData.loanAmount}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 100000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label">Loan Tenure (Months)</label>
                    <select 
                      name="tenure"
                      value={formData.tenure}
                      onChange={handleChange}
                      className="input"
                    >
                      <option>12</option>
                      <option>24</option>
                      <option>36</option>
                      <option>48</option>
                      <option>60</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label text-xs font-black uppercase tracking-widest text-slate-400">Mobile Number</label>
                    <Input 
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      placeholder="+91 9876543210"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                    <Input 
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label text-xs font-black uppercase tracking-widest text-slate-400">Aadhaar Number</label>
                    <Input 
                      name="aadhaar"
                      value={formData.aadhaar}
                      onChange={handleChange}
                      required
                      placeholder="1234 5678 9012"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label text-xs font-black uppercase tracking-widest text-slate-400">PAN Card Number</label>
                    <Input 
                      name="pan"
                      value={formData.pan}
                      onChange={handleChange}
                      required
                      placeholder="ABCDE1234F"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="label">Employment Type</label>
                    <select 
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      className="input"
                    >
                      <option>Salaried</option>
                      <option>Self-Employed</option>
                      <option>Business Owner</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="label">Monthly Income (₹)</label>
                    <Input 
                      name="monthlyIncome"
                      type="number"
                      value={formData.monthlyIncome}
                      onChange={handleChange}
                      required
                      placeholder="Your net monthly income"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label">Purpose of Loan</label>
                  <Input 
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Wedding, Medical Emergency, Home Renovation"
                  />
                </div>

                <div className="space-y-2">
                  <label className="label">Credit Account</label>
                  <select 
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="input"
                  >
                    {userAccounts.map(acc => (
                      <option key={acc.accountNumber} value={acc.accountNumber}>
                        {acc.accountNumber} ({acc.accountType})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-200"
                  >
                    {loading ? 'Submitting Application...' : 'Apply for Loan'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
