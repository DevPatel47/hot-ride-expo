import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineCalendar,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineTicket,
  HiOutlineX,
} from 'react-icons/hi';

const emptyRegistrationForm = {
  vehicleMake: '',
  vehicleModel: '',
  vehicleYear: '',
  tShirtSize: 'L',
};

export default function BrowseEventsPage() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form, setForm] = useState(emptyRegistrationForm);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    Promise.all([api.get('/events'), api.get('/registrations/my')])
      .then(([eventsResponse, registrationsResponse]) => {
        setEvents(eventsResponse.data);
        setRegistrations(registrationsResponse.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSelectEvent = (event) => {
    if (event.status !== 'Open') return;
    setSelectedEvent(event);
    setForm(emptyRegistrationForm);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setSubmitting(true);
    try {
      await api.post('/registrations', {
        eventID: selectedEvent._id,
        ...form,
      });
      toast.success('Vehicle registered. Complete payment from My Registrations.');
      setSelectedEvent(null);
      setForm(emptyRegistrationForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  const openEvents = events.filter((event) => event.status === 'Open');
  const closedEvents = events.filter((event) => event.status !== 'Open');
  const registrationCounts = registrations.reduce((counts, registration) => {
    const eventId = registration.eventID?._id;
    if (!eventId) return counts;
    counts[eventId] = (counts[eventId] || 0) + 1;
    return counts;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Browse Events</h1>
        <p className="text-sm text-text-muted mt-1">Click any open event to register your vehicle right from this page</p>
      </div>

      {openEvents.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Open for Registration</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {openEvents.map((event, index) => {
              const registrationCount = registrationCounts[event._id] || 0;

              return (
                <motion.button
                  key={event._id}
                  type="button"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.07 }}
                  onClick={() => handleSelectEvent(event)}
                  className="card w-full text-left hover:border-brand/30 hover:-translate-y-0.5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-base font-semibold text-text group-hover:text-brand transition-colors">{event.eventName}</h3>
                    <span className="badge badge-success">Open</span>
                  </div>

                  {event.description && <p className="text-xs text-text-muted mb-3 leading-relaxed">{event.description}</p>}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <HiOutlineCalendar className="w-4 h-4 text-text-faint" />
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <HiOutlineLocationMarker className="w-4 h-4 text-text-faint" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <HiOutlineCurrencyDollar className="w-4 h-4 text-text-faint" />
                      Registration Fee: ${Number(event.registrationFee ?? 75).toLocaleString()}
                    </div>
                  </div>

                  {event.organizerID && (
                    <p className="text-[11px] text-text-faint mt-3">Organized by {event.organizerID.name}</p>
                  )}
                  {event.charityID && (
                    <p className="text-[11px] text-text-faint">Benefitting {event.charityID.charityName}</p>
                  )}

                  <div className="mt-4 rounded-xl border border-brand/15 bg-brand/5 px-3 py-2">
                    <p className="text-xs font-medium text-brand">
                      {registrationCount > 0
                        ? `You already have ${registrationCount} registration${registrationCount === 1 ? '' : 's'} for this event. Click to add another vehicle.`
                        : 'Click this event to register your first vehicle.'}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card text-center py-16">
          <HiOutlineTicket className="w-12 h-12 text-text-faint mx-auto mb-4" />
          <p className="text-text-muted">There are no open events right now.</p>
        </div>
      )}

      {closedEvents.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Past & Closed Events</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {closedEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                className="card opacity-70"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-medium text-text">{event.eventName}</h3>
                  <span className={`badge ${event.status === 'Closed' ? 'badge-neutral' : 'badge-danger'}`}>{event.status}</span>
                </div>
                <p className="text-xs text-text-muted">{new Date(event.date).toLocaleDateString()} | {event.location}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="card w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text">Register for Event</h2>
                <button onClick={() => setSelectedEvent(null)} className="text-text-faint hover:text-text"><HiOutlineX className="w-5 h-5" /></button>
              </div>

              <div className="bg-surface rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-text">{selectedEvent.eventName}</p>
                <p className="text-xs text-text-muted mt-1">{new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} | {selectedEvent.location}</p>
                <p className="text-xs text-brand mt-2">Registration Fee: ${Number(selectedEvent.registrationFee ?? 75).toLocaleString()}</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Make</label>
                    <input value={form.vehicleMake} onChange={(e) => setForm((prev) => ({ ...prev, vehicleMake: e.target.value }))} className="input-field" placeholder="Ford" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Model</label>
                    <input value={form.vehicleModel} onChange={(e) => setForm((prev) => ({ ...prev, vehicleModel: e.target.value }))} className="input-field" placeholder="Mustang" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-muted mb-1.5">Year</label>
                    <input type="number" value={form.vehicleYear} onChange={(e) => setForm((prev) => ({ ...prev, vehicleYear: e.target.value }))} className="input-field" placeholder="1969" required />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1.5">T-Shirt Size</label>
                  <select value={form.tShirtSize} onChange={(e) => setForm((prev) => ({ ...prev, tShirtSize: e.target.value }))} className="input-field">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => <option key={size} value={size}>{size}</option>)}
                  </select>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? 'Registering...' : 'Register Vehicle'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
