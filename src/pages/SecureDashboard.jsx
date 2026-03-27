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
  const { userProfile, logout, addRequest, requests } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Filter requests for current user
  const userRequests = requests.filter(req => req.userId === userProfile?.uid || req.userName === `${userProfile?.firstName} ${userProfile?.lastName}`);
  const approvedAccounts = userRequests.filter(req => req.category === 'account' && req.status === 'approved');
  
  const [modal, setModal] = useState({
    isOpen: false,
    type: '',
    title: ''
  });

  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const openModal = (type, title) => {
    setModal({ isOpen: true, type, title });
    setFormData({});
    setSubmitting(false);
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
    setSubmitting(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    console.log(`[USER-DASHBOARD] Submitting ${modal.type}...`, formData);
    
    const userName = `${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim();
    
    // Categorize based on modal type
    let category = 'service';
    if (modal.type === 'new-account') category = 'account';
    if (modal.type === 'transfer') category = 'transfer';
    if (modal.type === 'bill-pay') category = 'payment';

    addRequest({
      userName,
      type: modal.title,
      category,
      details: formData
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
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {/* Use Case: Request New Account */}
              <button onClick={() => openModal('new-account', 'Request New Account')} className="group relative bg-blue-600 rounded-[40px] p-8 text-white shadow-2xl shadow-blue-200 overflow-hidden hover:-translate-y-2 transition-all duration-500">
                <div className="absolute top-0 right-0 p-12 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 ring-1 ring-white/30">
                    <UserPlus size={32} />
                  </div>
                  <p className="text-lg font-black tracking-tight mb-2">New Account</p>
                  <p className="text-blue-100 text-sm font-medium">Saving, Current, FD, Joint</p>
                </div>
              </button>

              {/* Use Case: Fund Transfer */}
              <button onClick={() => openModal('transfer', 'Fund Transfer')} className="group relative bg-white rounded-[40px] p-8 text-slate-900 shadow-xl border border-slate-100 overflow-hidden hover:-translate-y-2 transition-all duration-500">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    <Send size={32} className="text-blue-600" />
                  </div>
                  <p className="text-lg font-black tracking-tight mb-2">Fund Transfer</p>
                  <p className="text-slate-500 text-sm font-medium">Debit or Credit Transfer</p>
                </div>
              </button>

              {/* Use Case: Pay Bills / Recharge */}
              <button onClick={() => openModal('bill-pay', 'Pay Bills / Recharge')} className="group relative bg-white rounded-[40px] p-8 text-slate-900 shadow-xl border border-slate-100 overflow-hidden hover:-translate-y-2 transition-all duration-500">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-8 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                    <Zap size={32} className="text-blue-600" />
                  </div>
                  <p className="text-lg font-black tracking-tight mb-2">Bills & Recharge</p>
                  <p className="text-slate-500 text-sm font-medium">Utility, Mobile, EMI</p>
                </div>
              </button>

              {/* Use Case: Request Services */}
              <button onClick={() => openModal('request-services', 'Request Services')} className="group relative bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl overflow-hidden hover:-translate-y-2 transition-all duration-500">
                <div className="absolute top-0 right-0 p-12 bg-blue-500/20 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 ring-1 ring-white/20">
                    <Briefcase size={32} className="text-blue-400" />
                  </div>
                  <p className="text-lg font-black tracking-tight mb-2">Services</p>
                  <p className="text-slate-400 text-sm font-medium">Cards, Loans, KYC</p>
                </div>
              </button>
            </section>

            {/* Dynamic Account Stats & Assets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
              {/* Main Wallet Card - Use Case: Check Balance */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[48px] p-10 sm:p-14 shadow-xl border border-slate-50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-32 bg-blue-600/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-10">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          <Wallet size={20} />
                        </div>
                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Global Account Balance</span>
                      </div>
                      <div className="flex items-end gap-4">
                        <h2 className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                          {showBalance ? '₹12,84,250' : '••••••'}
                        </h2>
                        <button 
                          onClick={() => setShowBalance(!showBalance)}
                          className="mb-2 p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                        >
                          {showBalance ? <EyeOff size={24} /> : <Eye size={24} />}
                        </button>
                      </div>
                      <div className="mt-8 flex items-center gap-4">
                        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">+12.4% THIS MONTH</span>
                        <span className="text-slate-400 text-sm font-medium italic">Updated 2 mins ago</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 min-w-[200px]">
                      <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-500 shadow-sm">
                          <ArrowUpRight size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inflow</p>
                          <p className="text-lg font-black text-slate-900 leading-none mt-1">₹4,20,000</p>
                        </div>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                          <ArrowDownLeft size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Outflow</p>
                          <p className="text-lg font-black text-slate-900 leading-none mt-1">₹1,15,500</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions Table - Use Case: Transaction History */}
                <div className="bg-white rounded-[40px] shadow-xl border border-slate-50 overflow-hidden">
                  <div className="p-8 sm:p-10 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Transaction History</h3>
                      <p className="text-sm font-medium text-slate-500 mt-1">Detailed history across all protocols</p>
                    </div>
                    <button onClick={() => setActiveTab('payments')} className="px-6 py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-black text-slate-900 tracking-widest transition-all">VIEW ALL</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody>
                        {[
                          { name: 'Apple Store', date: 'Oct 24, 2023', amount: '-₹1,49,900', status: 'Completed', icon: '💻' },
                          { name: 'Freelance Payout', date: 'Oct 22, 2023', amount: '+₹85,000', status: 'Completed', icon: '💰' },
                          { name: 'Starbucks Coffee', date: 'Oct 21, 2023', amount: '-₹450', status: 'Pending', icon: '☕' },
                          { name: 'Adobe Subscription', date: 'Oct 20, 2023', amount: '-₹4,200', status: 'Completed', icon: '🎨' },
                        ].map((tx, idx) => (
                          <tr key={idx} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                            <td className="py-6 px-10">
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{tx.icon}</div>
                                <div>
                                  <p className="font-black text-slate-900">{tx.name}</p>
                                  <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{tx.date}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-6 px-10 text-right">
                              <p className={`text-lg font-black ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-slate-900'}`}>{tx.amount}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{tx.status}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Cards & Promotions */}
              <div className="space-y-10">
                {/* Premium Card Display */}
                <div className="relative group perspective-1000 cursor-pointer" onClick={() => setActiveTab('cards')}>
                  <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[40px] p-10 h-[280px] shadow-2xl flex flex-col justify-between overflow-hidden transform group-hover:rotate-y-12 transition-all duration-700 ring-1 ring-white/10">
                    <div className="absolute top-0 right-0 p-32 bg-blue-600/20 rounded-full blur-[80px] -mr-24 -mt-24"></div>
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">Infinite Wealth</p>
                        <p className="text-lg font-bold text-white tracking-tight italic">SmartBank Black</p>
                      </div>
                      <div className="w-14 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center border border-white/20">
                        <div className="w-8 h-6 border border-white/30 rounded flex items-center justify-center">
                          <div className="w-4 h-px bg-white/40"></div>
                        </div>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-2xl font-mono text-white tracking-[0.3em] mb-4">•••• •••• •••• 8842</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Card Holder</p>
                          <p className="text-sm font-bold text-white uppercase tracking-wider">{userProfile?.firstName} {userProfile?.lastName}</p>
                        </div>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-10 opacity-80" alt="Mastercard" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Savings Goal */}
                <div className="bg-white rounded-[40px] p-10 shadow-xl border border-slate-50">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Savings Goal</h4>
                    <PlusCircle className="text-blue-600 cursor-pointer" size={24} onClick={() => showToast("Saving goals are being initialized... 🏦")} />
                  </div>
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <Landmark size={28} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-2">
                        <p className="text-sm font-bold text-slate-900">New Home 2025</p>
                        <p className="text-xs font-black text-blue-600">65%</p>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full w-[65%] shadow-sm shadow-blue-200"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed italic">You are only ₹4,50,000 away from your target. Keep it up!</p>
                </div>

                {/* Support Widget */}
                <div className="bg-blue-600 rounded-[40px] p-10 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-20 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative z-10">
                    <h4 className="text-xl font-black mb-4">Need Assistance?</h4>
                    <p className="text-blue-100 text-sm font-medium leading-relaxed mb-8">Our priority concierge is available 24/7 for Elite members.</p>
                    <button onClick={() => showToast("Connecting to elite support... 🎧")} className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">Chat with Concierge</button>
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

            {approvedAccounts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {approvedAccounts.map((acc, idx) => (
                  <div key={acc.id} className="group bg-white rounded-[40px] p-10 shadow-xl border border-slate-100 hover:border-blue-200 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 bg-blue-600/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-10">
                        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                          <Landmark size={32} />
                        </div>
                        <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">Active</span>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Number</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">
                          SB-{acc.id.substring(0, 4).toUpperCase()}-{Math.floor(1000 + Math.random() * 9000)}-{Math.floor(1000 + Math.random() * 9000)}
                        </p>
                      </div>

                      <div className="mt-8 grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                          <p className="font-bold text-slate-900 uppercase">{acc.details?.accountType || 'Saving'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</p>
                          <p className="text-xl font-black text-blue-600">₹{parseFloat(acc.details?.deposit || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Opened: {new Date(acc.createdAt).toLocaleDateString()}</p>
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

            {/* Pending Requests Section */}
            {userRequests.some(r => r.status === 'pending') && (
              <div className="mt-16">
                <div className="flex items-center gap-4 px-2 mb-8">
                  <div className="w-1.5 h-8 bg-amber-500 rounded-full" />
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Pending Verification</h3>
                </div>
                <div className="space-y-4">
                  {userRequests.filter(r => r.status === 'pending').map(req => (
                    <div key={req.id} className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                          <Clock size={24} />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{req.type}</p>
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Submitted: {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="px-4 py-2 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">Awaiting Review</span>
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
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
            <Landmark className="text-white" size={24} />
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
      <main className="flex-1 xl:ml-80 p-6 sm:p-10 lg:p-16 max-w-[1600px] mx-auto w-full">
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-3 text-blue-600">
              <Sparkles size={18} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Personal Banking Dashboard</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
              Welcome back, <span className="text-blue-600">{userProfile?.firstName || 'User'}</span>
            </h1>
            <p className="mt-4 text-slate-500 font-medium text-lg">Your financial ecosystem is performing optimally today.</p>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-100 hover:shadow-lg transition-all relative">
              <Bell size={24} />
              <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="flex items-center gap-4 bg-white border border-slate-100 p-2 pr-6 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                <UserIcon size={24} />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tier Status</p>
                <p className="text-sm font-bold text-slate-900">Elite Customer</p>
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
          {/* USE CASE: Request new account */}
          {modal.type === 'new-account' && (
            <>
              <div className="space-y-2">
                <label className="label">Account Type</label>
                <select name="accountType" onChange={handleInputChange} className="input" required>
                  <option value="">Select type</option>
                  <option value="saving">Saving Account</option>
                  <option value="current">Current Account</option>
                  <option value="fd">Fix Deposit</option>
                  <option value="joint">Joint Account</option>
                </select>
              </div>
              <Input label="Initial Deposit (₹)" name="deposit" type="number" placeholder="Min. ₹500" onChange={handleInputChange} required />
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs text-blue-600 font-bold">Includes: Automated KYC Document Verification</p>
              </div>
            </>
          )}

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
        </form>
      </Modal>
    </div>
  );
}
