import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './shared/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './admin/contexts/AdminAuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import MobileNavigation from './components/MobileNavigation';
import HomePage from './pages/HomePage';
import ExperiencesPage from './pages/ExperiencesPage';
import AboutPage from './pages/AboutPage';
import AdventuresPage from './pages/AdventuresPage';
import HiddenGemsPage from './pages/HiddenGemsPage';
import DashboardPage from './pages/DashboardPage';
import VanguardPage from './pages/VanguardPage';
const AdminLayout = React.lazy(() => import('./admin/components/AdminLayout'));
const AdminLoginPage = React.lazy(() => import('./admin/pages/AdminLoginPage'));
const AdminDashboardPage = React.lazy(() => import('./admin/pages/AdminDashboardPage'));
const AdminUsersPage = React.lazy(() => import('./admin/pages/AdminUsersPage'));
const AdminInvitationsPage = React.lazy(() => import('./admin/pages/AdminInvitationsPage'));
const AdminActivityLogsPage = React.lazy(() => import('./admin/pages/AdminActivityLogsPage'));
const AdminAnalyticsPage = React.lazy(() => import('./admin/pages/AdminAnalyticsPage'));

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-forest-950">
      <div className="text-center">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-gold-400/60 to-transparent mx-auto mb-6 animate-pulse" />
        <p className="font-mono text-[10px] text-mist-700 tracking-widest uppercase">
          Loading...
        </p>
      </div>
    </div>
  );
}

function AdminLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Loading Admin Panel...</p>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdminAuth();
  if (loading) return <AdminLoadingScreen />;
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

function AdminSection() {
  return (
    <Suspense fallback={<AdminLoadingScreen />}>
      <AdminAuthProvider>
        <Routes>
          <Route path="login" element={<AdminLoginPage />} />
          <Route
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="invitations" element={<AdminInvitationsPage />} />
            <Route path="activity" element={<AdminActivityLogsPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </AdminAuthProvider>
    </Suspense>
  );
}

function AppLayout() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <AuthProvider>
      {!isAdminRoute && (
        <div
          className="fixed inset-0 pointer-events-none z-[9998]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            opacity: 0.028,
            mixBlendMode: 'overlay',
          }}
        />
      )}
      <div className="flex flex-col">
        {!isAdminRoute && <Header />}
        <main>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/vanguard" element={<VanguardPage />} />
              <Route path="/experiences" element={<ExperiencesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/adventures" element={<AdventuresPage />} />
              <Route path="/hidden-gems" element={<HiddenGemsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin/*" element={<AdminSection />} />
            </Routes>
          </ErrorBoundary>
        </main>
        {!isAdminRoute && <MobileNavigation />}
      </div>
    </AuthProvider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<LoadingScreen />}>
          <AppLayout />
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
