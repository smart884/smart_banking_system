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
  RefreshCcw
} from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

/**
 * Clerk Dashboard System
 * Premium banking interface for bank officers.
 */

export default function ClerkDashboard() {
  const { userProfile, logout, requests, updateRequestStatus, clearRequests, populateDemoData, allUsers } = useAuth(); // Added allUsers
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedReq, setSelectedReq] = useState(null);
  const [remarks, setRemarks] = useState(''); // Added remarks state
  const [debugMode, setDebugMode] = useState(false);
  const [kycResult, setKycResult] = useState(null); // Added kycResult state
  const location = useLocation();
  const navigate = useNavigate();

  // Banking Workflow Filter: Clerks see 'pending_clerk' or 'pending'
  const accountRequests = requests.filter(r => 
    (r.category === 'account' && (r.status === 'pending_clerk' || r.status === 'pending')) ||
    (r.status === 'clerk_approved' || r.status === 'manager_approved' || r.status === 'approved' || r.status === 'rejected')
  );
  
  const serviceRequests = requests.filter(r => 
    r.category === 'service' || 
    r.type.toLowerCase().includes('loan') || 
    r.type.toLowerCase().includes('card') || 
    r.type.toLowerCase().includes('transfer') ||
    r.type.toLowerCase().includes('bill')
  );

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to CLEAR ALL requests? This will delete everything from the terminal.")) {
      clearRequests();
      showToast("All requests cleared! 🗑️");
    }
  };

  const handlePopulateDemo = () => {
    populateDemoData();
    showToast("Demo data loaded! 🚀");
  };

  React.useEffect(() => {
    console.log("[ClerkTerminal] State update detected:", {
      total: requests.length,
      accounts: accountRequests.length,
      services: serviceRequests.length
    });
  }, [requests]);

  const forceRefreshData = () => {
    showToast("Data Synced! 📡");
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/clerk/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/clerk/accounts', label: 'Account Requests', icon: Users },
    { to: '/clerk/services', label: 'Service Requests', icon: Briefcase },
    { to: '/clerk/reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleAction = (id, category, status) => {
    // If it's an account request being approved, bypass manager and trigger account creation
    const finalStatus = status === 'approved' 
      ? (category === 'account' ? 'manager_approved' : 'clerk_approved') 
      : 'rejected';
      
    updateRequestStatus(id, finalStatus, remarks);
    showToast(`Request ${status === 'approved' ? (category === 'account' ? 'Approved & Account Created! ✅' : 'sent to Manager ✅') : 'rejected ❌'}`);
    setSelectedReq(null);
    setKycResult(null);
    setRemarks('');
  };

  const handleVerifyKYC = () => {
     if (!selectedReq) return;
     
     // Find user profile in allUsers using the userId from request
     // Fallback to userName if userId is missing (for older requests)
     const user = allUsers.find(u => 
       u.id === selectedReq.userId || 
       `${u.firstName} ${u.lastName}`.trim().toLowerCase() === selectedReq.userName.trim().toLowerCase()
     );
     
     if (!user) {
      showToast("Error: User profile not found in database! ❌");
      setKycResult({ error: "User profile not found." });
      return;
    }

    const details = selectedReq.details || {};
    
    // Compare details (normalization for case/spaces)
    const verification = {
      mobile: {
        match: String(details.mobile || "").trim() === String(user.contactNumber || "").trim(),
        submitted: details.mobile,
        db: user.contactNumber
      },
      email: {
        match: String(details.email || "").toLowerCase().trim() === String(user.email || "").toLowerCase().trim(),
        submitted: details.email,
        db: user.email
      },
      aadhar: {
        match: String(details.aadhar || "").replace(/\s/g, "") === String(user.aadhaar || "").replace(/\s/g, ""),
        submitted: details.aadhar,
        db: user.aadhaar
      },
      pan: {
        match: String(details.pan || "").toUpperCase().trim() === String(user.pan || "").toUpperCase().trim(),
        submitted: details.pan,
        db: user.pan
      }
    };

    setKycResult(verification);
    
    const allMatch = Object.values(verification).every(v => v.match);
    if (allMatch) {
      showToast("KYC Verification Successful! All details match. ✅");
      setRemarks(""); // Clear if all match
    } else {
      showToast("KYC Verification FAILED! Some details do not match. ❌");
      
      // Generate detailed error message based on mismatches
      const mismatches = [];
      if (!verification.mobile.match) mismatches.push("mobile number");
      if (!verification.email.match) mismatches.push("email address");
      if (!verification.aadhar.match) mismatches.push("addhar number");
      if (!verification.pan.match) mismatches.push("pancard number");

      let fieldsText = "";
      if (mismatches.length === 1) {
        fieldsText = mismatches[0];
      } else {
        const last = mismatches.pop();
        fieldsText = `${mismatches.join(", ")} and ${last}`;
      }

      const errorMsg = `your ${fieldsText} dose not matched so your request is rejected`;
      setRemarks(errorMsg);
    }
  };

  const renderStats = () => {
    const all = [...accountRequests, ...serviceRequests];
    const pending = all.filter(r => r.status === 'pending').length;
    const approved = all.filter(r => r.status === 'approved').length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <LayoutDashboard size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Requests</p>
          <h3 className="text-4xl font-black text-slate-900">{all.length}</h3>
          <div className="mt-4 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-full" />
          </div>
        </div>
        <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-amber-500">
            <XCircle size={80} />
          </div>
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Pending Review</p>
          <h3 className="text-4xl font-black text-slate-900">{pending}</h3>
          <div className="mt-4 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-50" style={{ width: `${(pending / (all.length || 1)) * 100}%` }} />
          </div>
        </div>
        <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-500">
            <CheckCircle2 size={80} />
          </div>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Verified & Approved</p>
          <h3 className="text-4xl font-black text-slate-900">{approved}</h3>
          <div className="mt-4 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${(approved / (all.length || 1)) * 100}%` }} />
          </div>
        </div>
      </div>
    );
  };

  const RequestDetailsModal = () => {
    if (!selectedReq) return null;
    return (
      <Modal 
        isOpen={!!selectedReq} 
        onClose={() => { setSelectedReq(null); setKycResult(null); setRemarks(''); }} 
        title={`Review Request: ${selectedReq?.type}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Header Info Section */}
          <div className="flex items-center justify-between p-5 bg-slate-900 rounded-[24px] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 bg-blue-600/20 rounded-full blur-2xl -mr-5 -mt-5 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <FileText size={28} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Requester Identity</p>
                <h4 className="text-lg font-black tracking-tight">{selectedReq?.userName}</h4>
              </div>
            </div>
            <div className="relative z-10 text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Submission Date</p>
              <p className="text-sm font-bold">{selectedReq?.createdAt ? new Date(selectedReq.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          {/* KYC Status Indicator */}
          {kycResult && (
            <div className={`p-4 rounded-2xl flex items-center gap-4 border animate-in slide-in-from-top-2 duration-300 ${
              Object.values(kycResult).every(v => v.match) 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                Object.values(kycResult).every(v => v.match) ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}>
                {Object.values(kycResult).every(v => v.match) ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest">KYC Status</p>
                <p className="text-sm font-bold">
                  {Object.values(kycResult).every(v => v.match) ? 'Verified: All records match database' : 'Failed: Data discrepancies detected'}
                </p>
              </div>
            </div>
          )}

          {/* Data Grid Section */}
          <div className="grid grid-cols-2 gap-4">
            {selectedReq?.details && Object.entries(selectedReq.details).map(([key, value]) => {
              const label = key.replace(/([A-Z])/g, ' $1').trim();
              const fieldKyc = kycResult?.[key.toLowerCase()];
              
              return (
                <div key={key} className={`group p-4 rounded-2xl transition-all duration-300 border hover:shadow-md ${
                  fieldKyc 
                    ? (fieldKyc.match ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100') 
                    : 'bg-white border-slate-100'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">{label}</p>
                    {fieldKyc && (
                      <div className={`p-1 rounded-full ${fieldKyc.match ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
                        {fieldKyc.match ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      </div>
                    )}
                  </div>
                  <p className="text-base font-black text-slate-900 truncate tracking-tight">{String(value) || 'N/A'}</p>
                </div>
              );
            })}
          </div>

          {/* Remarks & Action Section */}
          <div className="pt-6 border-t border-slate-100 space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Review Remarks</label>
                <span className="text-[10px] font-bold text-slate-400 italic">User will see this if rejected</span>
              </div>
              <textarea 
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Final review comments..."
                className="w-full h-24 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all resize-none shadow-inner"
              />
            </div>

            <Button 
              full 
              onClick={handleVerifyKYC}
              className={`h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-[0.98] ${
                kycResult ? 'bg-slate-900 hover:bg-black' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
              }`}
            >
              {kycResult ? 'Run Verification Again' : 'Verify KYC Data'}
            </Button>
            
            {(selectedReq.status !== 'approved' && selectedReq.status !== 'manager_approved') && (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAction(selectedReq.id, selectedReq.category, 'rejected')}
                  className="h-14 rounded-2xl border-2 border-rose-100 text-rose-600 font-black uppercase tracking-widest text-xs hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                >
                  <XCircle size={18} /> Reject Application
                </button>
                <button 
                  onClick={() => handleAction(selectedReq.id, selectedReq.category, 'approved')}
                  className="h-14 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Approve Application
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  const renderTable = (requests, type) => (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Name</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {requests.length === 0 ? (
            <tr><td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">No requests found in this terminal.</td></tr>
          ) : requests.map((req) => (
            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-8 py-6">
                <p className="text-sm font-black text-slate-900">{req.userName}</p>
              </td>
              <td className="px-8 py-6">
                <p className="text-sm font-bold text-slate-600">{req.type}</p>
              </td>
              <td className="px-8 py-6 text-sm font-medium text-slate-500">
                {new Date(req.createdAt).toLocaleDateString()}
              </td>
              <td className="px-8 py-6">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                  req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                  req.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                  req.status === 'clerk_approved' ? 'bg-blue-50 text-blue-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {req.status === 'clerk_approved' ? 'Clerk Approved' : req.status}
                </span>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => { setSelectedReq({ ...req, category: type }); setKycResult(null); setRemarks(''); }}
                    className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Eye size={16} />
                  </button>
                  {req.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => handleAction(req.id, type, 'approved')}
                        className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleAction(req.id, type, 'rejected')}
                        className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-10 right-10 z-[100] animate-in slide-in-from-right duration-500">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-xl">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <p className="font-bold text-sm">{toast}</p>
          </div>
        </div>
      )}

      {/* Modal System */}
      <RequestDetailsModal />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col bg-slate-900 text-white border-r border-slate-800 sticky top-0 h-screen z-50 p-10">
        <div className="mb-16 px-2">
          <Link to="/" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 overflow-hidden border border-slate-700">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase">smart <span className="text-blue-500">Clerk</span></span>
          </Link>
        </div>

        <nav className="flex-1 space-y-3">
          {navLinks.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              className={({ isActive }) => `
                w-full flex items-center gap-4 px-6 py-5 rounded-3xl transition-all duration-300 group
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <link.icon size={22} className="group-hover:scale-110 transition-transform" />
              <span className="font-black text-sm uppercase tracking-widest">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-5 rounded-3xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all group"
          >
            <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-black text-sm uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 py-4 sticky top-0 z-40">
          <div className="px-6 md:px-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-slate-100"><Menu size={24} /></button>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-widest hidden md:block">Clerk Terminal</h1>
            </div>

            <div className="flex items-center gap-6">


              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
                <Search size={18} className="text-slate-400" />
                <input type="text" placeholder="Search requests..." className="bg-transparent outline-none text-sm font-medium w-40" />
              </div>
              <button className="p-3 rounded-2xl bg-slate-50 border border-slate-100 relative"><Bell size={20} /><span className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full" /></button>
              <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-slate-900 leading-none mb-1">{userProfile?.firstName}</p>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Bank Officer</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">{userProfile?.firstName?.[0]}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content based on route */}
        <main className="flex-1 px-6 md:px-10 py-10">
          {debugMode && (
            <div className="mb-10 p-6 bg-slate-900 rounded-[32px] text-emerald-400 font-mono text-xs space-y-4 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="flex items-center gap-2 uppercase tracking-widest font-black"><ShieldCheck size={14}/> Terminal Debugger</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] animate-pulse">ACTIVE SYNC</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-white/40 uppercase tracking-widest text-[10px]">LocalStorage Key</p>
                  <p className="font-bold">smartbank_core_requests_v2</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white/40 uppercase tracking-widest text-[10px]">Found in Storage</p>
                  <p className="font-bold text-white">{(localStorage.getItem('smartbank_core_requests_v2') ? JSON.parse(localStorage.getItem('smartbank_core_requests_v2')).length : 0)} entries</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white/40 uppercase tracking-widest text-[10px]">React State</p>
                  <p className="font-bold text-white">{requests.length} entries</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white/40 uppercase tracking-widest text-[10px]">Last Sync</p>
                  <p className="font-bold text-white">{new Date().toLocaleTimeString()}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex gap-4">
                <button 
                  onClick={handlePopulateDemo}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all"
                >
                  Populate Demo Data
                </button>
                <p className="text-white/40 uppercase tracking-widest text-[10px] self-center">
                  Use this to verify terminal rendering instantly.
                </p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/40 uppercase tracking-widest text-[10px] mb-2">Recent Storage Payload</p>
                <div className="bg-black/40 p-3 rounded-xl overflow-hidden text-ellipsis whitespace-nowrap opacity-60">
                  {localStorage.getItem('smartbank_core_requests_v2') || 'EMPTY_STORAGE'}
                </div>
              </div>
            </div>
          )}

          {location.pathname === '/clerk/dashboard' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Terminal Overview</h2>
                <p className="text-slate-500 font-medium">Monitoring Smart Bank operational flow.</p>
              </div>
              {renderStats()}
              <div className="space-y-6">
                <div className="flex items-center gap-4 px-2">
                  <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Latest Account Requests</h3>
                </div>
                {renderTable(accountRequests.slice(0, 5), 'account')}
              </div>
            </div>
          )}

          {location.pathname === '/clerk/accounts' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Account Requests</h2>
                <p className="text-slate-500 font-medium">Manage saving, current, and joint account applications.</p>
              </div>
              {renderTable(accountRequests, 'account')}
            </div>
          )}

          {location.pathname === '/clerk/services' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Service Requests</h2>
                <p className="text-slate-500 font-medium">Handle credit cards, debit cards, and loan applications.</p>
              </div>
              {renderTable(serviceRequests, 'service')}
            </div>
          )}

          {location.pathname === '/clerk/reports' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Bank Reports</h2>
                <p className="text-slate-500 font-medium">Statistical analysis of operational efficiency.</p>
              </div>
              {renderStats()}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-10 bg-white rounded-[40px] border border-slate-100 shadow-xl space-y-8">
                  <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest">Efficiency Chart</h4>
                  <div className="space-y-6">
                    {['Accounts', 'Loans', 'Cards', 'Bills'].map((item, i) => (
                      <div key={item} className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                          <span className="text-slate-400">{item}</span>
                          <span className="text-blue-600">{80 - i * 15}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${80 - i * 15}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-10 bg-slate-900 rounded-[40px] text-white space-y-6 flex flex-col justify-center text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/20 mb-4">
                    <ShieldCheck size={40} />
                  </div>
                  <h4 className="text-2xl font-black tracking-tight">System Health: Optimal</h4>
                  <p className="text-slate-400 font-medium leading-relaxed">All backend processing terminals are synchronized and operating within normal parameters.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 text-white shadow-2xl">
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg"><ShieldCheck size={24} /></div>
                <span className="text-xl font-black tracking-tighter uppercase">smart Clerk</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-xl bg-white/10"><X size={20} /></button>
            </div>
            <nav className="px-4 space-y-2 mt-4">
              {navLinks.map((link) => (
                <NavLink 
                  key={link.to} 
                  to={link.to} 
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}
                >
                  <link.icon size={20} />
                  <span className="font-bold text-sm">{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
