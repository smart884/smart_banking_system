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
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';

export default function SecureLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Use Firebase Client SDK for authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Handle token and localStorage
      const idToken = await user.getIdToken();
      localStorage.setItem('sb_token', idToken);
      localStorage.setItem('sb_user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'User'
      }));

      // 3. Redirect to dashboard after login
      alert('Secure Login Successful ✅');
      navigate('/dashboard');
    } catch (err: any) {
      // 4. Handle errors (invalid credentials, user not found)
      console.error('Login error:', err.code, err.message);
      
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address format.');
          break;
        case 'auth/invalid-credential':
          setError('Invalid login credentials.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed login attempts. Try again later.');
          break;
        default:
          setError('Failed to login: ' + err.message);
      }
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
                      className="pl-10"
                    />
                    <LogIn className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-600" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-blue-700 hover:underline font-medium">Forgot password?</a>
                </div>

                <Button 
                  type="submit" 
                  full 
                  disabled={loading}
                  className="bg-blue-700 hover:bg-blue-800 h-12 text-lg shadow-lg shadow-blue-200"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Authenticating...
                    </span>
                  ) : 'Sign In'}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-blue-700 hover:underline font-bold">Open one today</Link>
                </p>
              </div>
            </Card>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-500 grayscale opacity-70">
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> 256-bit SSL</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> PCI-DSS Compliant</span>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
