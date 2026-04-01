import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import {
  HiOutlineCurrencyDollar, HiOutlineGift, HiOutlineReceiptTax, HiOutlineTrendingUp,
  HiOutlineClock, HiOutlineCalendar, HiOutlineTicket, HiOutlineTruck, HiOutlineUserGroup, HiOutlineHeart
} from 'react-icons/hi';

function CountUp({ target, prefix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.floor(target / 40));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 25);
    return () => clearInterval(timer);
  }, [target]);
  return <>{prefix}{val.toLocaleString()}</>;
}

const fade = (i) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.07, duration: 0.45 } });
const tooltipStyle = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', padding: '8px 12px', color: '#f1f5f9', fontSize: '12px' };
const PIE_COLORS = ['#e85d04', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

// === ADMIN DASHBOARD ===
function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [profitLoss, setProfitLoss] = useState([]);
  const [pending, setPending] = useState([]);
  const [overview, setOverview] = useState({ organizers: [], recentEvents: [], organizersCount: 0, activeOrganizers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard'),
      api.get('/reports/profit-loss'),
      api.get('/reports/pending-payments'),
      api.get('/reports/admin-overview')
    ]).then(([s, pl, p, o]) => {
      setSummary(s.data);
      setProfitLoss(pl.data);
      setPending(p.data);
      setOverview(o.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const stats = [
    { icon: HiOutlineUserGroup, label: 'Organizers', value: overview.organizersCount || 0, color: 'text-info' },
    { icon: HiOutlineCalendar, label: 'Active Organizers', value: overview.activeOrganizers || 0, color: 'text-success' },
    { icon: HiOutlineCalendar, label: 'Events', value: summary?.totalEvents || 0, color: 'text-brand' },
    { icon: HiOutlineTicket, label: 'Registrations', value: summary?.totalRegistrations || 0, color: 'text-purple-400' },
    { icon: HiOutlineCurrencyDollar, label: 'Revenue', value: summary?.totalRevenue || 0, prefix: '$', color: 'text-brand' },
    { icon: HiOutlineClock, label: 'Pending', value: summary?.pendingPayments || 0, color: 'text-warning' },
  ];

  const organizerChartData = overview.organizers.slice(0, 6).map((organizer) => ({
    name: organizer.name.split(' ')[0],
    revenue: organizer.totalRevenue,
    events: organizer.totalEvents,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">System-wide oversight across organizers, events, and revenue</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} {...fade(i)} className="card">
            <div className="flex items-center gap-2 mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-xs text-text-faint">{s.label}</span>
            </div>
            <p className={`text-xl font-bold ${s.color}`}><CountUp target={s.value} prefix={s.prefix} /></p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fade(6)} className="card">
          <h3 className="text-sm font-semibold text-text mb-5">Profit / Loss by Event</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitLoss} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="eventName" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="profitLoss" fill="#10b981" radius={[4, 4, 0, 0]} name="Net P/L" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div {...fade(7)} className="card">
          <h3 className="text-sm font-semibold text-text mb-5">Top Organizer Revenue</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={organizerChartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="events" fill="#e85d04" radius={[4, 4, 0, 0]} name="Events" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fade(8)} className="card">
          <h3 className="text-sm font-semibold text-text mb-4">Organizer Roster</h3>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {overview.organizers.map((organizer) => (
              <div key={organizer._id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-text">{organizer.name}</p>
                    <p className="text-xs text-text-muted">{organizer.email}</p>
                    <p className="text-xs text-text-faint mt-1">{organizer.phone || 'No phone on file'}</p>
                  </div>
                  <span className={`badge ${organizer.totalEvents > 0 ? 'badge-success' : 'badge-neutral'}`}>
                    {organizer.totalEvents > 0 ? 'Active' : 'No Events'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div>
                    <p className="text-text-faint">Events</p>
                    <p className="text-text font-medium">{organizer.totalEvents} total / {organizer.openEvents} open</p>
                  </div>
                  <div>
                    <p className="text-text-faint">Registrations</p>
                    <p className="text-text font-medium">{organizer.totalRegistrations} total / {organizer.pendingRegistrations} pending</p>
                  </div>
                  <div>
                    <p className="text-text-faint">Revenue</p>
                    <p className="text-brand font-semibold">${organizer.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-text-faint">Latest Event</p>
                    <p className="text-text font-medium">{organizer.latestEventName || 'None yet'}</p>
                  </div>
                </div>
              </div>
            ))}
            {overview.organizers.length === 0 && <p className="text-sm text-text-faint text-center py-8">No organizers yet</p>}
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div {...fade(9)} className="card">
            <h3 className="text-sm font-semibold text-text mb-4">Recent Events</h3>
            <div className="space-y-3">
              {overview.recentEvents.map((event) => (
                <div key={event._id} className="flex items-center justify-between gap-3 rounded-xl bg-surface p-3">
                  <div>
                    <p className="text-sm font-medium text-text">{event.eventName}</p>
                    <p className="text-xs text-text-muted">{event.organizerName} | ${Number(event.registrationFee ?? 75).toLocaleString()}</p>
                    <p className="text-xs text-text-faint">{new Date(event.date).toLocaleDateString()} | {event.location}</p>
                  </div>
                  <span className={`badge ${event.status === 'Open' ? 'badge-success' : event.status === 'Closed' ? 'badge-neutral' : 'badge-danger'}`}>
                    {event.status}
                  </span>
                </div>
              ))}
              {overview.recentEvents.length === 0 && <p className="text-sm text-text-faint text-center py-6">No events found</p>}
            </div>
          </motion.div>

          {pending.length > 0 && (
            <motion.div {...fade(10)} className="card">
              <h3 className="text-sm font-semibold text-text mb-4">Pending Registrations ({pending.length})</h3>
              <div className="space-y-3">
                {pending.slice(0, 5).map((registration, index) => (
                  <div key={index} className="rounded-xl bg-surface p-3">
                    <p className="text-sm font-medium text-text">{registration.vehicleID?.registrantID?.name}</p>
                    <p className="text-xs text-text-muted">{registration.eventID?.eventName}</p>
                    <p className="text-xs text-text-faint">{registration.vehicleID?.year} {registration.vehicleID?.make} {registration.vehicleID?.model}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// === ORGANIZER DASHBOARD ===
function OrganizerDashboard() {
  const [summary, setSummary] = useState(null);
  const [profitLoss, setProfitLoss] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/reports/dashboard'),
      api.get('/reports/profit-loss'),
      api.get('/reports/pending-payments')
    ]).then(([s, pl, p]) => {
      setSummary(s.data); setProfitLoss(pl.data); setPending(p.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const stats = [
    { icon: HiOutlineCurrencyDollar, label: 'Total Revenue', value: summary?.totalRevenue || 0, prefix: '$', color: 'text-brand' },
    { icon: HiOutlineGift, label: 'Donations', value: summary?.totalDonations || 0, prefix: '$', color: 'text-info' },
    { icon: HiOutlineReceiptTax, label: 'Expenses', value: summary?.totalExpenses || 0, prefix: '$', color: 'text-danger' },
    { icon: HiOutlineTrendingUp, label: 'Net Profit', value: summary?.profitLoss || 0, prefix: '$', color: 'text-success' },
    { icon: HiOutlineClock, label: 'Pending', value: summary?.pendingPayments || 0, color: 'text-warning' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Organizer Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Financial overview for the events you organize</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} {...fade(i)} className="card">
            <div className="flex items-center gap-2 mb-3">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-xs text-text-faint">{s.label}</span>
            </div>
            <p className={`text-xl font-bold ${s.color}`}><CountUp target={s.value} prefix={s.prefix} /></p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fade(5)} className="card">
          <h3 className="text-sm font-semibold text-text mb-5">Revenue & Donations by Event</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitLoss} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="eventName" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="revenue" fill="#e85d04" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="donations" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Donations" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div {...fade(6)} className="card">
          <h3 className="text-sm font-semibold text-text mb-5">Profit / Loss by Event</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitLoss} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="eventName" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="profitLoss" fill="#10b981" radius={[4, 4, 0, 0]} name="Net P/L" />
                <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {pending.length > 0 && (
        <motion.div {...fade(7)} className="card">
          <h3 className="text-sm font-semibold text-text mb-4">Pending Registrations ({pending.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Registrant</th>
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Vehicle</th>
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Event</th>
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Status</th>
              </tr></thead>
              <tbody>
                {pending.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2.5 text-text">{r.vehicleID?.registrantID?.name}</td>
                    <td className="py-2.5 text-text-muted">{r.vehicleID?.year} {r.vehicleID?.make} {r.vehicleID?.model}</td>
                    <td className="py-2.5 text-text-muted">{r.eventID?.eventName}</td>
                    <td className="py-2.5"><span className="badge badge-warning">Pending</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// === REGISTRANT DASHBOARD ===
function RegistrantDashboard() {
  const [regs, setRegs] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/registrations/my'),
      api.get('/events')
    ]).then(([r, e]) => {
      setRegs(r.data);
      setEvents(e.data.filter(ev => ev.status === 'Open'));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const confirmed = regs.filter(r => r.registrationStatus === 'Confirmed').length;
  const pending = regs.filter(r => r.registrationStatus === 'Pending').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Welcome Back!</h1>
        <p className="text-sm text-text-muted mt-1">Your registration overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div {...fade(0)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineTicket className="w-5 h-5 text-brand" /><span className="text-xs text-text-faint">Total</span></div>
          <p className="text-xl font-bold text-brand"><CountUp target={regs.length} /></p>
        </motion.div>
        <motion.div {...fade(1)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineTrendingUp className="w-5 h-5 text-success" /><span className="text-xs text-text-faint">Confirmed</span></div>
          <p className="text-xl font-bold text-success"><CountUp target={confirmed} /></p>
        </motion.div>
        <motion.div {...fade(2)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineClock className="w-5 h-5 text-warning" /><span className="text-xs text-text-faint">Pending</span></div>
          <p className="text-xl font-bold text-warning"><CountUp target={pending} /></p>
        </motion.div>
        <motion.div {...fade(3)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineCalendar className="w-5 h-5 text-info" /><span className="text-xs text-text-faint">Open Events</span></div>
          <p className="text-xl font-bold text-info"><CountUp target={events.length} /></p>
        </motion.div>
      </div>

      {regs.length > 0 && (
        <motion.div {...fade(4)} className="card">
          <h3 className="text-sm font-semibold text-text mb-4">Recent Registrations</h3>
          <div className="space-y-3">
            {regs.slice(0, 5).map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                <div>
                  <p className="text-sm font-medium text-text">{r.eventID?.eventName}</p>
                  <p className="text-xs text-text-muted">{r.vehicleID?.year} {r.vehicleID?.make} {r.vehicleID?.model}</p>
                </div>
                <span className={`badge ${r.registrationStatus === 'Confirmed' ? 'badge-success' : r.registrationStatus === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                  {r.registrationStatus}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// === SPONSOR DASHBOARD ===
function SponsorDashboard() {
  const [data, setData] = useState({ sponsor: null, sponsorships: [], packages: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sponsors/my').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const totalSpent = data.sponsorships.reduce((sum, s) => sum + s.amountPaid, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Sponsor Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">{data.sponsor?.name || 'Your'} sponsorship overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <motion.div {...fade(0)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineUserGroup className="w-5 h-5 text-purple-400" /><span className="text-xs text-text-faint">Sponsorships</span></div>
          <p className="text-xl font-bold text-purple-400"><CountUp target={data.sponsorships.length} /></p>
        </motion.div>
        <motion.div {...fade(1)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineCurrencyDollar className="w-5 h-5 text-brand" /><span className="text-xs text-text-faint">Total Invested</span></div>
          <p className="text-xl font-bold text-brand"><CountUp target={totalSpent} prefix="$" /></p>
        </motion.div>
        <motion.div {...fade(2)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineCalendar className="w-5 h-5 text-info" /><span className="text-xs text-text-faint">Available Packages</span></div>
          <p className="text-xl font-bold text-info"><CountUp target={data.packages.length} /></p>
        </motion.div>
      </div>

      {data.sponsorships.length > 0 && (
        <motion.div {...fade(3)} className="card">
          <h3 className="text-sm font-semibold text-text mb-4">Active Sponsorships</h3>
          <div className="space-y-3">
            {data.sponsorships.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                <div>
                  <p className="text-sm font-medium text-text">{s.packageID?.packageName}</p>
                  <p className="text-xs text-text-muted">{s.packageID?.eventID?.eventName}</p>
                </div>
                <span className="text-sm font-semibold text-brand">${s.amountPaid.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// === VENDOR DASHBOARD ===
function VendorDashboard() {
  const [data, setData] = useState({ vendor: null, booths: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vendors/my').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const totalPaid = data.booths.reduce((sum, b) => sum + b.amountPaid, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Vendor Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">{data.vendor?.name || 'Your'} booth overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <motion.div {...fade(0)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineTruck className="w-5 h-5 text-emerald-400" /><span className="text-xs text-text-faint">Booths</span></div>
          <p className="text-xl font-bold text-emerald-400"><CountUp target={data.booths.length} /></p>
        </motion.div>
        <motion.div {...fade(1)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineCurrencyDollar className="w-5 h-5 text-brand" /><span className="text-xs text-text-faint">Total Fees</span></div>
          <p className="text-xl font-bold text-brand"><CountUp target={totalPaid} prefix="$" /></p>
        </motion.div>
        <motion.div {...fade(2)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineCalendar className="w-5 h-5 text-info" /><span className="text-xs text-text-faint">Events</span></div>
          <p className="text-xl font-bold text-info"><CountUp target={new Set(data.booths.map(b => b.eventID?._id)).size} /></p>
        </motion.div>
      </div>

      {data.booths.length > 0 && (
        <motion.div {...fade(3)} className="card">
          <h3 className="text-sm font-semibold text-text mb-4">Booth Assignments</h3>
          <div className="space-y-3">
            {data.booths.map((b, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface rounded-xl">
                <div>
                  <p className="text-sm font-medium text-text">{b.eventID?.eventName}</p>
                  <p className="text-xs text-text-muted">Booth: {b.boothNumber}</p>
                </div>
                <span className="text-sm font-semibold text-brand">${b.amountPaid.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// === DONOR DASHBOARD ===
function DonorDashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/donations/my').then(res => setDonations(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const totalValue = donations.reduce((sum, d) => sum + d.estimatedValue, 0);
  const typeCounts = donations.reduce((acc, d) => { acc[d.donationType] = (acc[d.donationType] || 0) + 1; return acc; }, {});
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Donor Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Your donation history & impact</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <motion.div {...fade(0)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineHeart className="w-5 h-5 text-pink-400" /><span className="text-xs text-text-faint">Donations</span></div>
          <p className="text-xl font-bold text-pink-400"><CountUp target={donations.length} /></p>
        </motion.div>
        <motion.div {...fade(1)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineCurrencyDollar className="w-5 h-5 text-brand" /><span className="text-xs text-text-faint">Total Value</span></div>
          <p className="text-xl font-bold text-brand"><CountUp target={totalValue} prefix="$" /></p>
        </motion.div>
        <motion.div {...fade(2)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineCalendar className="w-5 h-5 text-info" /><span className="text-xs text-text-faint">Events Supported</span></div>
          <p className="text-xl font-bold text-info"><CountUp target={new Set(donations.map(d => d.eventID?._id)).size} /></p>
        </motion.div>
      </div>

      {pieData.length > 0 && (
        <motion.div {...fade(3)} className="card">
          <h3 className="text-sm font-semibold text-text mb-5">Donation Types</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// === STAFF DASHBOARD ===
function StaffDashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/pending-payments').then(res => setPending(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text">Staff Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Registration & payment queue</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div {...fade(0)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineClock className="w-5 h-5 text-warning" /><span className="text-xs text-text-faint">Awaiting Payment</span></div>
          <p className="text-xl font-bold text-warning"><CountUp target={pending.length} /></p>
        </motion.div>
        <motion.div {...fade(1)} className="card">
          <div className="flex items-center gap-2 mb-3"><HiOutlineTicket className="w-5 h-5 text-info" /><span className="text-xs text-text-faint">Today</span></div>
          <p className="text-xl font-bold text-info">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
        </motion.div>
      </div>

      {pending.length > 0 && (
        <motion.div {...fade(2)} className="card">
          <h3 className="text-sm font-semibold text-text mb-4">Pending Registrations ({pending.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Registrant</th>
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Vehicle</th>
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Event</th>
                <th className="text-left pb-2 text-xs text-text-faint font-medium">Status</th>
              </tr></thead>
              <tbody>
                {pending.map((r, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2.5 text-text">{r.vehicleID?.registrantID?.name}</td>
                    <td className="py-2.5 text-text-muted">{r.vehicleID?.year} {r.vehicleID?.make} {r.vehicleID?.model}</td>
                    <td className="py-2.5 text-text-muted">{r.eventID?.eventName}</td>
                    <td className="py-2.5"><span className="badge badge-warning">Pending</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;
}

// === MAIN DASHBOARD COMPONENT ===
export default function DashboardPage() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'admin': return <AdminDashboard />;
    case 'organizer': return <OrganizerDashboard />;
    case 'registrant': return <RegistrantDashboard />;
    case 'sponsor': return <SponsorDashboard />;
    case 'vendor': return <VendorDashboard />;
    case 'donor': return <DonorDashboard />;
    case 'staff': return <StaffDashboard />;
    default: return <AdminDashboard />;
  }
}
