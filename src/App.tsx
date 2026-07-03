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
    <div className="min-h-screen flex items-center justify-center bg-forest-950">
      <div className="text-center">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-gold-400/60 to-transparent mx-auto mb-6 animate-pulse" />
        <p className="font-jetbrains text-[10px] text-mist-700 tracking-widest uppercase">
          Loading...
        </p>
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
            {/* Film grain overlay — fixed, covers entire viewport */}
            <div
              className="fixed inset-0 pointer-events-none z-[9998]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
                opacity: 0.028,
                mixBlendMode: 'overlay',
              }}
            />
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
