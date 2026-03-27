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
  const { userProfile, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // --- States for Fully Functional Dashboard ---
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Customer', status: 'Active' },
    { id: 2, name: 'Alice Smith', email: 'alice@clerk.com', role: 'Clerk', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@manager.com', role: 'Manager', status: 'On Leave' },
    { id: 4, name: 'Admin One', email: 'admin@smartbank.com', role: 'Admin', status: 'Active' },
  ]);

  const [securitySettings, setSecuritySettings] = useState({
    ipWhitelisting: true,
    twoFactorAuth: true,
    sslTls: true,
    dataEncryption: true
  });

  const [backupInfo, setBackupInfo] = useState({
    lastBackup: 'Today, 14:00',
    storageUsed: '12.4 GB',
    recoveryPoints: 28,
    isBackingUp: false
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Customer' });

  // --- Handlers ---
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    const userToAdd = {
      ...newUser,
      id: Date.now(),
      status: 'Active'
    };
    setUsers([userToAdd, ...users]);
    setIsAddModalOpen(false);
    setNewUser({ name: '', email: '', role: 'Customer' });
    showToast(`New user ${userToAdd.name} added! 👤`);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
      showToast("User deleted successfully 🗑️");
    }
  };

  const toggleSecurity = (key) => {
    setSecuritySettings(prev => ({ ...prev, [key]: !prev[key] }));
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
              <Users size={24} />
            </div>
            <span className="text-green-500 text-sm font-bold">+12%</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Total Users</h3>
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <Shield size={24} />
            </div>
            <span className="text-blue-500 text-sm font-bold text-xs uppercase">Secure</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Security Status</h3>
          <p className="text-2xl font-bold text-slate-900">Optimal</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
              <Database size={24} />
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
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">{user.role}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => showToast(`Viewing profile: ${user.name}`)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors"><Eye size={16} /></button>
                    <button onClick={() => handleDeleteUser(user.id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors"><XCircle size={16} /></button>
                  </div>
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 rounded-lg text-red-600">
              <Lock size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Firewall & Access</h3>
              <p className="text-sm text-slate-500">Manage network security policies</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group cursor-pointer" onClick={() => toggleSecurity('ipWhitelisting')}>
              <span className="text-sm font-medium">IP Whitelisting</span>
              <span className={`text-xs font-bold ${securitySettings.ipWhitelisting ? 'text-green-600' : 'text-slate-400'}`}>
                {securitySettings.ipWhitelisting ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group cursor-pointer" onClick={() => toggleSecurity('twoFactorAuth')}>
              <span className="text-sm font-medium">2FA Enforcement</span>
              <span className={`text-xs font-bold ${securitySettings.twoFactorAuth ? 'text-green-600' : 'text-slate-400'}`}>
                {securitySettings.twoFactorAuth ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Encryption Settings</h3>
              <p className="text-sm text-slate-500">Database and transit security</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group cursor-pointer" onClick={() => toggleSecurity('sslTls')}>
              <span className="text-sm font-medium">SSL/TLS 1.3</span>
              <span className={`text-xs font-bold ${securitySettings.sslTls ? 'text-green-600' : 'text-slate-400'}`}>
                {securitySettings.sslTls ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group cursor-pointer" onClick={() => toggleSecurity('dataEncryption')}>
              <span className="text-sm font-medium">Data-at-rest encryption</span>
              <span className={`text-xs font-bold ${securitySettings.dataEncryption ? 'text-green-600' : 'text-slate-400'}`}>
                {securitySettings.dataEncryption ? 'AES-256' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
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
      <aside className={`fixed z-20 inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out bg-slate-900 text-white w-64 space-y-6 py-7 px-2`}>
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tighter">SMART<span className="text-blue-500">BANK</span></h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Admin Control</p>
            </div>
          </div>
        </div>
        <nav className="px-2">
          {navLinks.map(link => (
            <NavLink 
              key={link.label}
              to={link.to} 
              end 
              className={({ isActive }) => 
                `flex items-center py-3 px-4 my-1 rounded-xl transition-all duration-200 group ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                  <span className="font-semibold text-sm">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-5 left-0 right-0 px-4">
          <button onClick={handleLogout} className="flex items-center w-full py-3 px-4 rounded-xl transition-all duration-200 text-slate-400 hover:bg-red-500/10 hover:text-red-500 group">
            <LogOut className="mr-3 h-5 w-5 transition-colors group-hover:text-red-500" />
            <span className="font-semibold text-sm">Log out</span>
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