import React, { useState } from 'react';
import { useAuth } from '../components/SecureAuthContext';
import DashboardLayout from '../components/DashboardLayout';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  CreditCard, 
  Smartphone, 
  Zap, 
  Landmark, 
  Send, 
  Receipt,
  ArrowRight,
  ShieldCheck,
  Activity,
  Calendar,
  IndianRupee,
  ChevronRight,
  Search
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const PAYMENT_SERVICES = [
  { id: 'transfer', title: 'Fund Transfer', desc: 'Transfer money to any bank account instantly.', icon: Send, color: 'bg-blue-50 text-blue-600' },
  { id: 'mobile', title: 'Mobile Recharge', desc: 'Top up your prepaid or postpaid connection.', icon: Smartphone, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'electricity', title: 'Electricity Bill', desc: 'Pay your monthly utility bills with ease.', icon: Zap, color: 'bg-amber-50 text-amber-600' },
  { id: 'credit-card', title: 'Credit Card Bill', desc: 'Settle your outstanding credit card dues.', icon: CreditCard, color: 'bg-rose-50 text-rose-600' },
  { id: 'loan', title: 'Loan EMI', desc: 'Pay your monthly loan installments.', icon: Landmark, color: 'bg-indigo-50 text-indigo-600' },
  { id: 'others', title: 'Other Payments', desc: 'Insurance, DTH, Water, Gas and more.', icon: Receipt, color: 'bg-purple-50 text-purple-600' }
];

export default function Payments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredServices = PAYMENT_SERVICES.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Payments & Transfers">
      <Container className="py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Payments</h1>
            <p className="text-slate-500 font-medium text-lg">Central hub for all your transfers and bill payments.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search service..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 transition-all font-medium shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredServices.map((service) => (
            <Card key={service.id} className="p-8 border-none shadow-2xl shadow-slate-200/50 hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-500 group">
              <div className={`w-16 h-16 ${service.color} rounded-[24px] flex items-center justify-center mb-8 shadow-lg shadow-current/10 group-hover:scale-110 transition-transform`}>
                <service.icon size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{service.title}</h3>
              <p className="text-slate-500 mb-8 font-medium leading-relaxed">{service.desc}</p>
              <Button 
                onClick={() => navigate('/user/dashboard')}
                className="w-full h-14 rounded-2xl bg-slate-50 text-slate-900 hover:bg-blue-600 hover:text-white border-none font-bold text-lg flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white"
              >
                Launch Now
                <ChevronRight size={20} />
              </Button>
            </Card>
          ))}
        </div>

        {/* Recent Payment Activity */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Activity size={24} className="text-blue-600" />
              Recent Payment Activity
            </h2>
            <Link to="/transactions" className="text-blue-600 font-black flex items-center gap-1 hover:gap-2 transition-all">
              View History
              <ArrowRight size={18} />
            </Link>
          </div>
          <Card className="p-10 border-none shadow-2xl shadow-slate-200/50 text-center">
            <div className="flex flex-col items-center gap-6 py-10">
              <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center">
                <Receipt size={40} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">No Recent Payments Found</h3>
                <p className="text-slate-500 max-w-md mx-auto font-medium">Your recent bill payments and recharges will appear here once you make your first payment.</p>
              </div>
              <Button 
                onClick={() => navigate('/user/dashboard')}
                className="px-10 h-14 rounded-2xl bg-blue-600 shadow-xl shadow-blue-100"
              >
                Make Your First Payment
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </DashboardLayout>
  );
}
