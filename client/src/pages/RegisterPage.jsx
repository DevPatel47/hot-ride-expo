import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const roleOptions = [
  { value: 'registrant', label: 'Registrant', desc: 'Register your vehicle for events' },
  { value: 'sponsor', label: 'Sponsor', desc: 'Sponsor events with packages' },
  { value: 'vendor', label: 'Vendor', desc: 'Book a vendor booth at events' },
  { value: 'donor', label: 'Donor', desc: 'Make donations to charities' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'registrant', phone: '', company: '', club: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Hot Rides Expo.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">HR</div>
          <h1 className="text-xl font-bold text-text">Create Account</h1>
          <p className="text-sm text-text-muted mt-1">Join Hot Rides Expo</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {roleOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('role', opt.value)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                form.role === opt.value
                  ? 'border-brand bg-brand/10 ring-1 ring-brand/30'
                  : 'border-border hover:border-border-light bg-surface'
              }`}
            >
              <p className={`text-sm font-semibold ${form.role === opt.value ? 'text-brand' : 'text-text'}`}>{opt.label}</p>
              <p className="text-[11px] text-text-faint mt-0.5 leading-tight">{opt.desc}</p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={e => update('password', e.target.value)} className="input-field" required minLength={6} />
          </div>

          {/* Conditional fields */}
          {(form.role === 'sponsor' || form.role === 'vendor') && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Company Name</label>
              <input type="text" value={form.company} onChange={e => update('company', e.target.value)} className="input-field" placeholder="Your business name" />
            </div>
          )}
          {form.role === 'registrant' && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Car Club (optional)</label>
              <input type="text" value={form.club} onChange={e => update('club', e.target.value)} className="input-field" placeholder="e.g., GTA Muscle Cars" />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-text-faint text-center mt-6">
          Already have an account? <Link to="/login" className="text-brand hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
