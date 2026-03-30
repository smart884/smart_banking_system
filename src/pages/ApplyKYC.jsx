import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Container from '../components/ui/Container';
import Section from '../components/ui/Section';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../components/SecureAuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, Upload, CheckCircle2, AlertCircle, Image as ImageIcon, X } from 'lucide-react';

export default function ApplyKYC() {
  const { userProfile, userAccounts, addCreditCardRequest } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    accountNumber: '',
    
    // Current Details (from database)
    currentName: '',
    currentEmail: '',
    currentMobile: '',
    currentAddress: '',

    // Update Details
    newName: '',
    newEmail: '',
    newMobile: '',
    newAddress: ''
  });

  const [uploads, setUploads] = useState({
    identityProof: null,
    addressProof: null,
    photo: null,
    signature: null
  });

  const [previews, setPreviews] = useState({
    identityProof: null,
    addressProof: null,
    photo: null,
    signature: null
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  useEffect(() => {
    if (userProfile) {
      const fullName = `${userProfile.firstName} ${userProfile.lastName}`;
      const email = userProfile.email || '';
      const mobile = userProfile.contactNumber || '';
      const address = userProfile.address1 || userProfile.address || '';

      setFormData(prev => ({
        ...prev,
        currentName: fullName,
        currentEmail: email,
        currentMobile: mobile,
        currentAddress: address,
        newName: fullName,
        newEmail: email,
        newMobile: mobile,
        newAddress: address
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
    setVerificationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check required uploads
    if (!uploads.identityProof || !uploads.addressProof) {
      setVerificationError('Identity and Address proofs are mandatory.');
      return;
    }

    setLoading(true);
    try {
      // Calculate Total Document Size (Firestore limit is 1MB total)
      const totalSizeChars = Object.values(previews).reduce((sum, base64) => sum + (base64 ? base64.length : 0), 0);
      const totalSizeMB = (totalSizeChars * 0.75) / (1024 * 1024); 

      if (totalSizeMB > 0.9) {
        setVerificationError(`Total document size is too large (~${totalSizeMB.toFixed(2)}MB). Firestore limit is 1MB. Please use smaller image files.`);
        setLoading(false);
        return;
      }

      await addCreditCardRequest({
        ...formData,
        userId: userProfile.uid,
        userName: formData.newName,
        type: 'KYC Update',
        category: 'service',
        status: 'P',
        documents: previews // Base64 images
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (error) {
      console.error("KYC Submission Error:", error);
      setVerificationError(error.message || 'Failed to submit KYC update.');
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
              <h2 className="text-4xl font-black text-slate-900 mb-6">KYC Submitted!</h2>
              <p className="text-xl text-slate-600 mb-10">
                Your KYC document update request has been received. Our compliance team will verify the details within 24-48 hours.
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
              <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">KYC <span className="text-blue-600">Document Update</span></h1>
              <p className="text-xl text-slate-600">Keep your account secure and compliant by updating your identification documents.</p>
            </div>

            <div className="bg-white rounded-[48px] shadow-2xl border border-slate-100 p-12">
              <div className="mb-10 p-6 bg-blue-50 border border-blue-100 rounded-3xl flex gap-4">
                <AlertCircle className="text-blue-600 shrink-0" size={24} />
                <p className="text-sm font-medium text-blue-900 leading-relaxed">
                  Please provide your <strong>New Details</strong> for KYC update.
                </p>
              </div>

              {verificationError && (
                <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-3xl flex gap-4 animate-in shake duration-500">
                  <AlertCircle className="text-rose-600 shrink-0" size={24} />
                  <p className="text-sm font-bold text-rose-900">{verificationError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-12">
                {/* ACCOUNT INFO - AUTOMATIC (FROM DATABASE) */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Name</label>
                      <Input value={formData.currentName} readOnly className="bg-slate-50 border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Number</label>
                      <Input value={formData.accountNumber} readOnly className="bg-slate-50 border-slate-200" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Email</label>
                      <Input value={formData.currentEmail} readOnly className="bg-slate-50 border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Mobile</label>
                      <Input value={formData.currentMobile} readOnly className="bg-slate-50 border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Address</label>
                      <Input value={formData.currentAddress} readOnly className="bg-slate-50 border-slate-200" />
                    </div>
                  </div>
                </div>

                {/* SECTION 1: PROVIDE UPDATE DETAILS */}
                <div className="space-y-6 pt-12 border-t border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xs">01</div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Provide Update Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Full Name</label>
                      <Input name="newName" value={formData.newName} onChange={handleChange} required placeholder="Updated Full Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Email Address</label>
                      <Input name="newEmail" type="email" value={formData.newEmail} onChange={handleChange} required placeholder="Updated Email" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Mobile Number</label>
                      <Input name="newMobile" value={formData.newMobile} onChange={handleChange} required placeholder="Updated Mobile" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Residential Address</label>
                      <textarea 
                        name="newAddress" 
                        value={formData.newAddress} 
                        onChange={handleChange} 
                        required 
                        className="w-full p-6 rounded-2xl border-2 border-slate-100 focus:border-blue-600 focus:outline-none transition-all font-medium resize-none"
                        placeholder="Your updated full address..."
                        rows="2"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: UPLOAD DOCUMENTS */}
                <div className="space-y-6 pt-12 border-t border-slate-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-black text-xs">02</div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Upload Documents</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                      { id: 'identityProof', label: 'Identity Proof', sub: 'Passport / Voter ID / DL' },
                      { id: 'addressProof', label: 'Address Proof', sub: 'Utility Bill / Rent Agreement' },
                      { id: 'photo', label: 'Recent Photo', sub: 'Passport size image' },
                      { id: 'signature', label: 'Signature', sub: 'Signed on white paper' }
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
                        
                        <label className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-[32px] cursor-pointer transition-all group relative overflow-hidden ${
                          previews[doc.id] ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50 hover:border-blue-400'
                        }`}>
                          {previews[doc.id] ? (
                            <img src={previews[doc.id]} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mb-2 transition-colors" />
                              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Select File</p>
                            </div>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, doc.id)} />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-20 bg-slate-900 hover:bg-blue-600 text-white font-black text-lg rounded-3xl shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-4"
                  >
                    {loading ? (
                      <>Processing Terminal... <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" /></>
                    ) : (
                      <>Verify & Submit KYC Update <CheckCircle2 size={24} /></>
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
