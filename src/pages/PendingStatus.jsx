import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import { Clock, ShieldCheck, ArrowRight, UserCheck, RefreshCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SecureAuthContext';

export default function PendingStatus() {
  const { userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // If status changes to approved, redirect to dashboard automatically
  useEffect(() => {
    if (userProfile?.status === 'approved') {
      navigate('/dashboard');
    }
  }, [userProfile, navigate]);

  // Set up an interval to check status automatically every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshProfile();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshProfile]);

  const handleRefresh = async () => {
    await refreshProfile();
  };

  return (
    <Layout>
      <Section className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <Container className="max-w-2xl">
          <Card className="p-12 text-center shadow-2xl rounded-[48px] border-none bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-[32px] bg-amber-100 text-amber-600 mb-8 shadow-xl shadow-amber-100 animate-pulse">
              <Clock size={48} />
            </div>
            
            <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Application Under Review</h1>
            
            <div className="space-y-6 text-slate-600 mb-10 text-lg leading-relaxed font-medium">
              <p>
                Your registration has been received! Our <span className="text-blue-600 font-bold">Clerk Team</span> is currently verifying your details and identity documents.
              </p>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-4">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <UserCheck size={14} />
                  </div>
                  <p className="text-sm">Account created successfully.</p>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock size={14} />
                  </div>
                  <p className="text-sm">Verification in progress (usually takes 24-48 hours).</p>
                </div>
                <div className="flex gap-4 opacity-40">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                    <ShieldCheck size={14} />
                  </div>
                  <p className="text-sm">Access to secure dashboard granted after approval.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleRefresh}
                className="flex-1 h-16 rounded-2xl bg-blue-600 text-white font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100"
              >
                <RefreshCcw size={20} /> Check Status
              </button>
              <Link to="/contact" className="flex-1">
                <button className="w-full h-16 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  Contact Support <ArrowRight size={20} />
                </button>
              </Link>
            </div>
          </Card>
        </Container>
      </Section>
    </Layout>
  );
}
