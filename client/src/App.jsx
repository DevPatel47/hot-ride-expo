import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import RegistrationsPage from './pages/RegistrationsPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import SponsorsPage from './pages/SponsorsPage';
import VendorsPage from './pages/VendorsPage';
import DonationsPage from './pages/DonationsPage';
import ExpensesPage from './pages/ExpensesPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import MySponsorshipsPage from './pages/MySponsorshipsPage';
import MyBoothsPage from './pages/MyBoothsPage';
import MyDonationsPage from './pages/MyDonationsPage';
import BrowseEventsPage from './pages/BrowseEventsPage';
import StaffRegistrationsPage from './pages/StaffRegistrationsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function RoleRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        {/* Admin & Organizer routes */}
        <Route path="events" element={<RoleRoute roles={['admin', 'organizer']}><EventsPage /></RoleRoute>} />
        <Route path="registrations" element={<RoleRoute roles={['admin', 'organizer', 'staff']}><RegistrationsPage /></RoleRoute>} />
        <Route path="payments" element={<RoleRoute roles={['admin', 'organizer', 'staff']}><PaymentsPage /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute roles={['admin', 'organizer']}><ReportsPage /></RoleRoute>} />
        <Route path="sponsors" element={<RoleRoute roles={['admin', 'organizer']}><SponsorsPage /></RoleRoute>} />
        <Route path="vendors" element={<RoleRoute roles={['admin', 'organizer']}><VendorsPage /></RoleRoute>} />
        <Route path="donations" element={<RoleRoute roles={['admin', 'organizer']}><DonationsPage /></RoleRoute>} />
        <Route path="expenses" element={<RoleRoute roles={['admin', 'organizer']}><ExpensesPage /></RoleRoute>} />
        {/* Registrant routes */}
        <Route path="my-registrations" element={<RoleRoute roles={['registrant']}><MyRegistrationsPage /></RoleRoute>} />
        <Route path="browse-events" element={<RoleRoute roles={['registrant']}><BrowseEventsPage /></RoleRoute>} />
        {/* Sponsor routes */}
        <Route path="my-sponsorships" element={<RoleRoute roles={['sponsor']}><MySponsorshipsPage /></RoleRoute>} />
        {/* Vendor routes */}
        <Route path="my-booths" element={<RoleRoute roles={['vendor']}><MyBoothsPage /></RoleRoute>} />
        {/* Donor routes */}
        <Route path="my-donations" element={<RoleRoute roles={['donor']}><MyDonationsPage /></RoleRoute>} />
        {/* Staff routes */}
        <Route path="staff-registrations" element={<RoleRoute roles={['staff']}><StaffRegistrationsPage /></RoleRoute>} />
      </Route>
    </Routes>
  );
}
