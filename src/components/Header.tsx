import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/AuthContext';
import { useAutoHide } from '../hooks/useAutoHide';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isVisible = useAutoHide(3000);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled ? 'glass' : 'bg-transparent'
    } ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img
                src="/Logo Large.jpeg"
                alt="Woander"
                className="h-10 w-10 object-contain rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-sm"
              />
            </div>
            <span className="text-xl font-bold text-charcoal font-display transition-all duration-300 group-hover:text-teal-600">
              Woander
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {[
              { label: 'Home', to: '/' },
              { label: 'Hidden Gems', to: '/hidden-gems' },
              { label: 'Adventures', to: '/adventures' },
              { label: 'Experiences', to: '/experiences' },
              { label: 'Vanguard', to: '/vanguard' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="px-4 py-2 text-charcoal-light hover:text-teal-600 transition-all duration-300 text-sm font-medium hover:bg-white/30 rounded-lg"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-charcoal-light hover:bg-white/30 transition-all duration-300"
              type="button"
            >
              <Search size={18} />
            </button>

            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-300 text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden lg:inline">Dashboard</span>
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 text-charcoal-light hover:text-teal-600 transition-all duration-300"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden md:block px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-300 text-sm font-medium"
              >
                Sign In
              </button>
            )}

            <button
              className="md:hidden p-2 hover:bg-white/30 rounded-lg transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6 text-charcoal" /> : <Menu className="h-6 w-6 text-charcoal" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {[
              { label: 'Home', to: '/' },
              { label: 'Hidden Gems', to: '/hidden-gems' },
              { label: 'Adventures', to: '/adventures' },
              { label: 'Experiences', to: '/experiences' },
              { label: 'Vanguard', to: '/vanguard' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-4 py-2 text-charcoal-light hover:text-teal-600 hover:bg-white/30 rounded-lg transition-all duration-300"
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
              className="w-full text-left px-4 py-2 text-charcoal-light hover:text-teal-600 hover:bg-white/30 rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Search size={16} />
              Search
            </button>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-charcoal-light hover:bg-white/30 rounded-lg transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-charcoal-light hover:text-teal-600 hover:bg-white/30 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-300 text-sm font-medium"
              >
                Sign In
              </button>
            )}
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