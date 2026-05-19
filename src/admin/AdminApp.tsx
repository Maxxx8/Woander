import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './contexts/AdminAuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminInvitationsPage from './pages/AdminInvitationsPage';
import AdminActivityLogsPage from './pages/AdminActivityLogsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading Admin Panel...</p>
      </div>
    </div>
  );
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAdminAuth();
  if (loading) return <LoadingScreen />;
  return isAdmin ? <>{children}</> : <Navigate to="/login" />;
}

function AdminApp() {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <AdminAuthProvider>
            <Routes>
              <Route path="/login" element={<AdminLoginPage />} />
              <Route path="/dashboard" element={
                <ProtectedAdminRoute>
                  <AdminDashboardPage />
                </ProtectedAdminRoute>
              } />
              <Route path="/users" element={
                <ProtectedAdminRoute>
                  <AdminUsersPage />
                </ProtectedAdminRoute>
              } />
              <Route path="/invitations" element={
                <ProtectedAdminRoute>
                  <AdminInvitationsPage />
                </ProtectedAdminRoute>
              } />
              <Route path="/activity" element={
                <ProtectedAdminRoute>
                  <AdminActivityLogsPage />
                </ProtectedAdminRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedAdminRoute>
                  <AdminAnalyticsPage />
                </ProtectedAdminRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </AdminAuthProvider>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default AdminApp;
