import React, { useState } from 'react';
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isVisible = useAutoHide(3000);

  return (
    <>
    <header className={`fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-sm z-50 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img
                src="/Logo Large.jpeg"
                alt="Woander"
                className="h-12 w-12 object-contain rounded-full transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-coral-500 via-sunset-500 to-teal-500 bg-clip-text text-transparent font-libra transition-all duration-300 group-hover:scale-105">
              Woander
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-coral-500 transition-colors">Home</Link>
            <Link to="/hidden-gems" className="text-gray-700 hover:text-teal-500 transition-colors">Hidden Gems</Link>
            <Link to="/adventures" className="text-gray-700 hover:text-coral-500 transition-colors">Adventures</Link>
            <Link to="/experiences" className="text-gray-700 hover:text-teal-500 transition-colors">Experiences</Link>
            <Link to="/vanguard" className="text-gray-700 hover:text-teal-500 transition-colors">Vanguard</Link>
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center gap-1 text-gray-700 hover:text-teal-500 transition-colors"
              type="button"
            >
              <Search size={18} />
            </button>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-coral-500 to-sunset-500 text-white rounded-full hover:from-coral-600 hover:to-sunset-600 transition-all shadow-md hover:shadow-lg"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 text-gray-700 hover:text-coral-500 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-full hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
              >
                Sign In
              </button>
            )}
          </nav>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-coral-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <button
                onClick={() => {
                  setIsSearchModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-teal-500 transition-colors text-left"
              >
                <Search size={16} />
                Search
              </button>
              <Link to="/hidden-gems" className="text-gray-700 hover:text-teal-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Hidden Gems</Link>
              <Link to="/adventures" className="text-gray-700 hover:text-coral-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Adventures</Link>
              <Link to="/experiences" className="text-gray-700 hover:text-teal-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Experiences</Link>
              <Link to="/vanguard" className="text-gray-700 hover:text-teal-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Vanguard</Link>
              {user && (
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-coral-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              )}
              {user ? (
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 text-gray-700 hover:text-coral-500 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-2 rounded-full hover:from-teal-600 hover:to-teal-700 transition-all shadow-md inline-block text-center"
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