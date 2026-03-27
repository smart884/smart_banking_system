import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebaseConfig';
import Layout from '../components/Layout';
import Section from '../components/ui/Section';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../components/SecureAuthContext';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';

export default function SecureLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const result = await login(email, password);

      if (result.success) {
        const role = result.profile.role;
        // Redirect based on role
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'manager') navigate('/manager/dashboard');
        else if (role === 'clerk') navigate('/clerk/dashboard');
        else navigate('/secure-dashboard');
      } else {
        setError(result.message || "Invalid credentials. Please check your email and password.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Section className="bg-slate-50 min-h-[80vh] flex items-center">
        <Container>
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <ShieldCheck className="w-8 h-8 text-blue-700" />
              </div>
              <h1 className="text-3xl font-bold text-blue-900">Secure Access</h1>
              <p className="text-gray-600 mt-2">Sign in to manage your SmartBank account</p>
            </div>

            <Card className="shadow-2xl border-t-4 border-blue-600 p-8 bg-white">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-14"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-14"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-600" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link to="/forgot-password" title="Coming soon" className="text-sm text-blue-700 font-bold hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  full
                  disabled={loading}
                  className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-black shadow-xl shadow-blue-100 transition-all active:scale-95"
                >
                  {loading ? 'Authenticating...' : (
                    <span className="flex items-center justify-center gap-2">
                      <LogIn size={20} /> Login Securely
                    </span>
                  )}
                </Button>

                <div className="text-center pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Don't have an account yet?{' '}
                    <Link to="/register" className="text-blue-700 font-black hover:underline">
                      Join SmartBank
                    </Link>
                  </p>
                </div>
              </form>
            </Card>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
