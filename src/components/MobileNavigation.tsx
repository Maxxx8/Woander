import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, MapPin, Sparkles, Shield } from 'lucide-react';

const MobileNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/vanguard', icon: Shield, label: 'Guides' },
    { path: '/hidden-gems', icon: MapPin, label: 'Gems' },
    { path: '/adventures', icon: Compass, label: 'Adventures' },
    { path: '/experiences', icon: Sparkles, label: 'Experiences' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center px-2 py-2 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg min-w-[60px] transition-colors ${
                isActive
                  ? 'text-teal-600 bg-teal-50'
                  : 'text-gray-500 active:bg-gray-100'
              }`}
            >
              <Icon className="h-6 w-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
