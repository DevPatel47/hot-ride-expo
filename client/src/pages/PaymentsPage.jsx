import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ registrationID: '', method: 'Card', transactionRef: '' });

  const load = () => {
    Promise.all([api.get('/payments'), api.get('/registrations')])
      .then(([paymentsResponse, registrationsResponse]) => {
        setPayments(paymentsResponse.data);
        setRegistrations(registrationsResponse.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const pendingRegistrations = registrations.filter((registration) => registration.registrationStatus === 'Pending');
  const selectedRegistration = pendingRegistrations.find((registration) => registration._id === form.registrationID);
  const selectedRegistrationFee = Number(selectedRegistration?.eventID?.registrationFee ?? 75);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', form);
      toast.success('Payment recorded - Registration confirmed');
      setShowModal(false);
      setForm({ registrationID: '', method: 'Card', transactionRef: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const methodBadge = (method) => {
    const styles = { Card: 'badge-info', Cash: 'badge-success', 'E-transfer': 'badge-neutral' };
    return <span className={`badge ${styles[method]}`}>{method}</span>;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Payments</h1>
          <p className="text-sm text-text-muted mt-1">Record and track payments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Record Payment</button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-surface/50">
            <th className="text-left py-3 px-5 text-xs font-medium text-text-faint">Registrant</th>
            <th className="text-left py-3 px-5 text-xs font-medium text-text-faint">Event</th>
            <th className="text-left py-3 px-5 text-xs font-medium text-text-faint">Amount</th>
            <th className="text-left py-3 px-5 text-xs font-medium text-text-faint">Method</th>
            <th className="text-left py-3 px-5 text-xs font-medium text-text-faint">Ref</th>
            <th className="text-left py-3 px-5 text-xs font-medium text-text-faint">Date</th>
          </tr></thead>
          <tbody>
            {payments.map((payment, index) => (
              <motion.tr key={payment._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className="border-b border-border/50 hover:bg-surface/30">
                <td className="py-3 px-5 text-text">{payment.registrationID?.vehicleID?.registrantID?.name || '-'}</td>
                <td className="py-3 px-5 text-text-muted">{payment.registrationID?.eventID?.eventName || '-'}</td>
                <td className="py-3 px-5 text-brand font-semibold">${Number(payment.amount).toLocaleString()}</td>
                <td className="py-3 px-5">{methodBadge(payment.method)}</td>
                <td className="py-3 px-5 text-text-faint font-mono text-xs">{payment.transactionRef}</td>
                <td className="py-3 px-5 text-text-faint">{new Date(payment.paymentDate).toLocaleDateString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <p className="text-sm text-text-faint text-center py-8">No payments</p>}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="card w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-text mb-5">Record Payment</h2>
              {pendingRegistrations.length === 0 ? <p className="text-text-muted text-sm">No pending registrations.</p> : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Registration (Pending)</label>
                    <select className="input-field" value={form.registrationID} onChange={(e) => setForm({ ...form, registrationID: e.target.value })} required>
                      <option value="">Select</option>
                      {pendingRegistrations.map((registration) => <option key={registration._id} value={registration._id}>{registration.vehicleID?.registrantID?.name} - {registration.vehicleID?.year} {registration.vehicleID?.make} {registration.vehicleID?.model} ({registration.eventID?.eventName})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Registration Fee</label>
                      <div className="input-field flex items-center">${selectedRegistrationFee.toLocaleString()}</div>
                    </div>
                    <div>
                      <label className="block text-xs text-text-muted mb-1">Method</label>
                      <select className="input-field" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                        <option value="Card">Card</option>
                        <option value="Cash">Cash</option>
                        <option value="E-transfer">E-transfer</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-text-muted mb-1">Transaction Ref</label>
                    <input className="input-field" placeholder="TXN-2025-XXX" value={form.transactionRef} onChange={(e) => setForm({ ...form, transactionRef: e.target.value })} required />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" className="btn-primary flex-1">Record Payment</button>
                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
