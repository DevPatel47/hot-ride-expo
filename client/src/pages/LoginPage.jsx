import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const demoAccounts = [
  { role: 'Admin', email: 'admin@hotrides.com' },
  { role: 'Organizer', email: 'organizer@hotrides.com' },
  { role: 'Registrant', email: 'registrant@hotrides.com' },
  { role: 'Sponsor', email: 'sponsor@hotrides.com' },
  { role: 'Vendor', email: 'vendor@hotrides.com' },
  { role: 'Donor', email: 'donor@hotrides.com' },
  { role: 'Staff', email: 'staff@hotrides.com' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('admin@hotrides.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const quickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">HR</div>
          <h1 className="text-xl font-bold text-text">Sign in</h1>
          <p className="text-sm text-text-muted mt-1">Hot Rides Expo Management</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Demo accounts */}
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-[11px] text-text-faint mb-3 text-center uppercase tracking-wider font-medium">Quick Login (password: admin123)</p>
          <div className="grid grid-cols-2 gap-1.5">
            {demoAccounts.map(acc => (
              <button
                key={acc.email}
                onClick={() => quickLogin(acc.email)}
                className={`text-xs py-1.5 px-2.5 rounded-lg transition-colors text-left ${
                  email === acc.email
                    ? 'bg-brand/15 text-brand border border-brand/30'
                    : 'bg-surface text-text-muted hover:text-text hover:bg-surface-lighter border border-transparent'
                }`}
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-text-faint text-center mt-6">
          Don't have an account? <Link to="/register" className="text-brand hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
