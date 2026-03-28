import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/SecureAuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  User as UserIcon, 
  Send,
  CreditCard,
  PlusCircle,
  Receipt,
  Smartphone,
  Briefcase,
  FileText,
  ShieldCheck,
  Eye,
  EyeOff,
  Landmark,
  CheckCircle2,
  X,
  ArrowRight,
  PieChart,
  Layout as LayoutIcon,
  CreditCard as CardIcon,
  LogOut,
  Bell,
  Search,
  Sparkles,
  Zap,
  CreditCard as CreditCardIcon,
  FileCheck,
  UserPlus,
  Clock
} from 'lucide-react';

import Modal from '../components/ui/Modal';

export default function SecureDashboard() {
  const { userProfile, logout, addRequest, requests, userAccounts } = useAuth(); // Added userAccounts
  const [showBalance, setShowBalance] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Filter requests for current user (Support both UID and Name for backward compatibility)
  const userRequests = requests.filter(req => 
    req.userId === userProfile?.uid || 
    (!req.userId && req.userName === `${userProfile?.firstName} ${userProfile?.lastName}`)
  );
  
  // Helper to get Date object from various timestamp formats
  const getDateObject = (ts) => {
    if (!ts) return new Date();
    return ts.toDate ? ts.toDate() : new Date(ts);
  };

  // Helper to format account dates correctly
  const formatAccountDate = (ts) => {
    const date = getDateObject(ts);
    return isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Helper to generate deterministic account numbers for pending/approved requests
  const getSimulatedAccNum = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }
    return `SB-${Math.abs(hash).toString().padEnd(12, '0').slice(0, 12)}`;
  };

  // Legacy support: Requests marked as 'approved' but not yet in the official 'accounts' collection
  const approvedRequests = userRequests.filter(req => 
    req.category === 'account' && (req.status === 'approved' || req.status === 'clerk_approved' || req.status === 'manager_approved')
  );
  
  // Prepare real transaction history from user requests
  const transactionHistory = userRequests
    .filter(req => ['account', 'transfer', 'payment'].includes(req.category))
    .map(req => {
      let name = req.type;
      let amountVal = 0;
      let icon = '💳';
      let isNegative = true;

      if (req.category === 'account') {
        name = `Initial Deposit (${req.details?.accountType || 'Saving'})`;
        amountVal = parseFloat(req.details?.deposit || 0);
        icon = '🏦';
        isNegative = false;
      } else if (req.category === 'transfer') {
        name = `Transfer to ${req.details?.recipient || 'Unknown'}`;
        amountVal = parseFloat(req.details?.amount || 0);
        icon = '💸';
      } else if (req.category === 'payment') {
        name = req.details?.billCategory ? `${req.details.billCategory.charAt(0).toUpperCase() + req.details.billCategory.slice(1)} Bill` : 'Bill Payment';
        amountVal = parseFloat(req.details?.amount || 0);
        icon = '🧾';
      }

      return {
        id: req.id,
        name,
        date: formatAccountDate(req.createdAt),
        rawDate: req.createdAt, // Store raw date for sorting
        amount: `${isNegative ? '-' : '+'}₹${amountVal.toLocaleString()}`,
        amountVal,
        status: req.status === 'pending_clerk' ? 'Clerk Review' : req.status === 'clerk_approved' ? 'Manager Review' : req.status.charAt(0).toUpperCase() + req.status.slice(1),
        icon,
        isNegative
      };
    })
    .sort((a, b) => {
       const dateA = getDateObject(a.rawDate);
       const dateB = getDateObject(b.rawDate);
       return dateB.getTime() - dateA.getTime();
     });

  // Calculate real Inflow and Outflow
  const totalInflow = transactionHistory
    .filter(tx => !tx.isNegative && (tx.status === 'Approved' || tx.status === 'Manager Review' || tx.status === 'Clerk Review' || tx.status === 'Pending'))
    .reduce((sum, tx) => sum + tx.amountVal, 0);
  
  const totalOutflow = transactionHistory
    .filter(tx => tx.isNegative && (tx.status === 'Approved' || tx.status === 'Manager Review' || tx.status === 'Clerk Review' || tx.status === 'Pending'))
    .reduce((sum, tx) => sum + tx.amountVal, 0);

  // Calculate real total balance: Sum of all inflows minus sum of all outflows
  const totalBalance = totalInflow - totalOutflow;

  // Combine official accounts and approved requests for display in Accounts tab
  const allAccounts = [
    ...userAccounts.map(acc => ({
      id: acc.id,
      accountNumber: acc.accountNumber,
      accountType: acc.accountType,
      balance: acc.balance,
      createdAt: acc.createdAt,
      status: 'Active',
      isOfficial: true
    })),
    ...approvedRequests.map(req => ({
      id: req.id,
      accountNumber: getSimulatedAccNum(req.id),
      accountType: req.details?.accountType || 'Saving',
      balance: req.details?.deposit || 0,
      createdAt: req.createdAt,
      status: req.status === 'clerk_approved' || req.status === 'manager_approved' ? 'Approved' : 'Approved',
      isOfficial: false,
      details: req.details
    }))
  ];

  const [modal, setModal] = useState({
    isOpen: false,
    type: '',
    title: ''
  });

  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formStep, setFormStep] = useState(1);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const openModal = (type, title) => {
    setModal({ isOpen: true, type, title });
    setFormData({});
    setSubmitting(false);
    setFormError('');
    setFormStep(1);
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
    setSubmitting(false);
    setFormError('');
    setFormStep(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // VALIDATION: New Account Request
    if (modal.type === 'new-account') {
      // Step 1 Validation: Account Selection
      if (formStep === 1) {
        if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
          setFormError('Please enter a valid 10-digit mobile number.');
          return;
        }
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setFormError('Please enter a valid email address.');
          return;
        }
        const deposit = parseFloat(formData.deposit);
        if (isNaN(deposit) || deposit < 500) {
          setFormError('Initial deposit must be at least ₹500.');
          return;
        }
        if (formData.accountType === 'current' && (!formData.gst || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gst.toUpperCase()))) {
          setFormError('Please enter a valid 15-digit GSTIN for Current Account.');
          return;
        }
        setFormStep(2);
        return;
      }

      // Step 2 Validation: Personal & Identity
      if (formStep === 2) {
        // Occupation and Annual Income are only required for Current Accounts
        if (formData.accountType === 'current') {
          if (!formData.occupation || !formData.annualIncome) {
            setFormError('Please fill in all identity details.');
            return;
          }
        }
        
        if (!formData.aadhar || !/^\d{12}$/.test(formData.aadhar)) {
          setFormError('Please enter a valid 12-digit Aadhaar number.');
          return;
        }
        if (!formData.pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) {
          setFormError('Please enter a valid PAN card number.');
          return;
        }
        setFormStep(3);
        return;
      }

      // Step 3 Validation: Nominee & Finalize
      if (formStep === 3) {
        if (!formData.nomineeName || !formData.nomineeRelation) {
          setFormError('Nominee details are mandatory for banking requests.');
          return;
        }
      }
    }

    setSubmitting(true);
    console.log(`[USER-DASHBOARD] Submitting ${modal.type}...`, formData);
    
    const userName = `${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim();
    
    // Categorize based on modal type
    let category = 'service';
    if (modal.type === 'new-account') category = 'account';
    if (modal.type === 'transfer') category = 'transfer';
    if (modal.type === 'bill-pay') category = 'payment';

    addRequest({
      userId: userProfile?.uid, // Added userId for better tracking
      userName,
      type: modal.title,
      category,
      details: formData,
      status: category === 'account' ? 'pending_clerk' : 'pending' // Account requests follow strict workflow
    }).then(() => {
      showToast(`${modal.title} request submitted successfully!`);
      closeModal();
    }).finally(() => {
      setSubmitting(false);
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            {/* Global Action Grid - Based on Use Case Diagram */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 mb-12">
              {/* Use Case: Request New Account */}
              <button onClick={() => openModal('new-account', 'Request New Account')} className="group relative bg-blue-600 rounded-[32px] p-6 xl:p-8 text-white shadow-2xl shadow-blue-200 overflow-hidden hover:-translate-y-2 transition-all duration-500">
                <div className="absolute top-0 right-0 p-10 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 xl:w-16 xl:h-16 bg-white/20 backdrop-blur-md rounded-2xl xl:rounded-3xl flex items-center justify-center mb-6 ring-1 ring-white/30">
                    <UserPlus className="w-6 h-6 xl:w-8 xl:h-8" />
                  </div>
                  <p className="text-base xl:text-lg font-black tracking-tight mb-1">New Account</p>
                  <p className="text-blue-100 text-[10px] xl:text-sm font-medium">Saving, Current, FD</p>
                </div>
              </button>

              {/* Use Case: Fund Transfer */}
              <button onClick={() => openModal('transfer', 'Fund Transfer')} className="group relative bg-white rounded-[32px] p-6 xl:p-8 text-slate-900 shadow-xl border border-slate-100 overflow-hidden hover:-translate-y-2 transition-all duration-500">
                <div className="relative z-10">
                  <div className="w-12 h-12 xl:w-16 xl:h-16 bg-slate-50 rounded-2xl xl:rounded-3xl flex items-center justify-center mb-6 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    <Send className="w-6 h-6 xl:w-8 xl:h-8 text-blue-600" />
                  </div>
                  <p className="text-base xl:text-lg font-black tracking-tight mb-1">Fund Transfer</p>
                  <p className="text-slate-500 text-[10px] xl:text-sm font-medium">Debit or Credit</p>
                </div>
              </button>

              {/* Use Case: Pay Bills / Recharge */}
              <button onClick={() => openModal('bill-pay', 'Pay Bills / Recharge')} className="group relative bg-white rounded-[32px] p-6 xl:p-8 text-slate-900 shadow-xl border border-slate-100 overflow-hidden hover:-translate-y-2 transition-all duration-500">
                <div className="relative z-10">
                  <div className="w-12 h-12 xl:w-16 xl:h-16 bg-slate-50 rounded-2xl xl:rounded-3xl flex items-center justify-center mb-6 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    <Zap className="w-6 h-6 xl:w-8 xl:h-8 text-blue-600" />
                  </div>
                  <p className="text-base xl:text-lg font-black tracking-tight mb-1">Bills & Recharge</p>
                  <p className="text-slate-500 text-[10px] xl:text-sm font-medium">Utility, Mobile, EMI</p>
                </div>
              </button>

              {/* Use Case: Request Services */}
              <button onClick={() => openModal('request-services', 'Request Services')} className="group relative bg-slate-900 rounded-[32px] p-6 xl:p-8 text-white shadow-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500">
                <div className="absolute top-0 right-0 p-10 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 xl:w-16 xl:h-16 bg-white/10 backdrop-blur-md rounded-2xl xl:rounded-3xl flex items-center justify-center mb-6 ring-1 ring-white/20">
                    <Briefcase className="w-6 h-6 xl:w-8 xl:h-8 text-blue-400" />
                  </div>
                  <p className="text-base xl:text-lg font-black tracking-tight mb-1">Services</p>
                  <p className="text-slate-400 text-[10px] xl:text-sm font-medium">Cards, Loans, KYC</p>
                </div>
              </button>
            </section>

            {/* Dynamic Account Stats & Assets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 mb-12">
              {/* Main Wallet Card - Use Case: Check Balance */}
              <div className="lg:col-span-2 space-y-6 xl:space-y-8">
                <div className="bg-white rounded-[32px] xl:rounded-[48px] p-8 xl:p-12 shadow-xl border border-slate-50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-32 bg-blue-600/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                  
                  <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8 xl:gap-10">
                    <div>
                      <div className="flex items-center gap-3 mb-4 xl:mb-6">
                        <div className="w-8 h-8 xl:w-10 xl:h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <Wallet className="w-4 h-4 xl:w-5 xl:h-5" />
                        </div>
                        <span className="text-[10px] xl:text-sm font-black text-slate-400 uppercase tracking-widest">Global Account Balance</span>
                      </div>
                      <div className="flex items-end gap-4">
                        <h2 className="text-5xl xl:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                          {showBalance ? `₹${totalBalance.toLocaleString()}` : '••••••'}
                        </h2>
                        <button 
                          onClick={() => setShowBalance(!showBalance)}
                          className="mb-1 xl:mb-2 p-2 xl:p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                        >
                          {showBalance ? <EyeOff className="w-5 h-5 xl:w-6 xl:h-6" /> : <Eye className="w-5 h-5 xl:w-6 xl:h-6" />}
                        </button>
                      </div>
                      <div className="mt-6 xl:mt-8 flex items-center gap-4">
                        <span className="bg-green-100 text-green-700 px-3 xl:px-4 py-1.5 xl:py-2 rounded-full text-[10px] xl:text-xs font-black uppercase tracking-widest">+12.4% THIS MONTH</span>
                        <span className="text-slate-400 text-xs xl:text-sm font-medium italic">Updated 2 mins ago</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 xl:gap-4 min-w-[180px] xl:min-w-[200px]">
                      <div className="p-4 xl:p-6 bg-slate-50 rounded-2xl xl:rounded-[32px] border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 xl:w-12 xl:h-12 bg-white rounded-xl xl:rounded-2xl flex items-center justify-center text-green-500 shadow-sm">
                          <ArrowUpRight className="w-5 h-5 xl:w-6 xl:h-6" />
                        </div>
                        <div>
                          <p className="text-[8px] xl:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inflow</p>
                          <p className="text-base xl:text-lg font-black text-slate-900 leading-none mt-1">₹{totalInflow.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="p-4 xl:p-6 bg-slate-50 rounded-2xl xl:rounded-[32px] border border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 xl:w-12 xl:h-12 bg-white rounded-xl xl:rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                          <ArrowDownLeft className="w-5 h-5 xl:w-6 xl:h-6" />
                        </div>
                        <div>
                          <p className="text-[8px] xl:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Outflow</p>
                          <p className="text-base xl:text-lg font-black text-slate-900 leading-none mt-1">₹{totalOutflow.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions Table - Use Case: Transaction History */}
                <div className="bg-white rounded-[32px] xl:rounded-[40px] shadow-xl border border-slate-50 overflow-hidden">
                  <div className="p-6 xl:p-8 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl xl:text-2xl font-black text-slate-900 tracking-tight">Transaction History</h3>
                      <p className="text-xs xl:text-sm font-medium text-slate-500 mt-1">Detailed history across all protocols</p>
                    </div>
                    <button onClick={() => setActiveTab('history')} className="px-5 xl:px-6 py-2.5 xl:py-3 bg-slate-50 hover:bg-slate-100 rounded-xl xl:rounded-2xl text-[10px] xl:text-xs font-black text-slate-900 tracking-widest transition-all">VIEW ALL</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody>
                        {transactionHistory.length > 0 ? (
                          transactionHistory.slice(0, 4).map((tx, idx) => (
                            <tr key={tx.id || idx} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                              <td className="py-4 xl:py-5 px-8 xl:px-10">
                                <div className="flex items-center gap-4 xl:gap-5">
                                  <div className="w-12 h-12 xl:w-14 xl:h-14 bg-slate-100 rounded-xl xl:rounded-2xl flex items-center justify-center text-xl xl:text-2xl group-hover:scale-110 transition-transform">{tx.icon}</div>
                                  <div>
                                    <p className="text-sm xl:text-base font-black text-slate-900">{tx.name}</p>
                                    <p className="text-[10px] xl:text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{tx.date}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 xl:py-5 px-8 xl:px-10 text-right">
                                <p className={`text-base xl:text-lg font-black ${!tx.isNegative ? 'text-green-600' : 'text-slate-900'}`}>{tx.amount}</p>
                                <p className="text-[8px] xl:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{tx.status}</p>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="py-16 xl:py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
                              No transactions yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Cards & Promotions */}
              <div className="space-y-6 xl:space-y-8">
                {/* Premium Card Display */}
                <div className="relative group perspective-1000 cursor-pointer" onClick={() => setActiveTab('cards')}>
                  <div className="absolute inset-0 bg-blue-600/20 blur-[60px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
                  <div className="relative bg-slate-900 aspect-[1.6/1] rounded-[32px] xl:rounded-[40px] p-8 xl:p-10 text-white overflow-hidden shadow-2xl transition-all duration-700 hover:rotate-y-12 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-blue-600/40 to-transparent rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    
                    <div className="relative h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Infinite Wealth</p>
                          <h4 className="text-xl font-black italic tracking-tighter">SmartBank Black</h4>
                        </div>
                        <div className="w-12 h-12 xl:w-14 xl:h-14 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-blue-600 transition-colors">
                          <Landmark size={24} className="text-white" />
                        </div>
                      </div>

                      <div className="space-y-6 xl:space-y-8">
                        <div className="flex gap-4 xl:gap-6">
                          <span className="text-xl xl:text-2xl font-black tracking-[0.2em]">••••</span>
                          <span className="text-xl xl:text-2xl font-black tracking-[0.2em]">••••</span>
                          <span className="text-xl xl:text-2xl font-black tracking-[0.2em]">••••</span>
                          <span className="text-xl xl:text-2xl font-black tracking-[0.2em]">8842</span>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[8px] xl:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Card Holder</p>
                            <p className="text-sm xl:text-base font-black tracking-tight uppercase">{userProfile?.firstName} {userProfile?.lastName}</p>
                          </div>
                          <div className="flex -space-x-3 xl:-space-x-4">
                            <div className="w-10 h-10 xl:w-12 xl:h-12 bg-rose-500/80 rounded-full backdrop-blur-md" />
                            <div className="w-10 h-10 xl:w-12 xl:h-12 bg-amber-500/80 rounded-full backdrop-blur-md" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promotions / Ad Unit */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-[32px] xl:rounded-[40px] p-8 xl:p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 xl:w-14 xl:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/30 group-hover:scale-110 transition-transform">
                      <Zap size={28} />
                    </div>
                    <h4 className="text-xl xl:text-2xl font-black leading-tight mb-3">Earn up to 7.5% APY on Savings</h4>
                    <p className="text-blue-100 text-sm font-medium mb-6">Open a High-Yield Savings Account today and watch your money grow faster.</p>
                    <button className="w-full py-4 bg-white text-blue-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl">Apply Now</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case 'accounts':
        return (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Your Accounts</h2>
                <p className="text-slate-500 font-medium text-lg mt-2">Manage your verified bank accounts and assets.</p>
              </div>
              <button onClick={() => openModal('new-account', 'Request New Account')} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-3">
                <PlusCircle size={20} /> Open New Account
              </button>
            </div>

            {allAccounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {allAccounts.map((acc, idx) => (
                  <div key={acc.id} className="group bg-white rounded-[40px] p-10 shadow-xl border border-slate-100 hover:border-blue-200 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 bg-blue-600/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-10">
                        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                          <Landmark size={32} />
                        </div>
                        <span className={`px-4 py-2 ${acc.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'} rounded-full text-[10px] font-black uppercase tracking-widest border`}>
                          {acc.status}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Number</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">
                          {acc.accountNumber || `SB-${acc.id.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`}
                        </p>
                      </div>

                      <div className="mt-8 grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                          <p className="font-bold text-slate-900 uppercase">{acc.accountType || 'Saving'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</p>
                          <p className="text-xl font-black text-blue-600">₹{parseFloat(acc.balance || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Opened: {formatAccountDate(acc.createdAt)}</p>
                        <button className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:gap-4 transition-all">
                          Details <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-slate-200">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                  <FileText size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No Active Accounts Found</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-10">Once your account request is approved by the bank clerk and manager, it will appear here instantly.</p>
                <button onClick={() => openModal('new-account', 'Request New Account')} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all">
                  Request New Account
                </button>
              </div>
            )}

            {/* Pending & Rejected Requests Section */}
            {userRequests.some(r => ['pending', 'rejected', 'pending_clerk', 'clerk_approved'].includes(r.status)) && (
              <div className="mt-16">
                <div className="flex items-center gap-4 px-2 mb-8">
                  <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Application Status</h3>
                </div>
                <div className="space-y-4">
                  {userRequests.filter(r => r.status === 'pending' || r.status === 'rejected' || r.status === 'pending_clerk' || r.status === 'clerk_approved').map(req => (
                    <div key={req.id} className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col gap-4 shadow-sm hover:border-blue-200 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className={`w-12 h-12 ${req.status === 'rejected' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'} rounded-2xl flex items-center justify-center`}>
                            {req.status === 'rejected' ? <X size={24} /> : <Clock size={24} />}
                          </div>
                          <div>
                            <p className="font-black text-slate-900">{req.type} ({req.details?.accountType || 'Saving'})</p>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Submitted: {formatAccountDate(req.createdAt)}</p>
                          </div>
                        </div>
                        <span className={`px-4 py-2 ${
                          req.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                        } rounded-full text-[10px] font-black uppercase tracking-widest`}>
                          {req.status === 'rejected' ? 'Rejected' : 
                           req.status === 'clerk_approved' ? 'Manager Review' : 'Awaiting Review'}
                        </span>
                      </div>
                      
                      {/* Clerk Remarks if available */}
                      {req.clerkRemark && (
                        <div className="p-4 bg-rose-50/50 rounded-2xl border-l-4 border-rose-500">
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Bank Message:</p>
                          <p className="text-sm font-bold text-slate-700 italic">"{req.clerkRemark}"</p>
                        </div>
                      )}

                      {/* Manager Remarks if available */}
                      {req.managerRemark && (
                        <div className="p-4 bg-rose-50/50 rounded-2xl border-l-4 border-rose-500">
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Manager Note:</p>
                          <p className="text-sm font-bold text-slate-700 italic">"{req.managerRemark}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'cards':
        return (
          <div className="space-y-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">My Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[40px] p-10 h-[280px] shadow-2xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 p-32 bg-blue-600/20 rounded-full blur-[80px] -mr-24 -mt-24"></div>
                <div className="relative z-10 flex justify-between items-start text-white">
                  <span className="text-[10px] font-black tracking-[0.3em] uppercase">SmartBank Black</span>
                  <div className="w-12 h-8 bg-yellow-500/20 border border-yellow-500/30 rounded" />
                </div>
                <div className="relative z-10 text-white">
                  <p className="text-xl font-mono tracking-[0.3em] mb-6">•••• •••• •••• 8842</p>
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-bold uppercase tracking-widest">{userProfile?.firstName} {userProfile?.lastName}</p>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-8 opacity-80" alt="Mastercard" />
                  </div>
                </div>
              </div>
              <button onClick={() => openModal('request-services', 'Request New Card')} className="border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50 transition-all p-10">
                <PlusCircle size={40} className="text-slate-300" />
                <p className="font-black text-slate-400 uppercase tracking-widest">Add New Card</p>
              </button>
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter text-left">Payment Center</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <button onClick={() => openModal('bill-pay', 'Utility Bill Payment')} className="p-10 bg-white rounded-[40px] shadow-xl border border-slate-100 flex flex-col items-center gap-6 hover:-translate-y-2 transition-all">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600"><Zap size={40} /></div>
                <p className="font-black text-slate-900 uppercase tracking-widest">Utility Bills</p>
              </button>
              <button onClick={() => openModal('transfer', 'Send Money')} className="p-10 bg-white rounded-[40px] shadow-xl border border-slate-100 flex flex-col items-center gap-6 hover:-translate-y-2 transition-all">
                <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-600"><Send size={40} /></div>
                <p className="font-black text-slate-900 uppercase tracking-widest">Transfers</p>
              </button>
              <button onClick={() => openModal('bill-pay', 'Mobile Recharge')} className="p-10 bg-white rounded-[40px] shadow-xl border border-slate-100 flex flex-col items-center gap-6 hover:-translate-y-2 transition-all">
                <div className="w-20 h-20 bg-purple-50 rounded-3xl flex items-center justify-center text-purple-600"><Smartphone size={40} /></div>
                <p className="font-black text-slate-900 uppercase tracking-widest">Recharge</p>
              </button>
            </div>
            <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50"><h3 className="text-xl font-black text-slate-900">Recent Payments</h3></div>
              <div className="p-10 text-center text-slate-400 font-medium">No recent payments found.</div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Financial Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-100">
                <h3 className="text-xl font-black text-slate-900 mb-8">Spending Analysis</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Shopping', amount: '₹45,000', color: 'bg-blue-600', width: '65%' },
                    { label: 'Food & Dining', amount: '₹12,400', color: 'bg-emerald-500', width: '25%' },
                    { label: 'Utilities', amount: '₹8,200', color: 'bg-amber-500', width: '15%' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-2">
                        <span className="font-bold text-slate-900">{item.label}</span>
                        <span className="font-black text-slate-900">{item.amount}</span>
                      </div>
                      <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: item.width }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl">
                <h3 className="text-xl font-black mb-8">Wealth Growth</h3>
                <div className="h-48 flex items-end gap-2">
                  {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 bg-blue-500 rounded-t-lg transition-all hover:bg-blue-400 cursor-pointer" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="mt-6 flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Transaction History</h2>
                <p className="text-slate-500 font-medium text-lg mt-2">Complete record of all your financial activities.</p>
              </div>
              <button onClick={() => setActiveTab('dashboard')} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all flex items-center gap-3">
                <LayoutIcon size={20} /> Back to Overview
              </button>
            </div>

            <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Transaction Details</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactionHistory.length > 0 ? (
                      transactionHistory.map((tx, idx) => (
                        <tr key={tx.id || idx} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-6 px-10">
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm">{tx.icon}</div>
                              <div>
                                <p className="text-base font-black text-slate-900">{tx.name}</p>
                                <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">{tx.date}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-10">
                            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              tx.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                              tx.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-6 px-10 text-right">
                            <p className={`text-xl font-black ${!tx.isNegative ? 'text-green-600' : 'text-slate-900'}`}>{tx.amount}</p>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest italic">
                          No transaction history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-[40px] p-20 text-center border border-slate-100 shadow-sm">
            <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter">{activeTab}</h2>
            <p className="text-slate-500 font-medium text-lg">This module is currently under secure maintenance.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top duration-500">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-slate-800 backdrop-blur-xl bg-opacity-90">
            <div className="bg-blue-500 rounded-full p-1">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <span className="font-bold tracking-tight">{toast}</span>
          </div>
        </div>
      )}

      {/* Modern Sidebar Navigation */}
      <aside className="fixed left-0 top-0 bottom-0 w-80 bg-slate-900 text-white border-r border-slate-800 z-50 p-8 hidden xl:flex flex-col">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 overflow-hidden border border-slate-700">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase">Smart<span className="text-blue-600">Bank</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutIcon, label: 'Overview' },
            { id: 'accounts', icon: Landmark, label: 'Accounts' },
            { id: 'cards', icon: CardIcon, label: 'My Cards' },
            { id: 'payments', icon: Receipt, label: 'Payments' },
            { id: 'analytics', icon: PieChart, label: 'Insights' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform text-slate-400 group-hover:text-white'} />
              <span className="font-bold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-800 space-y-4">
          <div className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700 group hover:border-blue-500/50 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <span className="font-bold text-sm text-white">Premium Plan</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Unlock advanced analytics and higher limits with Pro.</p>
            <button className="w-full py-3 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 transition-all">UPGRADE NOW</button>
          </div>

          <button onClick={logout} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all group">
            <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-bold tracking-tight text-sm uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 xl:ml-80 p-6 sm:p-10 lg:p-12 xl:p-14 max-w-[1800px] mx-auto w-full">
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2 text-blue-600">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Personal Banking Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Welcome back, <span className="text-blue-600">{userProfile?.firstName || 'User'}</span>
            </h1>
            <p className="mt-2 text-slate-500 font-medium text-base">Your financial ecosystem is performing optimally today.</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-100 hover:shadow-lg transition-all relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="flex items-center gap-3 bg-white border border-slate-100 p-1.5 pr-5 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                <UserIcon size={20} />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Tier Status</p>
                <p className="text-xs font-bold text-slate-900 mt-1">Elite Customer</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Content */}
        {renderTabContent()}
      </main>

      {/* Reusable Action Modals - Based on Use Case Diagram */}
      <Modal 
        isOpen={modal.isOpen} 
        onClose={closeModal} 
        title={modal.title}
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {formError && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
              {formError}
            </div>
          )}

          {/* Multi-step Logic for New Account */}
          {modal.type === 'new-account' ? (
            <div className="space-y-8">
              {/* Step Indicator */}
              <div className="flex items-center justify-between px-4 mb-10">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${formStep >= step ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                      {step}
                    </div>
                    {step < 3 && <div className={`w-12 h-1 ${formStep > step ? 'bg-blue-600' : 'bg-slate-100'} rounded-full`} />}
                  </div>
                ))}
              </div>

              {/* STEP 1: Account Selection */}
              {formStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label">Account Type</label>
                      <select name="accountType" onChange={handleInputChange} value={formData.accountType || ''} className="input" required>
                        <option value="">Select type</option>
                        <option value="saving">Saving Account</option>
                        <option value="current">Current Account</option>
                        <option value="fd">Fixed Deposit</option>
                        <option value="joint">Joint Account</option>
                      </select>
                    </div>
                    <Input label="Initial Deposit (₹)" name="deposit" type="number" placeholder="Min. ₹500" onChange={handleInputChange} value={formData.deposit || ''} required />
                    
                    <Input label="Mobile Number" name="mobile" placeholder="10-digit number" onChange={handleInputChange} value={formData.mobile || ''} required />
                    <Input label="Email Address" name="email" type="email" placeholder="example@bank.com" onChange={handleInputChange} value={formData.email || ''} required />
                    
                    {/* Conditional Fields */}
                    {formData.accountType === 'current' && (
                      <Input label="GST Number" name="gst" placeholder="15-digit GSTIN" onChange={handleInputChange} value={formData.gst || ''} required />
                    )}
                    {formData.accountType === 'joint' && (
                      <Input label="Secondary Holder Name" name="secondaryHolder" placeholder="Full name of joint holder" onChange={handleInputChange} value={formData.secondaryHolder || ''} required />
                    )}
                    {formData.accountType === 'fd' && (
                      <div className="space-y-2">
                        <label className="label">Tenure (Years)</label>
                        <select name="tenure" onChange={handleInputChange} value={formData.tenure || ''} className="input" required>
                          <option value="1">1 Year</option>
                          <option value="3">3 Years</option>
                          <option value="5">5 Years</option>
                          <option value="10">10 Years</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-6">
                    <Button type="button" onClick={() => setFormStep(2)} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs">
                      Next Step <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: Personal & Identity */}
              {formStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Conditional: Only for Current Accounts */}
                    {formData.accountType === 'current' && (
                      <>
                        <Input label="Occupation" name="occupation" placeholder="e.g. Software Engineer" onChange={handleInputChange} value={formData.occupation || ''} required />
                        <div className="space-y-2">
                          <label className="label">Annual Income (₹)</label>
                          <select name="annualIncome" onChange={handleInputChange} value={formData.annualIncome || ''} className="input" required>
                            <option value="">Select range</option>
                            <option value="0-5L">0 - 5 Lakhs</option>
                            <option value="5-10L">5 - 10 Lakhs</option>
                            <option value="10-25L">10 - 25 Lakhs</option>
                            <option value="25L+">Above 25 Lakhs</option>
                          </select>
                        </div>
                      </>
                    )}
                    
                    <Input label="Aadhaar Number" name="aadhar" placeholder="12-digit number" onChange={handleInputChange} value={formData.aadhar || ''} required />
                    <Input label="PAN Card Number" name="pan" placeholder="ABCDE1234F" onChange={handleInputChange} value={formData.pan || ''} required />
                  </div>
                  <div className="flex justify-between pt-6">
                    <Button type="button" variant="secondary" onClick={() => setFormStep(1)} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200">
                      Back
                    </Button>
                    <Button type="button" onClick={() => setFormStep(3)} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs">
                      Next Step <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Nominee & Finalize */}
              {formStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Nominee Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Nominee Name" name="nomineeName" placeholder="Enter name" onChange={handleInputChange} value={formData.nomineeName || ''} required />
                      <div className="space-y-2">
                        <label className="label">Relationship</label>
                        <select name="nomineeRelation" onChange={handleInputChange} value={formData.nomineeRelation || ''} className="input" required>
                          <option value="">Select relationship</option>
                          <option value="father">Father</option>
                          <option value="mother">Mother</option>
                          <option value="spouse">Spouse</option>
                          <option value="child">Child</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-blue-900 leading-tight">Digital KYC Verification</p>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Ready for Clerk & Manager Review</p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button type="button" variant="secondary" onClick={() => setFormStep(2)} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200">
                      Back
                    </Button>
                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="h-14 px-10 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest"
                    >
                      {submitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Final Submit <FileCheck size={18} /></>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Fallback for other request types (Transfer, Bills, etc) */
            <>
              {/* USE CASE: Fund transfer */}
              {modal.type === 'transfer' && (
                <>
                  <div className="space-y-2">
                    <label className="label">Transfer Type</label>
                    <select name="transferType" onChange={handleInputChange} className="input" required>
                      <option value="debit">Debit Transfer</option>
                      <option value="credit">Credit Transfer</option>
                    </select>
                  </div>
                  <Input label="Recipient Account" name="recipient" placeholder="Enter account number" onChange={handleInputChange} required />
                  <Input label="Amount (₹)" name="amount" type="number" placeholder="0.00" onChange={handleInputChange} required />
                </>
              )}
              
              {/* USE CASE: Pay bills / Recharge */}
              {modal.type === 'bill-pay' && (
                <>
                  <div className="space-y-2">
                    <label className="label">Category</label>
                    <select name="billCategory" onChange={handleInputChange} className="input" required>
                      <option value="">Select category</option>
                      <option value="electricity">Electricity Bill</option>
                      <option value="credit-card">Credit Card Bill Payment</option>
                      <option value="loan-emi">Loan EMI Payment</option>
                      <option value="mobile-recharge">Mobile Recharge</option>
                    </select>
                  </div>
                  <Input label="Reference Number" name="refNum" placeholder="Consumer ID / Card Num / Mobile" onChange={handleInputChange} required />
                  <Input label="Amount (₹)" name="amount" type="number" placeholder="0.00" onChange={handleInputChange} required />
                </>
              )}

              {/* USE CASE: Request services */}
              {modal.type === 'request-services' && (
                <>
                  <div className="space-y-2">
                    <label className="label">Service Type</label>
                    <select name="serviceType" onChange={handleInputChange} className="input" required>
                      <option value="">Choose service</option>
                      <option value="credit-card">Request Credit Card</option>
                      <option value="debit-card">Request Debit Card</option>
                      <option value="loan">Personal Loan Request</option>
                      <option value="kyc">KYC Document Update</option>
                    </select>
                  </div>
                  <Input label="Additional Details" name="details" placeholder="Explain your request..." onChange={handleInputChange} />
                </>
              )}

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white text-lg font-black rounded-[24px] shadow-xl shadow-blue-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit {modal.title} Request <ArrowRight size={22} />
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">Securely processed by SmartBank Core Engine</p>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
}
