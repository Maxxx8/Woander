import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User, Search, Sun, Moon, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../shared/AuthContext';
import { useTheme } from '../shared/ThemeContext';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';

const NAV_LINKS = [
  { to: '/hidden-gems', label: 'Hidden Gems' },
  { to: '/adventures', label: 'Adventures' },
  { to: '/experiences', label: 'Experiences' },
  { to: '/vanguard', label: 'Vanguard' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-forest-950/95 backdrop-blur-md'
            : 'bg-transparent'
        }`}
        style={{
          borderBottom: scrolled
            ? '1px solid rgba(244,240,230,0.12)'
            : '1px solid transparent',
        }}
      >
        {/* Gradient behind header on hero — darker at top, transparent at bottom */}
        {!scrolled && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(7,22,17,0.7) 0%, rgba(7,22,17,0.35) 60%, rgba(7,22,17,0) 100%)',
            }}
          />
        )}

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-5">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group relative z-10">
              <img
                src="/Logo Large.jpeg"
                alt="Woander"
                className="h-9 w-9 object-contain rounded-full opacity-95 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-cream/15"
              />
              <span
                className="font-display text-xl font-light tracking-[0.15em] transition-colors duration-300"
                style={{ color: '#F4F0E6' }}
              >
                Woander
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-9 relative z-10">
              {NAV_LINKS.map(({ to, label }) => {
                const active = location.pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className="relative text-[12px] tracking-[0.12em] uppercase font-medium transition-colors duration-300 group"
                    style={{ color: active ? '#D8C28C' : '#F4F0E6' }}
                  >
                    {label}
                    <span
                      className={`absolute -bottom-1.5 left-0 h-px transition-all duration-300 ${
                        active ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                      style={{ backgroundColor: active ? '#D8C28C' : 'rgba(244,240,230,0.3)' }}
                    />
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="h-4 w-px bg-cream/15" />

              {/* Utility actions */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="transition-colors duration-300 hover:text-gold-300"
                style={{ color: '#F4F0E6' }}
                type="button"
                aria-label="Search"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>

              <button
                onClick={toggle}
                className="transition-colors duration-300 hover:text-gold-300"
                style={{ color: '#F4F0E6' }}
                type="button"
                aria-label={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
              >
                {theme === 'night' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
              </button>

              <div className="h-4 w-px bg-cream/15" />

              {user ? (
                <div className="flex items-center gap-5">
                  <Link
                    to="/guide/dashboard"
                    className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase font-medium transition-colors duration-300 hover:text-gold-300"
                    style={{ color: '#F4F0E6' }}
                  >
                    <Compass className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Guide
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase font-medium transition-colors duration-300 hover:text-gold-300"
                    style={{ color: '#F4F0E6' }}
                  >
                    <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="transition-colors duration-300 hover:text-cream"
                    style={{ color: 'rgba(244,240,230,0.6)' }}
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-5 py-2 border text-[11px] tracking-[0.12em] uppercase font-medium transition-all duration-300 hover:bg-cream/10"
                  style={{
                    borderColor: 'rgba(244,240,230,0.35)',
                    color: '#F4F0E6',
                  }}
                >
                  Sign In
                </button>
              )}
            </nav>

            {/* Mobile: search + theme + menu */}
            <div className="flex items-center gap-4 md:hidden relative z-10">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="transition-colors duration-300"
                style={{ color: '#F4F0E6' }}
                aria-label="Search"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={toggle}
                className="transition-colors duration-300"
                style={{ color: '#F4F0E6' }}
                type="button"
                aria-label={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
              >
                {theme === 'night' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
              </button>
              <button
                className="transition-colors"
                style={{ color: '#F4F0E6' }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-cream/10 pb-6 relative z-10">
              <div className="flex flex-col space-y-5 pt-5">
                {NAV_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-sm tracking-[0.12em] uppercase font-medium transition-colors"
                    style={{ color: '#F4F0E6' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <div className="h-px bg-cream/10 my-1" />
                {user ? (
                  <>
                    <Link to="/guide/dashboard" className="flex items-center gap-2 text-sm tracking-wide transition-colors" style={{ color: '#F4F0E6' }} onClick={() => setIsMenuOpen(false)}>
                      <Compass className="h-4 w-4" strokeWidth={1.5} />
                      Guide Dashboard
                    </Link>
                    <Link to="/dashboard" className="text-sm tracking-wide transition-colors" style={{ color: '#F4F0E6' }} onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={signOut} className="flex items-center gap-2 text-sm transition-colors text-left" style={{ color: 'rgba(244,240,230,0.6)' }}>
                      <LogOut className="h-4 w-4" strokeWidth={1.5} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="text-sm tracking-[0.12em] uppercase font-medium border px-5 py-2 transition-all w-fit"
                    style={{ borderColor: 'rgba(244,240,230,0.35)', color: '#F4F0E6' }}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </header>
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
};

export default Header;
