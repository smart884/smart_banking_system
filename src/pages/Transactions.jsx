import React from 'react';
import { useAuth } from '../components/SecureAuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter,
  Download,
  Calendar,
  IndianRupee
} from 'lucide-react';

export default function Transactions() {
  const { transactions, loading } = useAuth();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.remark?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.toAccount?.includes(searchTerm) ||
                         t.fromAccount?.includes(searchTerm);
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'credit' && t.category === 'Credit') ||
                         (filterType === 'debit' && t.category === 'Debit');
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout title="Transaction History">
      <Container className="py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transactions</h1>
            <p className="text-slate-500 font-medium">View and manage your recent banking activities.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} />
            Export Statement
          </button>
        </div>

        <Card className="mb-8 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Search by remark, account number..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all font-bold text-slate-700"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
              </select>
              <button className="p-4 bg-slate-50 text-slate-700 rounded-2xl hover:bg-slate-100 transition-all">
                <Filter size={20} />
              </button>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Details</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Transactions...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center">
                          <History size={32} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs italic">No transactions found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            t.category === 'Credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {t.category === 'Credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{t.remark}</p>
                            <p className="text-xs text-slate-500 font-medium">
                              {t.category === 'Credit' ? `From: ${t.fromAccount}` : `To: ${t.toAccount}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-sm">{formatDate(t.timestamp)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.type}</span>
                      </td>
                      <td className="px-8 py-6">
                        <Badge variant="success">Completed</Badge>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className={`flex items-center justify-end gap-1 font-black text-lg ${
                          t.category === 'Credit' ? 'text-emerald-600' : 'text-slate-900'
                        }`}>
                          <IndianRupee size={16} />
                          <span>{Math.abs(t.amount).toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Container>
    </DashboardLayout>
  );
}
