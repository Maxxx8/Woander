import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User, Search, Sun, Moon, Compass } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = location.pathname === '/';
  const showHeroGradient = isHome && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${
          scrolled
            ? 'bg-forest-950/95 backdrop-blur-md border-b border-gold-400/10'
            : isHome
              ? 'bg-transparent'
              : 'bg-forest-950/80 backdrop-blur-sm border-b border-transparent'
        }`}
      >
        {/* Subtle dark gradient behind header when on hero — keeps nav readable over any image */}
        {showHeroGradient && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{
              background:
                'linear-gradient(to bottom, rgba(7,15,12,0.75) 0%, rgba(7,15,12,0.45) 50%, rgba(7,15,12,0) 100%)',
            }}
          />
        )}

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-6">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/Logo Large.jpeg"
                alt="Woander"
                className="h-9 w-9 object-contain rounded-full opacity-90 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-gold-400/20"
              />
              <span className="font-display text-xl font-light text-cream tracking-[0.15em] group-hover:text-gold-300 transition-colors duration-300">
                Woander
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-10">
              {NAV_LINKS.map(({ to, label }) => {
                const active = location.pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className="relative text-cream/80 hover:text-cream text-[11px] tracking-[0.18em] uppercase font-light transition-colors duration-300 group"
                  >
                    {label}
                    <span
                      className={`absolute -bottom-1.5 left-0 h-px bg-gold-400 transition-all duration-400 ${
                        active ? 'w-full opacity-80' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-40'
                      }`}
                    />
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="h-4 w-px bg-cream/15" />

              {/* Utility actions */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="text-cream/70 hover:text-cream transition-colors duration-300"
                type="button"
                aria-label="Search"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>

              <button
                onClick={toggle}
                className="text-cream/70 hover:text-gold-300 transition-colors duration-300"
                type="button"
                aria-label={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
              >
                {theme === 'night' ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
              </button>

              <div className="h-4 w-px bg-cream/15" />

              {user ? (
                <div className="flex items-center gap-6">
                  <Link
                    to="/guide/dashboard"
                    className="flex items-center gap-1.5 text-cream/70 hover:text-gold-300 text-[11px] tracking-[0.12em] uppercase font-light transition-colors duration-300"
                  >
                    <Compass className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Guide
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 text-cream/70 hover:text-cream text-[11px] tracking-[0.12em] uppercase font-light transition-colors duration-300"
                  >
                    <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-cream/50 hover:text-cream transition-colors duration-300"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-5 py-2 border border-gold-400/30 text-gold-300 text-[11px] tracking-[0.15em] uppercase font-light hover:border-gold-400/70 hover:text-gold-200 transition-all duration-300"
                >
                  Sign In
                </button>
              )}
            </nav>

            {/* Mobile: theme toggle + menu button */}
            <div className="flex items-center gap-4 md:hidden">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="text-cream/80 hover:text-cream transition-colors duration-300"
                aria-label="Search"
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
              <button
                onClick={toggle}
                className="text-cream/80 hover:text-gold-300 transition-colors duration-300"
                type="button"
                aria-label={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
              >
                {theme === 'night' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
              </button>
              <button
                className="text-cream/90 hover:text-cream transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-forest-700/40 pb-6">
              <div className="flex flex-col space-y-5 pt-5">
                {NAV_LINKS.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-cream/80 hover:text-gold-300 text-sm tracking-[0.15em] uppercase font-light transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <div className="h-px bg-forest-700/40 my-1" />
                {user ? (
                  <>
                    <Link to="/guide/dashboard" className="flex items-center gap-2 text-cream/80 hover:text-gold-300 text-sm tracking-wide transition-colors" onClick={() => setIsMenuOpen(false)}>
                      <Compass className="h-4 w-4" strokeWidth={1.5} />
                      Guide Dashboard
                    </Link>
                    <Link to="/dashboard" className="text-cream/80 hover:text-cream text-sm tracking-wide transition-colors" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={signOut} className="flex items-center gap-2 text-cream/60 hover:text-cream text-sm transition-colors text-left">
                      <LogOut className="h-4 w-4" strokeWidth={1.5} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="text-gold-300 text-sm tracking-[0.15em] uppercase font-light border border-gold-400/30 px-5 py-2 hover:border-gold-400/70 transition-all w-fit"
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
