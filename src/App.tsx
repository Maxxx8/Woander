import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './shared/AuthContext';
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

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading...</p>
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

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<LoadingScreen />}>
          <AuthProvider>
            <div className="flex flex-col">
              <Header />
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
                  </Routes>
                </ErrorBoundary>
              </main>
              <MobileNavigation />
            </div>
          </AuthProvider>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
