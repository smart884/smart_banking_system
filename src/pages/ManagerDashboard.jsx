import React, { useState } from 'react';
import { useAuth } from '../components/SecureAuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  BarChart3, 
  LogOut, 
  Bell, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  FileText,
  Menu,
  X,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

/**
 * Manager Dashboard System
 * Enterprise-grade banking admin panel.
 */
export default function ManagerDashboard() {
  const { userProfile, logout, requests, updateRequestStatus } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedReq, setSelectedReq] = useState(null);
  const [managerRemarks, setManagerRemarks] = useState(''); // Added managerRemarks
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAction = async (status) => {
    if (!selectedReq) return;
    const finalStatus = status === 'approved' ? 'manager_approved' : 'rejected';
    await updateRequestStatus(selectedReq.id, finalStatus, managerRemarks);
    showToast(`Final Review: ${status === 'approved' ? 'Account Authorized ✅' : 'Rejected ❌'}`);
    setSelectedReq(null);
    setManagerRemarks('');
  };

  // Banking Workflow Filter: Managers see 'clerk_approved' or all requests
  const filteredRequests = requests.filter(r => 
    (activeTab === 'dashboard' && r.status === 'clerk_approved') || 
    (activeTab === 'requests')
  );

  const navLinks = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'requests', label: 'All Requests', icon: ShieldAlert },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              {/* Request Management Table */}
              <div className="xl:col-span-2 space-y-6">
                 <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                       <TrendingUp className="text-blue-600" size={24} /> 
                       Active Pipeline
                    </h3>
                    <button onClick={() => setActiveTab('reports')} className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">View Analytics</button>
                 </div>

                 <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                             <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Name</th>
                             <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Protocol</th>
                             <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                             <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operational Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {filteredRequests.length === 0 ? (
                            <tr><td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic">No requests in active pipeline.</td></tr>
                          ) : filteredRequests.slice(0, 5).map((req) => (
                            <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black group-hover:bg-blue-600 group-hover:text-white transition-all">{req.userName[0]}</div>
                                     <p className="text-sm font-black text-slate-900">{req.userName}</p>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <p className="text-sm font-bold text-slate-600">{req.type}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{req.category}</p>
                               </td>
                               <td className="px-8 py-6">
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                                    req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    req.status === 'rejected' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                    req.status === 'clerk_approved' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                    'bg-amber-50 text-amber-600 border border-amber-100'
                                  }`}>
                                    {req.status === 'clerk_approved' ? 'Clerk Approved' : req.status}
                                  </span>
                               </td>
                               <td className="px-8 py-6 text-right">
                                  <button 
                                    onClick={() => setSelectedReq(req)}
                                    className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
                                  >
                                    Review Core
                                  </button>
                               </td>
                            </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>

              {/* Sidebar Reports */}
              <div className="space-y-10">
                 <div className="p-10 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-24 bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="relative z-10">
                       <h4 className="text-xl font-black mb-6 tracking-tight">Intelligence Report</h4>
                       <div className="space-y-6">
                          {['Core Efficiency', 'Security Audit', 'User Growth'].map((item, i) => (
                            <div key={i} className="space-y-2">
                               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-200">
                                  <span>{item}</span>
                                  <span>{95 - i * 8}%</span>
                               </div>
                               <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-white rounded-full shadow-lg" style={{ width: `${95 - i * 8}%` }}></div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="p-10 bg-white rounded-[48px] border border-slate-100 shadow-xl space-y-8">
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                       <Users className="text-blue-600" size={20} /> Team Capacity
                    </h4>
                    <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                       <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm font-black">12</div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Clerks</p>
                          <p className="text-sm font-bold text-slate-900">Normal Operation</p>
                       </div>
                    </div>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed italic">The clerk team is currently processing at 92% efficiency with zero backlogs reported.</p>
                 </div>
              </div>
           </div>
        );
      case 'requests':
        return (
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center">
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">All System Requests</h3>
               <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{requests.length} Total</span>
            </div>
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Request Type</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {requests.map((req) => (
                    <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                       <td className="px-8 py-6 font-black text-slate-900">{req.userName}</td>
                       <td className="px-8 py-6 font-bold text-slate-600">{req.type}</td>
                       <td className="px-8 py-6 text-sm text-slate-500 font-medium">{new Date(req.createdAt).toLocaleDateString()}</td>
                       <td className="px-8 py-6">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                            req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                            req.status === 'rejected' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {req.status}
                          </span>
                       </td>
                       <td className="px-8 py-6 text-right">
                          <button onClick={() => setSelectedReq(req)} className="p-3 bg-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"><Eye size={18} /></button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-10">
             <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-10">Manager Analytics</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                   <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Revenue Growth</h3>
                   <div className="flex items-end gap-2 h-48">
                      {[40, 55, 70, 60, 85, 75, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-600 rounded-t-xl" style={{ height: `${h}%` }} />
                      ))}
                   </div>
                </div>
                <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
                   <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">Risk Index</h3>
                   <div className="flex items-end gap-2 h-48">
                      {[20, 15, 25, 10, 30, 20, 15].map((h, i) => (
                        <div key={i} className="flex-1 bg-rose-500 rounded-t-xl" style={{ height: `${h}%` }} />
                      ))}
                   </div>
                </div>
             </div>
          </div>
        );
      default: return null;
    }
  };

  const renderStats = () => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Requests', value: total, icon: FileText, color: 'bg-blue-500' },
          { label: 'Pending Review', value: pending, icon: Clock, color: 'bg-amber-500' },
          { label: 'Total Approved', value: approved, icon: CheckCircle2, color: 'bg-emerald-500' },
          { label: 'Total Rejected', value: rejected, icon: XCircle, color: 'bg-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="p-8 bg-white/80 backdrop-blur-xl rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity ${stat.color.replace('bg-', 'text-')}`}>
              <stat.icon size={80} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-900">{stat.value}</h3>
            <div className="mt-4 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: total > 0 ? `${(stat.value / total) * 100}%` : '0%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const OverrideModal = () => null; // Removed as it's merged into details modal

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top duration-500">
          <div className="bg-slate-900 text-white px-10 py-5 rounded-[24px] shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl">
            <CheckCircle2 size={24} className="text-emerald-500" />
            <p className="font-black text-sm uppercase tracking-widest">{toast}</p>
          </div>
        </div>
      )}

      {/* Modal Systems */}
      <Modal isOpen={!!selectedReq} onClose={() => setSelectedReq(null)} title="Executive Review Specification">
        {selectedReq && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl">
                {selectedReq.userName[0]}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requester Name</p>
                <p className="text-lg font-black text-slate-900">{selectedReq.userName}</p>
              </div>
            </div>

            <div className="p-8 bg-slate-900 rounded-[32px] text-white shadow-2xl space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Protocol Specification</span>
                  <span className="font-black tracking-tight">{selectedReq.type}</span>
              </div>
              
              {/* Dynamic Fields */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                  {Object.entries(selectedReq.details || {}).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="font-bold text-sm text-white truncate">{String(value)}</p>
                    </div>
                  ))}
              </div>

              {/* Clerk Remarks if available */}
              {selectedReq.clerkRemark && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mt-4">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Clerk Remark</p>
                  <p className="text-sm font-medium text-slate-300 italic">"{selectedReq.clerkRemark}"</p>
                </div>
              )}
            </div>

            {selectedReq.status === 'clerk_approved' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manager Approval Remarks</label>
                  <textarea 
                    value={managerRemarks}
                    onChange={(e) => setManagerRemarks(e.target.value)}
                    placeholder="Confirm account authorization or specify rejection reason..."
                    className="w-full h-24 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                  <Button 
                    variant="secondary" 
                    full 
                    onClick={() => handleAction('rejected')}
                    className="h-16 rounded-[24px] border-rose-100 text-rose-500 font-black uppercase tracking-widest text-xs hover:bg-rose-50"
                  >
                    REJECT REQUEST
                  </Button>
                  <Button 
                    full 
                    onClick={() => handleAction('approved')}
                    className="h-16 rounded-[24px] bg-emerald-600 font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100"
                  >
                    AUTHORIZE ACCOUNT
                  </Button>
                </div>
              </div>
            )}

            <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic pt-4">Manager authorization triggers automatic account generation & core banking deployment.</p>
          </div>
        )}
      </Modal>
      <OverrideModal />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col bg-slate-900 text-white border-r border-slate-800 sticky top-0 h-screen z-50 p-10">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 overflow-hidden border border-slate-700">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase">Smart<span className="text-blue-600">Manager</span></span>
        </div>

        <nav className="flex-1 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center gap-4 px-6 py-5 rounded-3xl transition-all duration-300 group ${
                activeTab === link.id 
                  ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <link.icon size={22} className={activeTab === link.id ? 'text-white' : 'group-hover:scale-110 transition-transform text-slate-400 group-hover:text-white'} />
              <span className="font-black text-sm uppercase tracking-widest">{link.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-10 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-5 rounded-3xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all group">
            <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-black text-sm uppercase tracking-widest">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Modern Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 py-6 px-10 sticky top-0 z-40 flex items-center justify-between">
           <div className="flex items-center gap-6">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 rounded-2xl bg-slate-100 text-slate-600"><Menu size={24} /></button>
              <div className="hidden md:block">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase tracking-widest">Executive Dashboard</h2>
                 <p className="text-[10px] font-black text-blue-600 mt-1 uppercase tracking-[0.3em]">Operational Intelligence Terminal</p>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center gap-3 px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl w-64 focus-within:ring-4 focus-within:ring-blue-600/5 transition-all">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Search operational data..." className="bg-transparent outline-none text-xs font-bold w-full" />
              </div>
              <button className="p-3 rounded-2xl bg-slate-50 border border-slate-100 relative group hover:bg-blue-600 transition-all">
                 <Bell size={22} className="text-slate-500 group-hover:text-white" />
                 <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>
              <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900 leading-none mb-1">{userProfile?.firstName}</p>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Regional Manager</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-200">{userProfile?.firstName?.[0]}</div>
              </div>
           </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-10 max-w-[1600px] mx-auto w-full">
           {activeTab === 'dashboard' && renderStats()}
           {renderContent()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl p-10 flex flex-col">
             <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white"><ShieldCheck size={24} /></div>
                  <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">Smart Manager</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-xl bg-slate-100"><X size={24} /></button>
             </div>
             <nav className="flex-1 space-y-4">
                {navLinks.map((link) => (
                  <button key={link.id} onClick={() => { setActiveTab(link.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 p-5 rounded-3xl transition-all ${activeTab === link.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-slate-50 text-slate-500'}`}>
                    <link.icon size={22} />
                    <span className="font-black text-sm uppercase tracking-widest">{link.label}</span>
                  </button>
                ))}
             </nav>
          </div>
        </div>
      )}
    </div>
  );
}
