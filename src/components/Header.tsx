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
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Always warm ivory background, dark forest text — sits naturally on cream canvas
  const navColor = '#263D35';
  const navHover = '#B69A63';
  const logoColor = '#263D35';

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(251,248,241,0.96)' : 'rgba(246,242,233,0.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(38,61,53,0.08)',
          boxShadow: scrolled ? '0 1px 6px rgba(38,61,53,0.04)' : 'none',
        }}
      >
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-5">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group relative z-10">
              <img
                src="/Logo Large.jpeg"
                alt="Woander"
                className="h-8 w-8 object-contain rounded-full opacity-90 group-hover:opacity-100 transition-opacity duration-300"
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
                      style={{ backgroundColor: active ? navHover : 'rgba(38,61,53,0.25)' }}
                    />
                  </Link>
                );
              })}

              <div className="h-3 w-px" style={{ backgroundColor: 'rgba(38,61,53,0.1)' }} />

              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="transition-colors duration-300 hover:text-[#B69A63]"
                style={{ color: navColor }}
                type="button"
                aria-label="Search"
              >
                <Search size={15} strokeWidth={1.5} />
              </button>

              <button
                onClick={toggle}
                className="transition-colors duration-300 hover:text-[#B69A63]"
                style={{ color: navColor }}
                type="button"
                aria-label={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
              >
                {theme === 'night' ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
              </button>

              <div className="h-3 w-px" style={{ backgroundColor: 'rgba(38,61,53,0.1)' }} />

              {user ? (
                <div className="flex items-center gap-5">
                  <Link
                    to="/guide/dashboard"
                    className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase font-normal transition-colors duration-300 hover:text-[#B69A63]"
                    style={{ color: navColor }}
                  >
                    <Compass className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Guide
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-1.5 text-[11px] tracking-[0.1em] uppercase font-normal transition-colors duration-300 hover:text-[#B69A63]"
                    style={{ color: navColor }}
                  >
                    <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="transition-colors duration-300 hover:text-[#B69A63]"
                    style={{ color: 'rgba(38,61,53,0.45)' }}
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-5 py-2 text-[11px] tracking-[0.12em] uppercase font-normal transition-all duration-300 hover:bg-[#263D35] hover:text-[#F6F2E9]"
                  style={{
                    border: '1px solid rgba(38,61,53,0.25)',
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
            <div className="md:hidden pb-6 relative z-10" style={{ borderTop: '1px solid rgba(38,61,53,0.08)' }}>
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
                <div className="h-px" style={{ backgroundColor: 'rgba(38,61,53,0.08)' }} />
                {user ? (
                  <>
                    <Link to="/guide/dashboard" className="flex items-center gap-2 text-sm" style={{ color: navColor }} onClick={() => setIsMenuOpen(false)}>
                      <Compass className="h-4 w-4" strokeWidth={1.5} />
                      Guide Dashboard
                    </Link>
                    <Link to="/dashboard" className="text-sm" style={{ color: navColor }} onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={signOut} className="flex items-center gap-2 text-sm text-left" style={{ color: 'rgba(38,61,53,0.45)' }}>
                      <LogOut className="h-4 w-4" strokeWidth={1.5} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="text-sm tracking-[0.12em] uppercase font-medium border px-5 py-2 transition-all w-fit"
                    style={{ border: '1px solid rgba(38,61,53,0.25)', color: navColor }}
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
