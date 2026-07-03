import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const [coordVisible, setCoordVisible] = useState(false);

  return (
    <footer id="contact" className="bg-forest-950 border-t border-forest-800">
      {/* Main quote */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <blockquote className="font-display text-3xl md:text-4xl font-light italic text-mist-300 leading-relaxed mb-4">
          "The map is never the territory."
        </blockquote>
        <p className="font-jetbrains text-xs text-mist-700 tracking-widest uppercase">
          — Woander Philosophy
        </p>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-forest-700 to-transparent" />
      </div>

      {/* Links + info */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-3 mb-4 group">
              <img src="/Logo Large.jpeg" alt="Woander" className="h-8 w-8 object-contain rounded-full opacity-70 group-hover:opacity-90 transition-opacity" />
              <span className="font-display text-lg font-light text-mist-400 group-hover:text-cream transition-colors">Woander</span>
            </Link>
            <p className="text-mist-700 text-sm leading-relaxed font-light max-w-xs">
              A hidden portal for explorers. Community-powered discovery of hidden India.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-jetbrains text-[10px] text-mist-700 tracking-widest uppercase mb-5">Explore</p>
            <ul className="space-y-3">
              {[
                { to: '/hidden-gems', label: 'Hidden Gems' },
                { to: '/adventures', label: 'Adventures' },
                { to: '/experiences', label: 'Experiences' },
                { to: '/vanguard', label: 'Gem Founders' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-mist-600 hover:text-mist-300 text-sm transition-colors duration-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-jetbrains text-[10px] text-mist-700 tracking-widest uppercase mb-5">Contact</p>
            <div className="space-y-3">
              <p className="text-mist-600 text-sm font-light">Panampilly Nagar, Kochi, Kerala</p>
              <p className="text-mist-600 text-sm font-light">+91 9995134199</p>
              <p className="text-mist-600 text-sm font-light">info@wakinglife.com</p>
            </div>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-mist-700 hover:text-mist-400 transition-colors duration-300" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-mist-700 hover:text-mist-400 transition-colors duration-300" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-forest-800/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-mist-800 text-xs font-light">
            © 2024 Woander. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="text-mist-800 hover:text-mist-600 text-xs transition-colors">Privacy</a>
            <a href="#" className="text-mist-800 hover:text-mist-600 text-xs transition-colors">Terms</a>

            {/* Hidden coordinate easter egg */}
            <button
              onClick={() => setCoordVisible(v => !v)}
              className="font-jetbrains text-[10px] text-forest-700 hover:text-mist-700 tracking-widest transition-colors duration-700"
              title="You found it."
            >
              {coordVisible ? '10.8505° N, 76.2711° E' : '◦'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
