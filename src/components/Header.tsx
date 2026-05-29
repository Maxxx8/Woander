import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/AuthContext';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Gems', to: '/hidden-gems' },
    { label: 'Adventures', to: '/adventures' },
    { label: 'Destinations', to: '/destinations' },
    { label: 'Experiences', to: '/experiences' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-700 ${
          isScrolled
            ? 'bg-forest-900/95 backdrop-blur-md border-b border-gold-500/10'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 md:py-5">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/Logo Large.jpeg"
                  alt="Woander"
                  className="h-9 w-9 object-contain rounded-sm transition-all duration-300 group-hover:scale-105"
                />
              </div>
              <span
                className="text-lg font-serif text-mist-100 tracking-wider transition-colors duration-300 group-hover:text-gold-300"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Woander
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-2 text-xs uppercase tracking-widest text-mist-300/80 hover:text-mist-50 hover:bg-forest-800/50 transition-all duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="p-2.5 text-mist-400/70 hover:text-gold-400 hover:bg-forest-800/50 transition-all duration-300 rounded-sm"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {user ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 text-xs uppercase tracking-widest bg-gold-500/10 border border-gold-500/20 text-gold-300 hover:bg-gold-500/20 transition-all duration-300"
                  >
                    <User className="h-3.5 w-3.5 inline mr-2" />
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="p-2.5 text-mist-500/50 hover:text-mist-300 transition-all duration-300"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden md:block px-5 py-2.5 text-xs uppercase tracking-widest bg-forest-700/80 border border-gold-500/20 text-mist-200 hover:bg-forest-600 hover:border-gold-400/30 transition-all duration-300"
                >
                  Enter
                </button>
              )}

              {/* Mobile Toggle */}
              <button
                className="lg:hidden p-2.5 text-mist-400/70 hover:text-gold-400 transition-all duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-6 border-t border-gold-500/10 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block px-4 py-3 text-sm uppercase tracking-widest text-mist-300/80 hover:text-mist-50 hover:bg-forest-800/50 transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsSearchModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm uppercase tracking-widest text-mist-300/80 hover:text-mist-50 hover:bg-forest-800/50 transition-all duration-300 flex items-center gap-3"
              >
                <Search size={16} />
                Search
              </button>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 text-sm uppercase tracking-widest text-mist-300/80 hover:text-mist-50 hover:bg-forest-800/50 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm uppercase tracking-widest text-mist-500/60 hover:text-mist-300 transition-all duration-300 flex items-center gap-3"
                  >
                    <LogOut size={16} />
                    Depart
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 mt-4 text-sm uppercase tracking-widest bg-forest-700/80 border border-gold-500/20 text-mist-200 hover:bg-forest-600 transition-all duration-300"
                >
                  Enter
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </>
  );
};

export default Header;
