import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User, Search, Sun, Moon, Compass } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/AuthContext';
import { useTheme } from '../shared/ThemeContext';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-forest-950/95 backdrop-blur-md border-b border-gold-400/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-5">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/Logo Large.jpeg"
                alt="Woander"
                className="h-9 w-9 object-contain rounded-full opacity-90 group-hover:opacity-100 transition-opacity duration-300"
              />
              <span className="font-display text-xl font-light text-cream tracking-wider group-hover:text-gold-300 transition-colors duration-300">
                Woander
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {[
                { to: '/hidden-gems', label: 'Hidden Gems' },
                { to: '/adventures', label: 'Adventures' },
                { to: '/experiences', label: 'Experiences' },
                { to: '/vanguard', label: 'Vanguard' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-mist-400 hover:text-cream text-sm tracking-wide transition-colors duration-300"
                >
                  {label}
                </Link>
              ))}

              <button
                onClick={toggle}
                className="text-mist-500 hover:text-gold-300 transition-colors duration-300 relative"
                type="button"
                aria-label={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
              >
                {theme === 'night' ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />}
              </button>

              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="text-mist-500 hover:text-cream transition-colors duration-300"
                type="button"
                aria-label="Search"
              >
                <Search size={17} strokeWidth={1.5} />
              </button>

              {user ? (
                <div className="flex items-center space-x-5">
                  <Link
                    to="/guide/dashboard"
                    className="flex items-center space-x-2 text-mist-400 hover:text-gold-300 text-sm transition-colors duration-300"
                  >
                    <Compass className="h-4 w-4" />
                    <span>Guide</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 text-mist-400 hover:text-cream text-sm transition-colors duration-300"
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-mist-600 hover:text-mist-400 transition-colors duration-300"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-5 py-2 border border-gold-400/30 text-gold-300 text-sm tracking-wide hover:border-gold-400/70 hover:text-gold-200 transition-all duration-300"
                >
                  Sign In
                </button>
              )}
            </nav>

            {/* Mobile: theme toggle + menu button */}
            <div className="flex items-center gap-4 md:hidden">
              <button
                onClick={toggle}
                className="text-mist-400 hover:text-gold-300 transition-colors duration-300"
                type="button"
                aria-label={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
              >
                {theme === 'night' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
              </button>
              <button
                className="text-mist-400 hover:text-cream transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-forest-700/50 pb-6">
              <div className="flex flex-col space-y-5 pt-5">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/hidden-gems', label: 'Hidden Gems' },
                  { to: '/adventures', label: 'Adventures' },
                  { to: '/experiences', label: 'Experiences' },
                  { to: '/vanguard', label: 'Vanguard' },
                ].map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-mist-400 hover:text-cream text-sm tracking-wide transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => { toggle(); }}
                  className="flex items-center gap-2 text-mist-400 hover:text-cream text-sm transition-colors text-left"
                >
                  {theme === 'night' ? <Sun size={15} strokeWidth={1.5} /> : <Moon size={15} strokeWidth={1.5} />}
                  {theme === 'night' ? 'Day Mode' : 'Night Mode'}
                </button>
                <button
                  onClick={() => { setIsSearchModalOpen(true); setIsMenuOpen(false); }}
                  className="flex items-center gap-2 text-mist-400 hover:text-cream text-sm transition-colors text-left"
                >
                  <Search size={15} strokeWidth={1.5} />
                  Search
                </button>
                {user ? (
                  <>
                    <Link to="/guide/dashboard" className="flex items-center gap-2 text-mist-400 hover:text-gold-300 text-sm transition-colors" onClick={() => setIsMenuOpen(false)}>
                      <Compass className="h-4 w-4" />
                      Guide Dashboard
                    </Link>
                    <Link to="/dashboard" className="text-mist-400 hover:text-cream text-sm transition-colors" onClick={() => setIsMenuOpen(false)}>
                      Dashboard
                    </Link>
                    <button onClick={signOut} className="flex items-center gap-2 text-mist-600 hover:text-mist-400 text-sm transition-colors text-left">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                    className="text-gold-300 text-sm tracking-wide border border-gold-400/30 px-5 py-2 hover:border-gold-400/70 transition-all w-fit"
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
