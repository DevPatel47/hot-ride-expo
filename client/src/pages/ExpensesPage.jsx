import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterEvent, setFilterEvent] = useState('');
  const [form, setForm] = useState({ eventID: '', description: '', amount: '', expenseDate: '' });

  const load = () => {
    Promise.all([api.get('/expenses'), api.get('/events')])
      .then(([e, ev]) => { setExpenses(e.data); setEvents(ev.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = filterEvent ? expenses.filter(e => e.eventID?._id === filterEvent) : expenses;
  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('/expenses', { ...form, amount: Number(form.amount) }); toast.success('Expense recorded'); setShowModal(false); setForm({ eventID: '', description: '', amount: '', expenseDate: '' }); load(); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } };
  const handleDelete = async (id) => { try { await api.delete(`/expenses/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Failed'); } };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-text">Expenses</h1><p className="text-sm text-text-muted mt-1">Track event expenses</p></div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Expense</button>
      </div>

      <div className="flex items-center gap-4">
        <select className="input-field w-auto" value={filterEvent} onChange={e => setFilterEvent(e.target.value)}><option value="">All Events</option>{events.map(ev => <option key={ev._id} value={ev._id}>{ev.eventName}</option>)}</select>
        <div className="card py-2 px-4"><span className="text-xs text-text-faint">Total: </span><span className="text-sm font-semibold text-danger">${total.toLocaleString()}</span></div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-surface/50"><th className="text-left py-3 px-5 text-xs text-text-faint font-medium">Description</th><th className="text-left py-3 px-5 text-xs text-text-faint font-medium">Event</th><th className="text-left py-3 px-5 text-xs text-text-faint font-medium">Date</th><th className="text-right py-3 px-5 text-xs text-text-faint font-medium">Amount</th><th className="py-3 px-5"></th></tr></thead>
          <tbody>{filtered.map((e, i) => <motion.tr key={e._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-border/50 hover:bg-surface/30"><td className="py-3 px-5 text-text">{e.description}</td><td className="py-3 px-5 text-text-muted">{e.eventID?.eventName}</td><td className="py-3 px-5 text-text-faint">{new Date(e.expenseDate).toLocaleDateString()}</td><td className="py-3 px-5 text-right text-danger font-medium">${e.amount?.toLocaleString()}</td><td className="py-3 px-5 text-right"><button onClick={() => handleDelete(e._id)} className="text-xs text-text-faint hover:text-danger transition-colors">Delete</button></td></motion.tr>)}</tbody>
        </table>
        {filtered.length === 0 && <p className="text-sm text-text-faint text-center py-8">No expenses</p>}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-text mb-5">Add Expense</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-xs text-text-muted mb-1">Event</label><select className="input-field" value={form.eventID} onChange={e => setForm({ ...form, eventID: e.target.value })} required><option value="">Select</option>{events.map(ev => <option key={ev._id} value={ev._id}>{ev.eventName}</option>)}</select></div>
                <div><label className="block text-xs text-text-muted mb-1">Description</label><input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-text-muted mb-1">Amount ($)</label><input type="number" className="input-field" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required /></div>
                  <div><label className="block text-xs text-text-muted mb-1">Date</label><input type="date" className="input-field" value={form.expenseDate} onChange={e => setForm({ ...form, expenseDate: e.target.value })} required /></div>
                </div>
                <div className="flex gap-3 pt-1"><button type="submit" className="btn-primary flex-1">Add</button><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button></div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
