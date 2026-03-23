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
  Search
} from 'lucide-react';

/**
 * Reusable Premium Modal Component
 */
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default function SecureDashboard() {
  const { userProfile, logout, addRequest } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: string;
    title: string;
  }>({
    isOpen: false,
    type: '',
    title: ''
  });

  const [formData, setFormData] = useState<any>({});

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const openModal = (type: string, title: string) => {
    setModal({ isOpen: true, type, title });
    setFormData({});
  };

  const closeModal = () => setModal({ ...modal, isOpen: false });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`[USER-DASHBOARD] Submitting ${modal.type}...`, formData);
    
    const userName = `${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim();
    
    // Categorize based on modal type
    const category = ['saving', 'current', 'fd', 'joint'].includes(modal.type) ? 'account' : 'service';
    
    try {
      addRequest({
        userName,
        type: modal.title,
        category,
        details: formData
      });
      
      console.log(`[USER-DASHBOARD] Broadcast sent successfully! 📡`);
      showToast("Request Submitted Successfully ✅");
      closeModal();
    } catch (err) {
      console.error("[USER-DASHBOARD] Submission failed:", err);
      alert("Failed to submit request. Please try again.");
    }
  };

  const ActionCard = ({ icon: Icon, title, desc, onClick, color }: any) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-start p-6 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group text-left w-full"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${color} group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-current/10`}>
        <Icon size={28} />
      </div>
      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2 group-hover:text-blue-600 transition-colors">{title}</h4>
      <p className="text-xs text-slate-400 font-medium leading-relaxed">{desc}</p>
      <div className="mt-6 flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
        Launch Action <ArrowRight size={12} />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-100 flex flex-col p-8 hidden xl:flex">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <ShieldCheck size={24} />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tighter">SmartBank</span>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'dashboard', icon: LayoutIcon, label: 'Dashboard' },
            { id: 'accounts', icon: Landmark, label: 'Accounts' },
            { id: 'payments', icon: Send, label: 'Payments' },
            { id: 'services', icon: Briefcase, label: 'Services' },
            { id: 'transactions', icon: History, label: 'Transactions' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-blue-50 text-blue-600 shadow-sm' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <button 
          onClick={logout}
          className="mt-auto flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-300"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-50">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search transactions, bills..." 
              className="w-full h-12 pl-12 pr-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-blue-600 transition-all text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900">{userProfile?.firstName} {userProfile?.lastName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Member</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
                {userProfile?.firstName[0]}{userProfile?.lastName[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-10 max-w-7xl mx-auto space-y-10">
          {/* Welcome & Account Summary */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 rounded-[40px] p-10 text-white shadow-2xl shadow-blue-200">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-2xl" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 h-full">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em]">
                    <ShieldCheck size={12} />
                    Verified Terminal
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Welcome back,<br />{userProfile?.firstName}</h2>
                  <p className="text-blue-100 font-medium text-lg opacity-80 italic">Managing your smart wealth with precision.</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-8 border border-white/10 min-w-[300px]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Available Balance</p>
                    <button onClick={() => setShowBalance(!showBalance)} className="text-white/60 hover:text-white transition-colors">
                      {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-blue-200 text-2xl font-bold">₹</span>
                    <h3 className="text-4xl font-black tracking-tight">
                      {showBalance ? '50,000.00' : '••••••••'}
                    </h3>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Account Type</p>
                      <p className="text-sm font-bold">Saving Account</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Status</p>
                      <p className="text-sm font-bold flex items-center gap-1 justify-end">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full" /> Active
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-black text-slate-900 mb-2">Spending Analysis</h4>
                <p className="text-xs text-slate-400 font-medium mb-6">Your weekly financial footprint</p>
                <div className="h-32 flex items-end gap-2 mb-6">
                  {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-50 rounded-t-lg relative group">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-lg transition-all duration-1000 group-hover:bg-blue-400" 
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <Button full variant="outline" className="rounded-2xl border-slate-100 hover:bg-slate-50 text-slate-600 font-bold">
                View Full Report
              </Button>
            </div>
          </div>

          {/* Action Grid Sections */}
          <div className="space-y-12">
            {/* Account Services */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Account Services</h3>
                  <p className="text-sm text-slate-400 font-medium">Open new accounts and manage deposits</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ActionCard 
                  icon={PlusCircle} 
                  title="Saving Account" 
                  desc="High interest daily savings" 
                  color="bg-emerald-50 text-emerald-600"
                  onClick={() => openModal('saving', 'Open Saving Account')}
                />
                <ActionCard 
                  icon={Wallet} 
                  title="Current Account" 
                  desc="Business liquidity terminal" 
                  color="bg-blue-50 text-blue-600"
                  onClick={() => openModal('current', 'Open Current Account')}
                />
                <ActionCard 
                  icon={Landmark} 
                  title="Fixed Deposit" 
                  desc="Secure long-term growth" 
                  color="bg-amber-50 text-amber-600"
                  onClick={() => openModal('fd', 'Fixed Deposit')}
                />
                <ActionCard 
                  icon={UserIcon} 
                  title="Joint Account" 
                  desc="Shared financial control" 
                  color="bg-purple-50 text-purple-600"
                  onClick={() => openModal('joint', 'Joint Account')}
                />
              </div>
            </section>

            {/* Banking & Payments */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Banking & Payments</h3>
                  <p className="text-sm text-slate-400 font-medium">Transfer funds and pay your utilities</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <ActionCard 
                  icon={Send} 
                  title="Fund Transfer" 
                  desc="Instant secure transfers" 
                  color="bg-blue-600 text-white"
                  onClick={() => openModal('transfer', 'Fund Transfer')}
                />
                <ActionCard 
                  icon={Receipt} 
                  title="Electricity Bill" 
                  desc="Pay utility bills instantly" 
                  color="bg-yellow-50 text-yellow-600"
                  onClick={() => openModal('bill', 'Electricity Bill')}
                />
                <ActionCard 
                  icon={CardIcon} 
                  title="Credit Card" 
                  desc="Pay your card dues" 
                  color="bg-rose-50 text-rose-600"
                  onClick={() => openModal('bill', 'Credit Card Payment')}
                />
                <ActionCard 
                  icon={Smartphone} 
                  title="Mobile Recharge" 
                  desc="Top up any number" 
                  color="bg-indigo-50 text-indigo-600"
                  onClick={() => openModal('bill', 'Mobile Recharge')}
                />
              </div>
            </section>

            {/* Request Services */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Request Services</h3>
                  <p className="text-sm text-slate-400 font-medium">Apply for cards and financial assistance</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard 
                  icon={CreditCard} 
                  title="Apply Credit Card" 
                  desc="Unlock premium benefits" 
                  color="bg-slate-900 text-white"
                  onClick={() => openModal('card', 'Apply Credit Card')}
                />
                <ActionCard 
                  icon={Briefcase} 
                  title="Apply Loan" 
                  desc="Fast-track your dreams" 
                  color="bg-emerald-600 text-white"
                  onClick={() => openModal('loan', 'Apply Loan')}
                />
                <ActionCard 
                  icon={FileText} 
                  title="Apply Debit Card" 
                  desc="Get your physical card" 
                  color="bg-blue-100 text-blue-600"
                  onClick={() => openModal('card', 'Apply Debit Card')}
                />
              </div>
            </section>

            {/* Transaction History */}
            <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Transactions</h3>
                  <p className="text-xs text-slate-400 font-medium">Your latest financial activity</p>
                </div>
                <Button variant="outline" className="rounded-xl border-slate-100 hover:bg-slate-50 text-blue-600 font-bold text-xs">
                  Download Statement
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[
                      { date: '2024-03-22', type: 'Transfer', desc: 'Sent to Rahul Sharma', amount: '-₹5,000.00', status: 'completed' },
                      { date: '2024-03-21', type: 'Deposit', desc: 'Salary Credit - March', amount: '+₹45,000.00', status: 'completed' },
                      { date: '2024-03-20', type: 'Payment', desc: 'Electricity Bill - MSEB', amount: '-₹1,240.00', status: 'completed' },
                      { date: '2024-03-18', type: 'Transfer', desc: 'From Priya V.', amount: '+₹2,500.00', status: 'completed' },
                    ].map((tx, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6 text-sm font-bold text-slate-500">{tx.date}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            tx.type === 'Deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm font-black text-slate-900">{tx.desc}</td>
                        <td className={`px-8 py-6 text-sm font-black ${
                          tx.amount.startsWith('+') ? 'text-emerald-600' : 'text-slate-900'
                        }`}>
                          {tx.amount}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={10} /> {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-10 z-[100] animate-in slide-in-from-right duration-500">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
            <p className="font-bold text-sm">{toast}</p>
          </div>
        </div>
      )}

      {/* Modal System */}
      <Modal 
        isOpen={modal.isOpen} 
        onClose={closeModal} 
        title={modal.title}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {modal.type === 'transfer' && (
            <>
              <Input label="Receiver Account Number" name="accNo" placeholder="Enter 12-digit account number" required onChange={handleInputChange} className="h-14 rounded-2xl" />
              <Input label="Amount (₹)" name="amount" type="number" placeholder="0.00" required onChange={handleInputChange} className="h-14 rounded-2xl" />
              <Input label="Remarks (Optional)" name="remarks" placeholder="e.g. Rent, Gift" onChange={handleInputChange} className="h-14 rounded-2xl" />
            </>
          )}

          {['saving', 'current', 'fd', 'joint'].includes(modal.type) && (
            <>
              <Input label="Full Legal Name" name="fullName" placeholder="As per Aadhaar/PAN" required onChange={handleInputChange} className="h-14 rounded-2xl" />
              <Input label="Date of Birth" name="dob" type="date" required onChange={handleInputChange} className="h-14 rounded-2xl" />
              <Input label="Permanent Address" name="address" placeholder="Enter full address" required onChange={handleInputChange} className="h-14 rounded-2xl" />
              <Input label="Initial Deposit (₹)" name="deposit" type="number" placeholder="Min ₹1,000" required onChange={handleInputChange} className="h-14 rounded-2xl" />
            </>
          )}

          {modal.type === 'bill' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Payment Category</label>
                <select 
                  name="billType" 
                  className="w-full h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 transition-all text-sm font-medium px-4"
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="electricity">Electricity</option>
                  <option value="water">Water Bill</option>
                  <option value="gas">Gas Pipeline</option>
                  <option value="broadband">Broadband/Fiber</option>
                  <option value="mobile">Mobile Prepaid/Postpaid</option>
                </select>
              </div>
              <Input label="Consumer Number / ID" name="consumerId" placeholder="Enter ID" required onChange={handleInputChange} className="h-14 rounded-2xl" />
              <Input label="Amount (₹)" name="amount" type="number" placeholder="0.00" required onChange={handleInputChange} className="h-14 rounded-2xl" />
            </>
          )}

          {modal.type === 'loan' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Loan Type</label>
                <select name="loanType" className="w-full h-14 rounded-2xl bg-slate-50 px-4 text-sm font-medium" required onChange={handleInputChange}>
                  <option value="personal">Personal Loan</option>
                  <option value="home">Home Loan</option>
                  <option value="car">Car/Vehicle Loan</option>
                  <option value="education">Education Loan</option>
                </select>
              </div>
              <Input label="Required Amount (₹)" name="amount" type="number" placeholder="Max ₹50,00,000" required onChange={handleInputChange} className="h-14 rounded-2xl" />
              <Input label="Annual Income (₹)" name="income" type="number" placeholder="Enter annual income" required onChange={handleInputChange} className="h-14 rounded-2xl" />
            </>
          )}

          {modal.type === 'card' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Card Variant</label>
                <select name="cardVariant" className="w-full h-14 rounded-2xl bg-slate-50 px-4 text-sm font-medium" required onChange={handleInputChange}>
                  <option value="platinum">Visa Platinum (Standard)</option>
                  <option value="signature">Visa Signature (Premium)</option>
                  <option value="infinite">Visa Infinite (Elite)</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-400 font-medium px-2">Physical card will be delivered to your registered address within 7-10 working days.</p>
            </>
          )}

          <Button type="submit" full className="h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-black shadow-2xl shadow-blue-100 mt-4">
            Confirm & Submit Request
          </Button>
        </form>
      </Modal>
    </div>
  );
}
