import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import EcologistDashboard from './pages/EcologistDashboardEnhanced';
import TouristDashboard from './pages/TouristDashboard';
import StaffDashboard from './pages/StaffDashboard';
import LogoShowcase from './components/LogoShowcase';

// Dashboard Redirect Component
const DashboardRedirect = () => {
  const { user, getDashboardPath } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  const dashboardPath = getDashboardPath(user.role);
  return <Navigate to={dashboardPath} replace />;
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <div className="App min-h-screen flex flex-col">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/logo-showcase" element={<LogoShowcase />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={<DashboardRedirect />} />
              <Route path="/dashboard/:role" element={<Dashboard />} />
              <Route path="/dashboard/admin" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/ecologist" element={
                <ProtectedRoute requiredRole="ECOLOGIST">
                  <EcologistDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/tourist" element={
                <ProtectedRoute requiredRole="TOURIST">
                  <TouristDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/staff" element={
                <ProtectedRoute requiredRole="STAFF">
                  <StaffDashboard />
                </ProtectedRoute>
              } />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          
          {/* Global Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          {/* Footer */}
          <Footer />
        </div>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
