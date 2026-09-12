import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import SplashScreen from './components/common/SplashScreen';
import HomePage from './pages/HomePage';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import AboutUs from './pages/AboutUs';
import Team from './pages/Team';
import NotificationCenter from './pages/NotificationCenter';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import AdminArchive from './pages/AdminArchive';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
      }}>
        <div className="spinner" style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashFadingOut, setSplashFadingOut] = useState(false);

  useEffect(() => {
    // Show the logo for 2s, then fade out over 0.4s, then unmount.
    const fadeTimer = setTimeout(() => setSplashFadingOut(true), 2000);
    const removeTimer = setTimeout(() => setShowSplash(false), 2400);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <AuthProvider>
      {showSplash && <SplashScreen fadingOut={splashFadingOut} />}
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/report-lost" element={<ReportLost />} />
          <Route path="/report-found" element={<ReportFound />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/team" element={<Team />} />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/archive"
            element={
              <ProtectedRoute>
                <AdminArchive />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-bright)',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: 'var(--shadow-md)',
          },
          success: {
            iconTheme: { primary: 'var(--found)', secondary: 'var(--bg-card)' },
          },
          error: {
            iconTheme: { primary: 'var(--danger)', secondary: 'var(--bg-card)' },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
