import React, { useState } from 'react';
import { useAuth } from '../components/SecureAuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { 
  CreditCard, 
  IndianRupee, 
  PlusCircle, 
  Landmark, 
  History, 
  Send, 
  ArrowRight,
  ShieldCheck,
  Activity,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Accounts() {
  const { userAccounts, loading } = useAuth();
  const [showBalance, setShowBalance] = useState({});

  const toggleBalance = (accountId) => {
    setShowBalance(prev => ({ ...prev, [accountId]: !prev[accountId] }));
  };

  return (
    <DashboardLayout title="Your Accounts">
      <Container className="py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Accounts</h1>
            <p className="text-slate-500 font-medium text-lg">Manage your savings, current and fixed deposit accounts.</p>
          </div>
          <Link to="/user/dashboard">
            <Button className="flex items-center gap-2 px-8 py-4 bg-blue-600 shadow-xl shadow-blue-200 hover:scale-105 transition-all rounded-2xl">
              <PlusCircle size={20} />
              Open New Account
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {loading ? (
            Array(2).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse h-64 border-none shadow-xl shadow-slate-100" />
            ))
          ) : userAccounts.length === 0 ? (
            <div className="lg:col-span-2 text-center py-20 bg-white rounded-[48px] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Landmark size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">No Active Accounts Found</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto font-medium">You haven't opened any bank accounts yet. Get started by submitting an account opening request.</p>
              <Link to="/user/dashboard">
                <Button variant="secondary" className="px-10 h-14 rounded-2xl border-2 font-bold text-lg">
                  Submit Request Now
                </Button>
              </Link>
            </div>
          ) : (
            userAccounts.map((acc) => (
              <Card key={acc.id} className="p-8 border-none shadow-2xl shadow-slate-200/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-50" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-blue-100">
                        <Landmark size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{acc.accountType} Account</h3>
                          <Badge variant={acc.status === 'Active' ? 'success' : 'warning'}>{acc.status}</Badge>
                        </div>
                        <p className="text-slate-400 font-bold tracking-widest text-xs">{acc.accountNumber}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleBalance(acc.id)}
                      className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-2xl"
                    >
                      {showBalance[acc.id] ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  <div className="mb-10">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">Available Balance</p>
                    <div className="flex items-center gap-3">
                      <div className="text-4xl font-black text-slate-900 tracking-tighter flex items-baseline gap-2">
                        <IndianRupee size={28} className="text-blue-600" />
                        <span>{showBalance[acc.id] ? acc.balance.toLocaleString('en-IN') : 'XXXX.XX'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-3xl group-hover:bg-white group-hover:shadow-lg transition-all border border-transparent group-hover:border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">IFSC Code</p>
                      <p className="text-sm font-black text-slate-800 tracking-tight">{acc.ifsc || 'SMBK0001024'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-3xl group-hover:bg-white group-hover:shadow-lg transition-all border border-transparent group-hover:border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Branch Name</p>
                      <p className="text-sm font-black text-slate-800 tracking-tight">Main Branch</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      Secure Digital Account
                    </div>
                    <div className="flex gap-2">
                      <Link to="/transactions">
                        <button className="p-3 bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-xl border border-transparent hover:border-blue-100">
                          <History size={18} />
                        </button>
                      </Link>
                      <Link to="/user/dashboard">
                        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white hover:bg-blue-700 transition-all rounded-xl font-bold shadow-xl shadow-slate-200">
                          Transfer
                          <ArrowRight size={16} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Account Activity Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Activity size={24} className="text-blue-600" />
              Account Activity
            </h2>
          </div>
          <Card className="p-10 border-none shadow-2xl shadow-slate-200/50 text-center">
            <div className="grid md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Calendar size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 mb-1">Last Update</h4>
                  <p className="text-slate-500 text-sm font-medium">Today, 10:45 AM</p>
                </div>
              </div>
              <div className="space-y-4 py-8 md:py-0">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 mb-1">Security Status</h4>
                  <p className="text-emerald-500 text-sm font-bold uppercase tracking-widest">AAA Verified</p>
                </div>
              </div>
              <div className="space-y-4 pt-8 md:pt-0">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 mb-1">Linked Cards</h4>
                  <p className="text-slate-500 text-sm font-medium">2 Active Cards</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </DashboardLayout>
  );
}
