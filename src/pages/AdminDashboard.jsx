import React, { useState } from 'react';
import { useAuth } from '../components/SecureAuthContext';
import { 
  Layout, 
  Users, 
  Shield, 
  Database, 
  Lock, 
  UserPlus, 
  Settings, 
  Activity, 
  Bell, 
  Search, 
  ShieldCheck, 
  Menu, 
  X, 
  RefreshCcw,
  LogOut,
  Eye,
  XCircle
} from 'lucide-react';
import { NavLink, useNavigate, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';

/**
 * Admin Dashboard System
 * Premium banking interface for bank administrators.
 */

export default function AdminDashboard() {
  const { userProfile, logout, allUsers, systemSettings, updateSystemSettings, addUser, deleteUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // --- States for Fully Functional Dashboard ---
  const [backupInfo, setBackupInfo] = useState({
    lastBackup: 'Today, 14:00',
    storageUsed: '12.4 GB',
    recoveryPoints: 28,
    isBackingUp: false
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', email: '', role: 'customer' });

  // --- Handlers ---
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.firstName || !newUser.email) return;
    await addUser(newUser);
    setIsAddModalOpen(false);
    setNewUser({ firstName: '', email: '', role: 'customer' });
    showToast(`New user ${newUser.firstName} added! 👤`);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id);
      showToast("User deleted successfully 🗑️");
    }
  };

  const toggleSecurity = async (key) => {
    const updated = { ...systemSettings, [key]: !systemSettings[key] };
    await updateSystemSettings(updated);
    showToast("Security policy updated 🔒");
  };

  const runBackup = () => {
    setBackupInfo(prev => ({ ...prev, isBackingUp: true }));
    showToast("Backup initiated... ⏳");
    setTimeout(() => {
      setBackupInfo(prev => ({
        ...prev,
        isBackingUp: false,
        lastBackup: 'Just now',
        recoveryPoints: prev.recoveryPoints + 1
      }));
      showToast("System backup completed successfully! ✅");
    }, 3000);
  };

  const navLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: Layout },
    { to: '/admin/users', label: 'Manage User', icon: Users },
    { to: '/admin/security', label: 'System Security', icon: Shield },
    { to: '/admin/backup', label: 'System Backup', icon: Database },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <Users size="24" />
            </div>
            <span className="text-green-500 text-sm font-bold">+12%</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Total Users</h3>
          <p className="text-2xl font-bold text-slate-900">{allUsers.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <Shield size="24" />
            </div>
            <span className="text-blue-500 text-sm font-bold text-xs uppercase">Secure</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Security Status</h3>
          <p className="text-2xl font-bold text-slate-900">Optimal</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
              <Database size="24" />
            </div>
            <span className="text-slate-400 text-sm font-medium">{backupInfo.lastBackup}</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Last Backup</h3>
          <p className="text-2xl font-bold text-slate-900">Success</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Recent Admin Activities</h3>
          <Activity size={18} className="text-slate-400" />
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { action: 'User Access Revoked', user: 'clerk_01', time: '10 mins ago', status: 'critical' },
            { action: 'System Backup Initiated', user: 'System', time: '2 hours ago', status: 'success' },
            { action: 'Security Policy Updated', user: 'Admin', time: '5 hours ago', status: 'info' },
            { action: 'New Clerk Added', user: 'Admin', time: 'Yesterday', status: 'success' },
          ].map((log, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  log.status === 'critical' ? 'bg-red-500' : 
                  log.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                  <p className="text-xs text-slate-500">by {log.user}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderManageUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <UserPlus size={18} />
          Add New User
        </Button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 uppercase font-medium">{user.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-widest ${
                    user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {user.status || 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <XCircle size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">System Security</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: 'ipWhitelisting', label: 'IP Whitelisting', desc: 'Allow access only from authorized IP addresses.' },
          { key: 'twoFactorAuth', label: 'Mandatory 2FA', desc: 'Enforce two-factor authentication for all employees.' },
          { key: 'sslTls', label: 'SSL/TLS 1.3', desc: 'Require high-grade encryption for all connections.' },
          { key: 'dataEncryption', label: 'Data Encryption', desc: 'Encrypt sensitive customer data at rest.' },
        ].map((item) => (
          <div key={item.key} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div className="flex gap-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Lock size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{item.label}</h4>
                <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
              </div>
            </div>
            <button 
              onClick={() => toggleSecurity(item.key)}
              className={`w-12 h-6 rounded-full transition-colors relative ${systemSettings?.[item.key] ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${systemSettings?.[item.key] ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBackup = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">System Backup</h2>
        <Button 
          onClick={runBackup} 
          disabled={backupInfo.isBackingUp}
          className={`flex items-center gap-2 ${backupInfo.isBackingUp ? 'bg-slate-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
          <RefreshCcw size={18} className={backupInfo.isBackingUp ? 'animate-spin' : ''} />
          {backupInfo.isBackingUp ? 'Processing...' : 'Run Manual Backup'}
        </Button>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center relative overflow-hidden">
        {backupInfo.isBackingUp && (
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-pulse" />
        )}
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Database size={40} className="text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Automated Backup System</h3>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          The system is currently configured to perform incremental backups every 6 hours. 
          Your data is encrypted and stored in multiple secure locations.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Last Backup</p>
            <p className="font-bold text-slate-800">{backupInfo.lastBackup}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Storage Used</p>
            <p className="font-bold text-slate-800">{backupInfo.storageUsed}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Recovery Points</p>
            <p className="font-bold text-slate-800">{backupInfo.recoveryPoints} Available</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <Routes>
      <Route path="dashboard" element={renderOverview()} />
      <Route path="users" element={renderManageUsers()} />
      <Route path="security" element={renderSecurity()} />
      <Route path="backup" element={renderBackup()} />
      <Route path="/" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`fixed z-20 inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out bg-slate-900 text-white w-80 space-y-6 py-7 px-10 border-r border-slate-800`}>
        <div className="mb-16 px-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/20 overflow-hidden border border-slate-700">
              <img src="https://firebasestorage.googleapis.com/v0/b/smart-bank-e-system.appspot.com/o/logo.png?alt=media&token=logo-placeholder" alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png' }} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-white uppercase leading-none">SMART<span className="text-blue-500">BANK</span></h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Admin Control</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-3">
          {navLinks.map(link => (
            <NavLink 
              key={link.label}
              to={link.to} 
              end 
              className={({ isActive }) => 
                `w-full flex items-center gap-4 px-6 py-5 rounded-3xl transition-all duration-300 group ${
                  isActive ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white group-hover:scale-110 transition-transform'}`} />
                  <span className="font-black text-sm uppercase tracking-widest">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-8 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-4 px-6 py-5 rounded-3xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all group">
            <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-black text-sm uppercase tracking-widest text-left">Log out</span>
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-6 bg-white border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {navLinks.find(l => location.pathname.includes(l.to))?.label || 'Dashboard Overview'}
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Welcome back, {userProfile?.displayName || 'Administrator'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
              {userProfile?.displayName?.[0] || 'A'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <Modal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          title="Add New System User"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New System User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="e.g. Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="jane@smartbank.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">System Role</label>
                <select 
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="Customer">Customer</option>
                  <option value="Clerk">Clerk</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <Button type="button" variant="secondary" full onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit" full>Create User</Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 px-6 py-3 bg-slate-900 text-white rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          {toast}
        </div>
      )}
    </div>
  );
}