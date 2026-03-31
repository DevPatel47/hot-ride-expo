import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [eventVendors, setEventVendors] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [vForm, setVForm] = useState({ name: '', contactEmail: '', phone: '' });
  const [aForm, setAForm] = useState({ eventID: '', vendorID: '', boothNumber: '', amountPaid: '' });

  const load = () => {
    Promise.all([api.get('/vendors'), api.get('/vendors/event-vendors'), api.get('/events')])
      .then(([v, ev, e]) => { setVendors(v.data); setEventVendors(ev.data); setEvents(e.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleVendor = async (e) => { e.preventDefault(); try { await api.post('/vendors', vForm); toast.success('Vendor added'); setModal(null); setVForm({ name: '', contactEmail: '', phone: '' }); load(); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } };
  const handleAssign = async (e) => { e.preventDefault(); try { await api.post('/vendors/event-vendors', { ...aForm, amountPaid: Number(aForm.amountPaid) }); toast.success('Assigned'); setModal(null); setAForm({ eventID: '', vendorID: '', boothNumber: '', amountPaid: '' }); load(); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-text">Vendors</h1><p className="text-sm text-text-muted mt-1">Manage vendors and booth assignments</p></div>
        <div className="flex gap-2"><button onClick={() => setModal('vendor')} className="btn-primary text-xs">+ Vendor</button><button onClick={() => setModal('assign')} className="btn-secondary text-xs">+ Assign Booth</button></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vendors.map((v, i) => (
          <motion.div key={v._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card">
            <h3 className="text-base font-semibold text-text mb-1">{v.name}</h3>
            <p className="text-xs text-text-faint">{v.contactEmail} · {v.phone}</p>
          </motion.div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-border"><h3 className="text-sm font-semibold text-text">Booth Assignments</h3></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-surface/50"><th className="text-left py-3 px-5 text-xs text-text-faint font-medium">Vendor</th><th className="text-left py-3 px-5 text-xs text-text-faint font-medium">Event</th><th className="text-left py-3 px-5 text-xs text-text-faint font-medium">Booth</th><th className="text-right py-3 px-5 text-xs text-text-faint font-medium">Paid</th></tr></thead>
          <tbody>{eventVendors.map((ev, i) => <tr key={i} className="border-b border-border/50"><td className="py-3 px-5 text-text">{ev.vendorID?.name}</td><td className="py-3 px-5 text-text-muted">{ev.eventID?.eventName}</td><td className="py-3 px-5"><span className="badge badge-neutral font-mono">{ev.boothNumber}</span></td><td className="py-3 px-5 text-right text-brand font-medium">${ev.amountPaid?.toLocaleString()}</td></tr>)}</tbody>
        </table>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
              {modal === 'vendor' && <><h2 className="text-lg font-bold text-text mb-5">Add Vendor</h2><form onSubmit={handleVendor} className="space-y-4"><div><label className="block text-xs text-text-muted mb-1">Name</label><input className="input-field" value={vForm.name} onChange={e => setVForm({ ...vForm, name: e.target.value })} required /></div><div><label className="block text-xs text-text-muted mb-1">Email</label><input type="email" className="input-field" value={vForm.contactEmail} onChange={e => setVForm({ ...vForm, contactEmail: e.target.value })} required /></div><div><label className="block text-xs text-text-muted mb-1">Phone</label><input className="input-field" value={vForm.phone} onChange={e => setVForm({ ...vForm, phone: e.target.value })} required /></div><div className="flex gap-3 pt-1"><button type="submit" className="btn-primary flex-1">Add</button><button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button></div></form></>}
              {modal === 'assign' && <><h2 className="text-lg font-bold text-text mb-5">Assign Booth</h2><form onSubmit={handleAssign} className="space-y-4"><div><label className="block text-xs text-text-muted mb-1">Event</label><select className="input-field" value={aForm.eventID} onChange={e => setAForm({ ...aForm, eventID: e.target.value })} required><option value="">Select</option>{events.map(ev => <option key={ev._id} value={ev._id}>{ev.eventName}</option>)}</select></div><div><label className="block text-xs text-text-muted mb-1">Vendor</label><select className="input-field" value={aForm.vendorID} onChange={e => setAForm({ ...aForm, vendorID: e.target.value })} required><option value="">Select</option>{vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}</select></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-xs text-text-muted mb-1">Booth #</label><input className="input-field" placeholder="A-01" value={aForm.boothNumber} onChange={e => setAForm({ ...aForm, boothNumber: e.target.value })} required /></div><div><label className="block text-xs text-text-muted mb-1">Amount ($)</label><input type="number" className="input-field" value={aForm.amountPaid} onChange={e => setAForm({ ...aForm, amountPaid: e.target.value })} required /></div></div><div className="flex gap-3 pt-1"><button type="submit" className="btn-primary flex-1">Assign</button><button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button></div></form></>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
