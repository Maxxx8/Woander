import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Compass } from 'lucide-react';
import { TopoBackground } from './FieldElements';

const Footer = () => {
  const [coordVisible, setCoordVisible] = useState(false);

  return (
    <footer id="contact" className="relative bg-forest-950 border-t border-forest-800 overflow-hidden">
      <TopoBackground opacity={0.03} />

      {/* Manifesto quote — larger, more space */}
      <div className="relative max-w-4xl mx-auto px-6 py-28 text-center">
        <Compass className="mx-auto text-gold-400/30 mb-8" size={28} />
        <blockquote className="font-display text-4xl md:text-5xl font-light italic text-cream leading-[1.2] mb-6">
          "The map is never the territory."
        </blockquote>
        <p className="font-jetbrains text-[10px] text-mist-700 tracking-widest uppercase">
          — Woander Philosophy
        </p>
      </div>

      {/* Terrain divider */}
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />
      </div>

      {/* Links + info */}
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <img src="/Logo Large.jpeg" alt="Woander" className="h-9 w-9 object-contain rounded-full opacity-70 group-hover:opacity-90 transition-opacity" />
              <span className="font-display text-xl font-light text-mist-400 group-hover:text-cream transition-colors">Woander</span>
            </Link>
            <p className="text-mist-600 text-sm leading-relaxed font-light max-w-sm mb-6">
              A hidden portal for explorers. Community-powered discovery of hidden India — built by the people who actually walk these paths.
            </p>
            <p className="font-jetbrains text-[9px] text-mist-800 tracking-widest uppercase">
              Field Season 2024 · 847 Gems Catalogued
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-jetbrains text-[10px] text-gold-400/50 tracking-widest uppercase mb-5">Explore</p>
            <ul className="space-y-3">
              {[
                { to: '/hidden-gems', label: 'Hidden Gems' },
                { to: '/adventures', label: 'Adventures' },
                { to: '/experiences', label: 'Experiences' },
                { to: '/vanguard', label: 'Gem Founders' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-mist-600 hover:text-gold-300 text-sm transition-colors duration-300 font-light">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-jetbrains text-[10px] text-gold-400/50 tracking-widest uppercase mb-5">Contact</p>
            <div className="space-y-3 mb-6">
              <p className="text-mist-600 text-sm font-light">Panampilly Nagar, Kochi, Kerala</p>
              <p className="text-mist-600 text-sm font-light">+91 9995134199</p>
              <p className="text-mist-600 text-sm font-light">info@wakinglife.com</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-mist-700 hover:text-gold-400 transition-colors duration-300" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-mist-700 hover:text-gold-400 transition-colors duration-300" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-forest-800/60 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-mist-800 text-xs font-light">
            © 2024 Woander. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="text-mist-800 hover:text-mist-600 text-xs transition-colors">Privacy</a>
            <a href="#" className="text-mist-800 hover:text-mist-600 text-xs transition-colors">Terms</a>

            {/* Hidden coordinate easter egg */}
            <button
              onClick={() => setCoordVisible(v => !v)}
              className="font-jetbrains text-[10px] text-forest-700 hover:text-gold-400 tracking-widest transition-colors duration-700"
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
