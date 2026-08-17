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
  const onHero = isHome && !scrolled;

  // On hero: dark forest text over bright image. On scroll: warm ivory bg, dark forest text.
  const navColor = '#243A34';
  const navHover = '#B99A5B';
  const logoColor = '#243A34';

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-parchment/95 backdrop-blur-md' : 'bg-transparent'
        }`}
        style={{
          borderBottom: scrolled ? '1px solid rgba(36,58,52,0.1)' : '1px solid transparent',
          boxShadow: scrolled ? '0 1px 8px rgba(36,58,52,0.06)' : 'none',
        }}
      >
        {/* Subtle warm gradient behind header on hero for readability */}
        {onHero && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(250,248,242,0.55) 0%, rgba(250,248,242,0.25) 60%, rgba(250,248,242,0) 100%)',
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
                className="h-9 w-9 object-contain rounded-full opacity-95 group-hover:opacity-100 transition-opacity duration-300"
                style={{ filter: onHero ? 'none' : 'none' }}
              />
              <span
                className="font-display text-lg font-medium tracking-[0.15em] transition-colors duration-300"
                style={{ color: logoColor }}
              >
                Woander
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-12 relative z-10">
              {NAV_LINKS.map(({ to, label }) => {
                const active = location.pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className="relative text-[11px] tracking-[0.14em] uppercase font-normal transition-colors duration-300 group"
                    style={{ color: active ? navHover : navColor }}
                  >
                    {label}
                    <span
                      className={`absolute -bottom-1.5 left-0 h-px transition-all duration-300 ${
                        active ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                      style={{ backgroundColor: active ? navHover : 'rgba(36,58,52,0.3)' }}
                    />
                  </Link>
                );
              })}

              <div className="h-3 w-px" style={{ backgroundColor: 'rgba(36,58,52,0.12)' }} />

              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="transition-colors duration-300"
                style={{ color: navColor }}
                type="button"
                aria-label="Search"
              >
                <Search size={15} strokeWidth={1.5} />
              </button>

              <button
                onClick={toggle}
                className="transition-colors duration-300"
                style={{ color: navColor }}
                type="button"
                aria-label={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
              >
                {theme === 'night' ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
              </button>

              <div className="h-3 w-px" style={{ backgroundColor: 'rgba(36,58,52,0.12)' }} />

              {user ? (
                <div className="flex items-center gap-5">
                  <Link
                    to="/guide/dashboard"
                    className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase font-normal transition-colors duration-300"
                    style={{ color: navColor }}
                  >
                    <Compass className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Guide
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase font-normal transition-colors duration-300"
                    style={{ color: navColor }}
                  >
                    <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="transition-colors duration-300"
                    style={{ color: 'rgba(36,58,52,0.5)' }}
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-5 py-2 text-[11px] tracking-[0.12em] uppercase font-normal transition-all duration-300 hover:bg-forest-900 hover:text-parchment"
                  style={{
                    border: '1px solid rgba(36,58,52,0.3)',
                    color: navColor,
                  }}
                >
                  Sign In
                </button>
              )}
            </nav>

            {/* Mobile */}
            <div className="flex items-center gap-4 md:hidden relative z-10">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                style={{ color: navColor }}
                aria-label="Search"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={toggle}
                style={{ color: navColor }}
                type="button"
                aria-label={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
              >
                {theme === 'night' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
              </button>
              <button
                style={{ color: navColor }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-6 relative z-10" style={{ borderTop: '1px solid rgba(36,58,52,0.1)' }}>
              <div className="flex flex-col space-y-5 pt-5">
                {NAV_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-sm tracking-[0.12em] uppercase font-medium transition-colors"
                    style={{ color: navColor }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <div className="h-px" style={{ backgroundColor: 'rgba(36,58,52,0.1)' }} />
                {user ? (
                  <>
                    <Link to="/guide/dashboard" className="flex items-center gap-2 text-sm" style={{ color: navColor }} onClick={() => setIsMenuOpen(false)}>
                      <Compass className="h-4 w-4" strokeWidth={1.5} />
                      Guide Dashboard
                    </Link>
                    <Link to="/dashboard" className="text-sm" style={{ color: navColor }} onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={signOut} className="flex items-center gap-2 text-sm text-left" style={{ color: 'rgba(36,58,52,0.5)' }}>
                      <LogOut className="h-4 w-4" strokeWidth={1.5} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="text-sm tracking-[0.12em] uppercase font-medium border px-5 py-2 transition-all w-fit"
                    style={{ border: '1px solid rgba(36,58,52,0.3)', color: navColor }}
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
