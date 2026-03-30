import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../components/SecureAuthContext';
import { useNavigate } from 'react-router-dom';
import { Landmark, User, Briefcase, IndianRupee, Calendar, CheckCircle2, Upload, X } from 'lucide-react';

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
    loanAmount: '100000',
    tenure: '12',
    employmentType: 'Salaried',
    companyName: '',
    workExperience: '',
    monthlyIncome: '',
    purpose: 'Wedding'
  });

  const [uploads, setUploads] = useState({
    identityProof: null,
    addressProof: null,
    incomeProof: null
  });

  const [previews, setPreviews] = useState({
    identityProof: null,
    addressProof: null,
    incomeProof: null
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // EMI Calculation Logic
  const calculateEMI = () => {
    const P = parseFloat(formData.loanAmount);
    const r = 0.105 / 12; // 10.5% annual interest rate assumed
    const n = parseInt(formData.tenure);
    
    if (isNaN(P) || isNaN(n) || P <= 0 || n <= 0) return 0;
    
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

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
    if (userAccounts && userAccounts.length > 0) {
      setFormData(prev => ({
        ...prev,
        accountNumber: userAccounts[0].accountNumber
      }));
    }
  }, [userProfile, userAccounts]);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setUploads(prev => ({ ...prev, [type]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type) => {
    setUploads(prev => ({ ...prev, [type]: null }));
    setPreviews(prev => ({ ...prev, [type]: null }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploads.identityProof || !uploads.addressProof || !uploads.incomeProof) {
      setError('Please upload all required documents.');
      return;
    }

    setLoading(true);
    try {
      const emi = calculateEMI();
      const tenure = parseInt(formData.tenure);
      const interestRate = 10.5; // 10.5% p.a.
      const totalPayable = emi * tenure;

      await addCreditCardRequest({
        ...formData,
        userId: userProfile.uid,
        userName: formData.fullName,
        type: 'Personal Loan Request',
        category: 'loan',
        status: 'P', // Pending
        emi: emi,
        interestRate: `${interestRate}%`,
        tenure: tenure,
        loanAmount: parseFloat(formData.loanAmount),
        totalPayable: totalPayable,
        documents: previews // Base64 images
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      console.error("Submission error:", error);
      setError('Failed to submit application. Please try again.');
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
              <form onSubmit={handleSubmit} className="space-y-12">
                {/* SECTION 1: LOAN DETAILS */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">01</div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Loan Configuration</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loan Amount (₹)</label>
                      <Input 
                        name="loanAmount"
                        type="number"
                        value={formData.loanAmount}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 100000"
                        className="h-14"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loan Tenure (Months)</label>
                      <select 
                        name="tenure"
                        value={formData.tenure}
                        onChange={handleChange}
                        className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all appearance-none bg-white font-medium"
                      >
                        <option value="12">12 Months</option>
                        <option value="24">24 Months</option>
                        <option value="36">36 Months</option>
                        <option value="48">48 Months</option>
                        <option value="60">60 Months</option>
                      </select>
                    </div>
                  </div>

                  {/* EMI DISPLAY */}
                  <div className="bg-blue-50 rounded-3xl p-8 border-2 border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
                        <IndianRupee size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Estimated Monthly EMI</p>
                        <p className="text-3xl font-black text-blue-600">₹{calculateEMI().toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interest Rate</p>
                      <p className="text-xl font-black text-slate-600">10.5% <span className="text-sm font-bold text-slate-400">p.a.</span></p>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: PERSONAL & IDENTITY */}
                <div className="space-y-6 pt-12 border-t border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">02</div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Personal & Identity</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mobile Number</label>
                      <Input name="mobile" value={formData.mobile} onChange={handleChange} required placeholder="+91 98765 43210" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                      <Input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="user@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aadhaar Number</label>
                      <Input name="aadhaar" value={formData.aadhaar} onChange={handleChange} required placeholder="1234 5678 9012" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">PAN Card Number</label>
                      <Input name="pan" value={formData.pan} onChange={handleChange} required placeholder="ABCDE1234F" />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: EMPLOYMENT & FINANCIAL */}
                <div className="space-y-6 pt-12 border-t border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">03</div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Employment & Financial</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Employment Type</label>
                      <select name="employmentType" value={formData.employmentType} onChange={handleChange} className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all bg-white font-medium">
                        <option>Salaried</option>
                        <option>Self-Employed</option>
                        <option>Business Owner</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company Name</label>
                      <Input name="companyName" value={formData.companyName} onChange={handleChange} required placeholder="Where do you work?" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Work Experience (Years)</label>
                      <Input name="workExperience" type="number" value={formData.workExperience} onChange={handleChange} required placeholder="Total experience" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Income (₹)</label>
                      <Input name="monthlyIncome" type="number" value={formData.monthlyIncome} onChange={handleChange} required placeholder="Net monthly income" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Purpose of Loan</label>
                      <select name="purpose" value={formData.purpose} onChange={handleChange} className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all bg-white font-medium">
                        <option>Wedding</option>
                        <option>Medical Emergency</option>
                        <option>Home Renovation</option>
                        <option>Education</option>
                        <option>Travel</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Credit Account</label>
                      <select name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full h-14 px-6 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all bg-white font-medium">
                        {userAccounts.map(acc => (
                          <option key={acc.accountNumber} value={acc.accountNumber}>
                            {acc.accountNumber} ({acc.accountType})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: DOCUMENT UPLOAD */}
                <div className="space-y-6 pt-12 border-t border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-black text-xs">04</div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Document Verification</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { id: 'identityProof', label: 'Aadhaar Card', sub: 'Front & Back' },
                      { id: 'addressProof', label: 'PAN Card', sub: 'Clear Image' },
                      { id: 'incomeProof', label: 'Income Proof', sub: '3 Months Payslip' }
                    ].map(doc => (
                      <div key={doc.id} className="space-y-4">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{doc.label}</p>
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{doc.sub}</p>
                          </div>
                          {previews[doc.id] && (
                            <button type="button" onClick={() => removeImage(doc.id)} className="text-rose-500 font-black text-[9px] uppercase tracking-widest hover:underline flex items-center gap-1">
                              <X size={10} /> Remove
                            </button>
                          )}
                        </div>
                        
                        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-[32px] cursor-pointer transition-all group relative overflow-hidden ${
                          previews[doc.id] ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50 hover:border-blue-400'
                        }`}>
                          {previews[doc.id] ? (
                            <img src={previews[doc.id]} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-6 h-6 text-slate-300 group-hover:text-blue-500 mb-2 transition-colors" />
                              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest text-center px-4">Upload {doc.label}</p>
                            </div>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, doc.id)} />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 text-rose-600 p-6 rounded-3xl flex items-center gap-4 font-bold border border-rose-100">
                    <AlertCircle size={24} />
                    {error}
                  </div>
                )}

                <div className="pt-6">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-20 bg-slate-900 hover:bg-blue-600 text-white font-black text-lg rounded-3xl shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-4"
                  >
                    {loading ? (
                      <>Processing Application... <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" /></>
                    ) : (
                      <>Submit Loan Request <CheckCircle2 size={24} /></>
                    )}
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
