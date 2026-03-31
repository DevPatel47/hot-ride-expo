import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineCurrencyDollar } from 'react-icons/hi';

export default function BrowseEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events').then(res => setEvents(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;

  const openEvents = events.filter(e => e.status === 'Open');
  const closedEvents = events.filter(e => e.status !== 'Open');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Browse Events</h1>
        <p className="text-sm text-text-muted mt-1">Find upcoming events to register for</p>
      </div>

      {openEvents.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Open for Registration</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {openEvents.map((ev, i) => (
              <motion.div key={ev._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="card hover:border-brand/30 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-text group-hover:text-brand transition-colors">{ev.eventName}</h3>
                  <span className="badge badge-success">Open</span>
                </div>
                {ev.description && <p className="text-xs text-text-muted mb-3 leading-relaxed">{ev.description}</p>}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <HiOutlineCalendar className="w-4 h-4 text-text-faint" />
                    {new Date(ev.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <HiOutlineLocationMarker className="w-4 h-4 text-text-faint" />
                    {ev.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <HiOutlineCurrencyDollar className="w-4 h-4 text-text-faint" />
                    Registration Fee: ${ev.registrationFee || 75}
                  </div>
                </div>
                {ev.organizerID && (
                  <p className="text-[11px] text-text-faint mt-3">Organized by {ev.organizerID.name}</p>
                )}
                {ev.charityID && (
                  <p className="text-[11px] text-text-faint">Benefitting {ev.charityID.charityName}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {closedEvents.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">Past & Closed Events</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {closedEvents.map((ev, i) => (
              <motion.div key={ev._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="card opacity-70">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-medium text-text">{ev.eventName}</h3>
                  <span className={`badge ${ev.status === 'Closed' ? 'badge-neutral' : 'badge-danger'}`}>{ev.status}</span>
                </div>
                <p className="text-xs text-text-muted">{new Date(ev.date).toLocaleDateString()} • {ev.location}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
