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
  const [toast, setToast] = useState<string | null>(null);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOverride = async (status: 'approved' | 'rejected') => {
    if (!selectedReq) return;
    await updateRequestStatus(selectedReq.id, status);
    showToast(`Manager Override: ${status === 'approved' ? 'Approved ✅' : 'Rejected ❌'}`);
    setIsOverrideModalOpen(false);
    setSelectedReq(null);
  };

  const navLinks = [
    { to: '/manager/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/manager/requests', label: 'All Requests', icon: ShieldAlert },
    { to: '/manager/reports', label: 'Analytics', icon: BarChart3 },
  ];

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

  const RequestDetailsModal = () => {
    if (!selectedReq) return null;
    return (
      <Modal isOpen={!!selectedReq && !isOverrideModalOpen} onClose={() => setSelectedReq(null)} title="Request Specification">
        <div className="space-y-8">
          <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xl">
              {selectedReq.userName[0]}
            </div>
            <div>
              <h4 className="font-black text-slate-900">{selectedReq.userName}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedReq.type}</p>
            </div>
            <div className="ml-auto">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                selectedReq.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                selectedReq.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                'bg-amber-50 text-amber-600'
              }`}>
                {selectedReq.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Request Date</p>
              <p className="font-bold text-slate-900">{new Date(selectedReq.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
              <p className="font-bold text-slate-900 capitalize">{selectedReq.category}</p>
            </div>
            {selectedReq.details && Object.entries(selectedReq.details).map(([key, value]: [string, any]) => (
              <div key={key} className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                <p className="font-bold text-slate-900">{String(value)}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
            <Button 
              full 
              className="h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200"
              onClick={() => setIsOverrideModalOpen(true)}
            >
              Enter Override Mode
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  const OverrideModal = () => {
    if (!selectedReq) return null;
    return (
      <Modal isOpen={isOverrideModalOpen} onClose={() => setIsOverrideModalOpen(false)} title="Managerial Override">
        <div className="space-y-8 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mx-auto">
            <ShieldAlert size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900">Authorize Decision Override</h3>
            <p className="text-sm text-slate-500 font-medium">You are about to override the system/clerk decision for <b>{selectedReq.userName}</b>.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleOverride('approved')}
              className="h-16 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
            >
              Force Approve
            </button>
            <button 
              onClick={() => handleOverride('rejected')}
              className="h-16 rounded-2xl bg-rose-600 text-white font-black uppercase tracking-widest text-xs hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
            >
              Force Reject
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Modals */}
      <RequestDetailsModal />
      <OverrideModal />

      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col bg-slate-900 text-white sticky top-0 h-screen z-30">
        <div className="p-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <ShieldCheck size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">Smart Manager</span>
        </div>

        <nav className="px-6 flex-1 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.to}
              onClick={() => navigate(link.to)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                location.pathname === link.to 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <link.icon size={20} />
              {link.label}
            </button>
          ))}
        </nav>

        <div className="p-8 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
          >
            <LogOut size={20} />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-slate-100"><Menu size={24} /></button>
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl w-96">
              <Search size={18} className="text-slate-400" />
              <input type="text" placeholder="Global search across database..." className="bg-transparent outline-none text-sm font-medium w-full" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="p-3 rounded-2xl bg-slate-50 border border-slate-100 relative text-slate-600 hover:bg-slate-100 transition-colors">
              <Bell size={20} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900 leading-none mb-1">{userProfile?.firstName}</p>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">Senior Manager</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-black shadow-lg">
                {userProfile?.firstName[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-10 max-w-7xl mx-auto">
          {location.pathname === '/manager/dashboard' && (
            <div className="space-y-10">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Database Overview</h2>
                <p className="text-slate-500 font-medium italic">High-level summary of all banking operations.</p>
              </div>
              {renderStats()}
              
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <Clock className="text-blue-600" /> Recent Terminal Activity
                  </h3>
                  <button onClick={() => navigate('/manager/requests')} className="text-blue-600 font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                    View All Database <ArrowRight size={14} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Request</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {requests.slice(0, 5).map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-10 py-6 font-bold text-slate-900">{req.userName}</td>
                          <td className="px-10 py-6 text-sm text-slate-500 font-medium">{req.type}</td>
                          <td className="px-10 py-6">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                              req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                              req.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <button onClick={() => setSelectedReq(req)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {location.pathname === '/manager/requests' && (
            <div className="space-y-10">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Request Database</h2>
                <p className="text-slate-500 font-medium italic">Complete log of all customer applications and service requests.</p>
              </div>
              
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User Name</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Final Status</th>
                        <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {requests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-10 py-6 font-bold text-slate-900">{req.userName}</td>
                          <td className="px-10 py-6 text-sm text-slate-500 font-medium">{req.type}</td>
                          <td className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{req.category}</td>
                          <td className="px-10 py-6 text-sm text-slate-500 font-medium">{new Date(req.createdAt).toLocaleDateString()}</td>
                          <td className="px-10 py-6">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                              req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                              req.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-right flex items-center justify-end gap-3">
                            <button 
                              onClick={() => setSelectedReq(req)} 
                              className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedReq(req);
                                setIsOverrideModalOpen(true);
                              }} 
                              className="p-3 rounded-xl bg-amber-50 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                              title="Override Decision"
                            >
                              <ShieldAlert size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {location.pathname === '/manager/reports' && (
            <div className="space-y-10">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Operational Analytics</h2>
                <p className="text-slate-500 font-medium italic">Data-driven insights into banking flow.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-xl font-black text-slate-900">Request Distribution</h3>
                  <div className="space-y-6">
                    {['account', 'service'].map((cat) => {
                      const count = requests.filter(r => r.category === cat).length;
                      const percentage = requests.length > 0 ? (count / requests.length) * 100 : 0;
                      return (
                        <div key={cat} className="space-y-2">
                          <div className="flex justify-between items-center font-bold text-xs uppercase tracking-widest">
                            <span className="text-slate-400">{cat}s</span>
                            <span className="text-slate-900">{count} requests</span>
                          </div>
                          <div className="h-3 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center space-y-6">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    <TrendingUp size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">Operational Efficiency</h3>
                    <p className="text-slate-500 font-medium">System is performing at peak capacity.</p>
                  </div>
                  <div className="text-4xl font-black text-blue-600">98.4%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-10 z-[100] animate-in slide-in-from-right duration-500">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
              <CheckCircle2 size={18} />
            </div>
            <p className="font-bold text-sm tracking-tight">{toast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
