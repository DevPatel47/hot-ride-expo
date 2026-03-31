import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineX, HiOutlineOfficeBuilding } from 'react-icons/hi';

export default function MySponsorshipsPage() {
  const [data, setData] = useState({ sponsor: null, sponsorships: [], packages: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [payMethod, setPayMethod] = useState('Card');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    api.get('/sponsors/my').then(res => setData(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handlePurchase = async (e) => {
    e.preventDefault();
    if (!selectedPkg) return;
    setSubmitting(true);
    try {
      // Create event sponsor
      await api.post('/sponsors/event-sponsors', {
        packageID: selectedPkg._id,
        amountPaid: selectedPkg.basePrice
      });
      // Create payment
      const ref = 'SP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
      await api.post('/payments', {
        method: payMethod,
        amount: selectedPkg.basePrice,
        transactionRef: ref,
        paymentType: 'sponsorship'
      });
      toast.success('Sponsorship purchased successfully!');
      setShowModal(false);
      setSelectedPkg(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  // Group available packages by event
  const eventPackages = {};
  data.packages.forEach(pkg => {
    if (pkg.eventID?.status === 'Open') {
      const eid = pkg.eventID._id;
      if (!eventPackages[eid]) eventPackages[eid] = { event: pkg.eventID, packages: [] };
      eventPackages[eid].packages.push(pkg);
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">My Sponsorships</h1>
        <p className="text-sm text-text-muted mt-1">View your sponsorship packages and purchase new ones</p>
      </div>

      {/* Current sponsorships */}
      {data.sponsorships.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Active Sponsorships</h2>
          <div className="grid gap-3">
            {data.sponsorships.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text">{s.packageID?.packageName}</p>
                    <p className="text-xs text-text-muted mt-1">{s.packageID?.eventID?.eventName}</p>
                    <p className="text-xs text-text-faint mt-0.5">{s.packageID?.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-400">${s.amountPaid.toLocaleString()}</p>
                    <span className="badge badge-success text-[10px]">Active</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <HiOutlineOfficeBuilding className="w-12 h-12 text-text-faint mx-auto mb-4" />
          <p className="text-text-muted">No active sponsorships. Browse available packages below.</p>
        </div>
      )}

      {/* Available packages */}
      <div>
        <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Available Packages</h2>
        {Object.values(eventPackages).map((group, gi) => (
          <div key={gi} className="mb-6">
            <p className="text-xs font-medium text-brand mb-2">{group.event.eventName} — {new Date(group.event.date).toLocaleDateString()}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.packages.map((pkg, pi) => (
                <motion.div key={pkg._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.05 }}
                  className="card hover:border-purple-500/30 transition-colors cursor-pointer group" onClick={() => { setSelectedPkg(pkg); setShowModal(true); }}>
                  <p className="text-sm font-semibold text-text group-hover:text-purple-400 transition-colors">{pkg.packageName}</p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">{pkg.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-lg font-bold text-brand">${pkg.basePrice.toLocaleString()}</p>
                    <span className="text-xs text-text-faint group-hover:text-purple-400 transition-colors">Select →</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Purchase modal */}
      <AnimatePresence>
        {showModal && selectedPkg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card w-full max-w-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text">Purchase Package</h2>
                <button onClick={() => setShowModal(false)} className="text-text-faint hover:text-text"><HiOutlineX className="w-5 h-5" /></button>
              </div>
              <div className="bg-surface rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-text">{selectedPkg.packageName}</p>
                <p className="text-xs text-text-muted mt-1">{selectedPkg.eventID?.eventName}</p>
                <p className="text-xs text-text-faint mt-0.5">{selectedPkg.description}</p>
                <p className="text-xl font-bold text-brand mt-3">${selectedPkg.basePrice.toLocaleString()}</p>
              </div>
              <form onSubmit={handlePurchase} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">Payment Method</label>
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="input-field">
                    {['Card', 'Cash', 'E-transfer', 'PayPal', 'Interac'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Processing…' : `Pay $${selectedPkg.basePrice.toLocaleString()}`}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
