import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const tt = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '8px 12px', color: '#f1f5f9', fontSize: '12px' };
const fade = (i) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.06, duration: 0.4 } });

export default function ReportsPage() {
  const [events, setEvents] = useState([]);
  const [sel, setSel] = useState('');
  const [revenue, setRevenue] = useState([]);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [profitLoss, setProfitLoss] = useState([]);
  const [pending, setPending] = useState([]);
  const [sponsorBreak, setSponsorBreak] = useState([]);
  const [vendorBreak, setVendorBreak] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/events'), api.get('/reports/revenue'), api.get('/reports/donations'),
      api.get('/reports/expenses'), api.get('/reports/profit-loss'), api.get('/reports/pending-payments'),
      api.get('/reports/sponsor-breakdown'), api.get('/reports/vendor-breakdown')
    ]).then(([e, r, d, ex, pl, p, sb, vb]) => {
      setEvents(e.data); setRevenue(r.data); setDonations(d.data); setExpenses(ex.data);
      setProfitLoss(pl.data); setPending(p.data); setSponsorBreak(sb.data); setVendorBreak(vb.data);
    }).finally(() => setLoading(false));
  }, []);

  const f = (data) => sel ? data.filter(d => d.eventID === sel) : data;
  const fp = () => sel ? pending.filter(p => p.eventID?._id === sel) : pending;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  const pl = f(profitLoss);
  const tRev = pl.reduce((s, d) => s + d.revenue, 0);
  const tDon = pl.reduce((s, d) => s + d.donations, 0);
  const tExp = pl.reduce((s, d) => s + d.expenses, 0);
  const tPL = pl.reduce((s, d) => s + d.profitLoss, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-text">Reports</h1><p className="text-sm text-text-muted mt-1">Financial analytics & breakdowns</p></div>
        <select className="input-field w-auto" value={sel} onChange={e => setSel(e.target.value)}>
          <option value="">All Events</option>
          {events.map(ev => <option key={ev._id} value={ev._id}>{ev.eventName}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Revenue', v: tRev, c: 'text-brand' },
          { l: 'Donations', v: tDon, c: 'text-info' },
          { l: 'Expenses', v: tExp, c: 'text-danger' },
          { l: 'Net P/L', v: tPL, c: tPL >= 0 ? 'text-success' : 'text-danger' },
        ].map((s, i) => (
          <motion.div key={i} {...fade(i)} className="card">
            <p className="text-xs text-text-faint mb-1">{s.l}</p>
            <p className={`text-xl font-bold ${s.c}`}>${s.v.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fade(4)} className="card">
          <h3 className="text-sm font-semibold text-text mb-5">Revenue Breakdown</h3>
          <div className="h-56"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={f(revenue)} barGap={2}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="eventName" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tt} cursor={{ fill: 'rgba(255,255,255,0.03)' }} /><Bar dataKey="totalRevenue" fill="#e85d04" radius={[4, 4, 0, 0]} name="Revenue" /></BarChart>
          </ResponsiveContainer></div>
        </motion.div>
        <motion.div {...fade(5)} className="card">
          <h3 className="text-sm font-semibold text-text mb-5">Donation Summary</h3>
          <div className="h-56"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={f(donations)} barGap={2}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="eventName" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tt} cursor={{ fill: 'rgba(255,255,255,0.03)' }} /><Bar dataKey="totalDonations" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Donations" /></BarChart>
          </ResponsiveContainer></div>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fade(6)} className="card">
          <h3 className="text-sm font-semibold text-text mb-5">Expense Summary</h3>
          <div className="h-56"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={f(expenses)} barGap={2}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="eventName" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tt} cursor={{ fill: 'rgba(255,255,255,0.03)' }} /><Bar dataKey="totalExpenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" /></BarChart>
          </ResponsiveContainer></div>
        </motion.div>
        <motion.div {...fade(7)} className="card">
          <h3 className="text-sm font-semibold text-text mb-5">Profit / Loss</h3>
          <div className="h-56"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={pl} barGap={2}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" /><XAxis dataKey="eventName" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tt} cursor={{ fill: 'rgba(255,255,255,0.03)' }} /><Bar dataKey="revenue" fill="#e85d04" radius={[4, 4, 0, 0]} name="Revenue" /><Bar dataKey="donations" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Donations" /><Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" /><Bar dataKey="profitLoss" fill="#10b981" radius={[4, 4, 0, 0]} name="Net P/L" /></BarChart>
          </ResponsiveContainer></div>
        </motion.div>
      </div>

      {/* Sponsor & Vendor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fade(8)} className="card">
          <h3 className="text-sm font-semibold text-text mb-4">Sponsor Revenue</h3>
          <table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left py-2 text-xs text-text-faint">Sponsor</th><th className="text-left py-2 text-xs text-text-faint">Event</th><th className="text-right py-2 text-xs text-text-faint">Paid</th></tr></thead>
          <tbody>{sponsorBreak.map((s, i) => <tr key={i} className="border-b border-border/50"><td className="py-2 text-text">{s.sponsorName}</td><td className="py-2 text-text-muted">{s.eventName}</td><td className="py-2 text-right text-brand font-medium">${s.totalPaid.toLocaleString()}</td></tr>)}</tbody></table>
        </motion.div>
        <motion.div {...fade(9)} className="card">
          <h3 className="text-sm font-semibold text-text mb-4">Vendor Revenue</h3>
          <table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left py-2 text-xs text-text-faint">Vendor</th><th className="text-left py-2 text-xs text-text-faint">Event</th><th className="text-right py-2 text-xs text-text-faint">Paid</th></tr></thead>
          <tbody>{vendorBreak.map((v, i) => <tr key={i} className="border-b border-border/50"><td className="py-2 text-text">{v.vendorName}</td><td className="py-2 text-text-muted">{v.eventName}</td><td className="py-2 text-right text-brand font-medium">${v.totalPaid.toLocaleString()}</td></tr>)}</tbody></table>
        </motion.div>
      </div>

      {/* Unpaid */}
      <motion.div {...fade(10)} className="card">
        <h3 className="text-sm font-semibold text-text mb-4">Unpaid Registrations ({fp().length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-left py-2 text-xs text-text-faint">Registrant</th><th className="text-left py-2 text-xs text-text-faint">Vehicle</th><th className="text-left py-2 text-xs text-text-faint">Event</th><th className="text-left py-2 text-xs text-text-faint">Status</th></tr></thead>
          <tbody>{fp().map((r, i) => <tr key={i} className="border-b border-border/50"><td className="py-2 text-text">{r.vehicleID?.registrantID?.name}</td><td className="py-2 text-text-muted">{r.vehicleID?.year} {r.vehicleID?.make} {r.vehicleID?.model}</td><td className="py-2 text-text-muted">{r.eventID?.eventName}</td><td className="py-2"><span className="badge badge-warning">Pending</span></td></tr>)}</tbody></table>
          {fp().length === 0 && <p className="text-sm text-text-faint text-center py-6">All confirmed</p>}
        </div>
      </motion.div>
    </div>
  );
}
