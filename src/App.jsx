import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/Common/ToastProvider';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

/* Pages */
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import Browse from './pages/Browse';
import ItemDetail from './pages/ItemDetail';
import MyReports from './pages/MyReports';
import Matches from './pages/Matches';
import ClaimPage from './pages/ClaimPage';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import SecurityDashboard from './pages/SecurityDashboard';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ToastProvider>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Browse and item details: admin/security only - students never see the raw lost/found listing, only their own matches */}
                <Route path="/browse" element={
                  <ProtectedRoute roles={['admin', 'security']}><Browse /></ProtectedRoute>
                } />
                <Route path="/item/:type/:id" element={
                  <ProtectedRoute><ItemDetail /></ProtectedRoute>
                } />

                {/* Protected routes - any authenticated user */}
                <Route path="/dashboard" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/report-lost" element={
                  <ProtectedRoute><ReportLost /></ProtectedRoute>
                } />
                <Route path="/report-found" element={
                  <ProtectedRoute><ReportFound /></ProtectedRoute>
                } />
                <Route path="/my-reports" element={
                  <ProtectedRoute><MyReports /></ProtectedRoute>
                } />
                <Route path="/matches" element={
                  <ProtectedRoute><Matches /></ProtectedRoute>
                } />
                <Route path="/claim/:matchId" element={
                  <ProtectedRoute><ClaimPage /></ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute><Notifications /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />

                {/* Admin only */}
                <Route path="/admin" element={
                  <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
                } />

                {/* Security only */}
                <Route path="/security" element={
                  <ProtectedRoute roles={['security', 'admin']}><SecurityDashboard /></ProtectedRoute>
                } />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
