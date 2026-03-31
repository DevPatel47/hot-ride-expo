import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import {
  HiOutlineHome, HiOutlineCalendar, HiOutlineClipboardList, HiOutlineCreditCard,
  HiOutlineChartBar, HiOutlineUserGroup, HiOutlineTruck, HiOutlineGift,
  HiOutlineCurrencyDollar, HiOutlineLogout, HiOutlineMenu, HiOutlineX,
  HiOutlineTicket, HiOutlineOfficeBuilding, HiOutlineHeart, HiOutlineClipboardCheck
} from 'react-icons/hi';

const roleColors = {
  admin: 'bg-red-500/15 text-red-400 border-red-500/30',
  organizer: 'bg-brand/15 text-brand border-brand/30',
  registrant: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  sponsor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  vendor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  donor: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
  staff: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
};

const allNavItems = [
  // Admin & Organizer
  { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard', end: true, roles: ['admin', 'organizer'] },
  { to: '/dashboard/events', icon: HiOutlineCalendar, label: 'Events', roles: ['admin', 'organizer'] },
  { to: '/dashboard/registrations', icon: HiOutlineClipboardList, label: 'Registrations', roles: ['admin', 'organizer', 'staff'] },
  { to: '/dashboard/payments', icon: HiOutlineCreditCard, label: 'Payments', roles: ['admin', 'organizer', 'staff'] },
  { to: '/dashboard/reports', icon: HiOutlineChartBar, label: 'Reports', roles: ['admin', 'organizer'] },
  { to: '/dashboard/sponsors', icon: HiOutlineUserGroup, label: 'Sponsors', roles: ['admin', 'organizer'] },
  { to: '/dashboard/vendors', icon: HiOutlineTruck, label: 'Vendors', roles: ['admin', 'organizer'] },
  { to: '/dashboard/donations', icon: HiOutlineGift, label: 'Donations', roles: ['admin', 'organizer'] },
  { to: '/dashboard/expenses', icon: HiOutlineCurrencyDollar, label: 'Expenses', roles: ['admin', 'organizer'] },
  // Registrant
  { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard', end: true, roles: ['registrant'] },
  { to: '/dashboard/my-registrations', icon: HiOutlineTicket, label: 'My Registrations', roles: ['registrant'] },
  { to: '/dashboard/browse-events', icon: HiOutlineCalendar, label: 'Browse Events', roles: ['registrant'] },
  // Sponsor
  { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard', end: true, roles: ['sponsor'] },
  { to: '/dashboard/my-sponsorships', icon: HiOutlineOfficeBuilding, label: 'My Sponsorships', roles: ['sponsor'] },
  // Vendor
  { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard', end: true, roles: ['vendor'] },
  { to: '/dashboard/my-booths', icon: HiOutlineTruck, label: 'My Booths', roles: ['vendor'] },
  // Donor
  { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard', end: true, roles: ['donor'] },
  { to: '/dashboard/my-donations', icon: HiOutlineHeart, label: 'My Donations', roles: ['donor'] },
  // Staff
  { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard', end: true, roles: ['staff'] },
  { to: '/dashboard/staff-registrations', icon: HiOutlineClipboardCheck, label: 'Enter Registrations', roles: ['staff'] },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = allNavItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-surface-light border-r border-border flex flex-col transform transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 px-5 flex items-center gap-3 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-xs">HR</div>
          <span className="text-sm font-semibold text-text">Hot Rides Expo</span>
        </div>

        <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-0.5">
          {navItems.map((item, idx) => (
            <NavLink key={item.to + idx} to={item.to} end={item.end} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-brand/10 text-brand font-medium' : 'text-text-muted hover:text-text hover:bg-surface/50'}`
              }>
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-surface-lighter text-text-muted text-xs font-semibold flex items-center justify-center">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text truncate">{user?.name}</p>
              <span className={`inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full border ${roleColors[user?.role] || 'bg-surface-lighter text-text-muted border-border'}`}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-text-faint hover:text-danger hover:bg-surface/50 transition-colors">
            <HiOutlineLogout className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-surface-light flex items-center justify-between px-6 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden text-text-muted hover:text-text">
            <HiOutlineMenu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block" />
          <span className="text-xs text-text-faint">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
