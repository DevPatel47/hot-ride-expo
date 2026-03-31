import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { HiOutlineClipboardList, HiOutlineCreditCard, HiOutlineGift, HiOutlineUserGroup, HiOutlineTruck, HiOutlineHeart, HiOutlineTicket } from 'react-icons/hi';

function Section({ children, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`max-w-6xl mx-auto px-6 ${className}`}
    >
      {children}
    </motion.section>
  );
}

const features = [
  { icon: HiOutlineClipboardList, title: 'Registrations', desc: 'Track every participant, vehicle, and entry across all your expo events.' },
  { icon: HiOutlineCreditCard, title: 'Payments', desc: 'Accept Card, Cash, E-transfer, PayPal, and Interac. Auto-confirm registrations.' },
  { icon: HiOutlineGift, title: 'Donations', desc: 'Log donations by type and value, tied to specific events and charities.' },
  { icon: HiOutlineUserGroup, title: 'Sponsors & Vendors', desc: 'Manage sponsor packages, vendor booths, and track partner revenue.' },
];

const roleCards = [
  { icon: HiOutlineTicket, title: 'Register Your Ride', desc: 'Sign up as a registrant to enter your classic car in upcoming expos.', role: 'registrant', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { icon: HiOutlineUserGroup, title: 'Become a Sponsor', desc: 'Support local events and get premium visibility with sponsorship packages.', role: 'sponsor', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { icon: HiOutlineTruck, title: 'Vendor Booth', desc: 'Book a booth to sell your products and services at car expos.', role: 'vendor', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { icon: HiOutlineHeart, title: 'Make a Donation', desc: 'Contribute to charitable causes through cash, items, or services.', role: 'donor', color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
];

const stats = [
  { label: 'Revenue', value: '$30,775' },
  { label: 'Donations', value: '$29,800' },
  { label: 'Expenses', value: '$19,750' },
  { label: 'Net Profit', value: '$40,825' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm">HR</div>
          <span className="text-base font-semibold text-text">Hot Rides Expo</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn-primary text-sm">Dashboard</button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="btn-secondary text-sm">Sign In</button>
              <button onClick={() => navigate('/register')} className="btn-primary text-sm">Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-32 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold text-text leading-tight tracking-tight"
        >
          Manage Your Expo.<br />
          <span className="text-brand">Track Every Dollar.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 text-lg text-text-muted max-w-2xl mx-auto leading-relaxed"
        >
          The complete management system for car shows and expos. Handle registrations, payments, sponsors, vendors, and donations — all in one place, with real-time reporting and role-based access for every stakeholder.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <button onClick={() => navigate(user ? '/dashboard' : '/register')} className="btn-primary text-base px-8 py-3.5 rounded-xl">
            Get Started Free →
          </button>
          <button onClick={() => navigate('/login')} className="btn-secondary text-base px-8 py-3.5 rounded-xl">
            Demo Login
          </button>
        </motion.div>
      </section>

      {/* Role Cards */}
      <Section className="py-24">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-brand uppercase tracking-wider mb-3">For Everyone</p>
          <h2 className="text-3xl font-bold text-text">One platform, every role</h2>
          <p className="text-text-muted mt-3 max-w-xl mx-auto">Whether you're showing your car, sponsoring an event, running a booth, or making a donation — we've got you covered.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roleCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              onClick={() => navigate('/register')}
              className={`card cursor-pointer hover:scale-[1.02] transition-transform border ${card.color.split(' ').slice(1).join(' ')}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.color.split(' ').slice(1, 3).join(' ')}`}>
                <card.icon className={`w-5 h-5 ${card.color.split(' ')[0]}`} />
              </div>
              <h3 className="text-base font-semibold text-text mb-2">{card.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{card.desc}</p>
              <p className="text-xs text-brand mt-3">Sign up →</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Problem → Solution */}
      <Section className="py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-medium text-brand uppercase tracking-wider mb-3">The Problem</p>
            <h2 className="text-3xl font-bold text-text mb-4">Expos are complex. Spreadsheets aren't enough.</h2>
            <p className="text-text-muted leading-relaxed">
              Managing registrations, tracking payments across 5 methods, coordinating sponsors and vendors, logging donations, and calculating profit/loss across multiple events — it's too much for spreadsheets.
            </p>
          </div>
          <div className="space-y-4">
            {['Real-time financial dashboards', 'Role-based access for 7 user types', 'Accept Card, Cash, E-transfer, PayPal & Interac', 'Automated receipts & confirmations'].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="card flex items-center gap-4"
              >
                <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0" />
                <span className="text-sm font-medium text-text">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Features */}
      <Section className="py-24">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-brand uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl font-bold text-text">Everything you need to run a successful expo</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="card"
            >
              <f.icon className="w-8 h-8 text-brand mb-4" />
              <h3 className="text-base font-semibold text-text mb-2">{f.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Dashboard Preview */}
      <Section className="py-24">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-brand uppercase tracking-wider mb-3">Dashboard Preview</p>
          <h2 className="text-3xl font-bold text-text">Your command center at a glance</h2>
        </div>
        <div className="card p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="bg-surface rounded-xl p-5 text-center"
              >
                <p className="text-xs text-text-faint mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-text">{s.value}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="bg-surface rounded-xl p-4 h-32 flex items-end">
                <div className="flex items-end gap-1 w-full h-full">
                  {[40, 65, 50, 80, 55, 70, 90].map((h, j) => (
                    <motion.div
                      key={j}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: j * 0.05 + i * 0.15, duration: 0.5 }}
                      className="flex-1 rounded-sm"
                      style={{ backgroundColor: i === 0 ? '#e85d04' : i === 1 ? '#3b82f6' : '#10b981', opacity: 0.7 + j * 0.04 }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-text mb-4">Ready to take control?</h2>
          <p className="text-text-muted mb-10 text-lg">Start managing your expo like a professional.</p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => navigate(user ? '/dashboard' : '/register')} className="btn-primary text-base px-10 py-4 rounded-xl">
              Create Free Account →
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary text-base px-10 py-4 rounded-xl">
              Demo Login
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <p className="text-sm text-text-faint">© 2025 Hot Rides Expo Management System</p>
      </footer>
    </div>
  );
}
