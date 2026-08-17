import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Compass } from 'lucide-react';

const Footer = () => {
  const [coordVisible, setCoordVisible] = useState(false);

  return (
    <footer id="contact" className="relative overflow-hidden" style={{ backgroundColor: '#243A34' }}>
      {/* Large statement */}
      <div className="relative max-w-4xl mx-auto px-6 py-32 text-center">
        <Compass className="mx-auto mb-8" size={28} strokeWidth={1.5} style={{ color: 'rgba(216,199,165,0.4)' }} />
        <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-light italic leading-[1.1] mb-6" style={{ color: '#F5F1E8' }}>
          Wander beyond<br />the obvious.
        </h2>
        <div className="w-12 h-px mx-auto mt-8" style={{ background: 'linear-gradient(to right, transparent, rgba(216,199,165,0.4), transparent)' }} />
      </div>

      {/* Divider */}
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(216,199,165,0.2), transparent)' }} />
      </div>

      {/* Links + info */}
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <img src="/Logo Large.jpeg" alt="Woander" className="h-9 w-9 object-contain rounded-full opacity-70 group-hover:opacity-90 transition-opacity" />
              <span className="font-display text-xl font-light transition-colors" style={{ color: 'rgba(245,241,232,0.8)' }}>Woander</span>
            </Link>
            <p className="text-sm leading-relaxed font-light max-w-sm mb-6" style={{ color: 'rgba(245,241,232,0.5)' }}>
              A hidden portal for explorers. Community-powered discovery of hidden India —
              built by the people who actually walk these paths.
            </p>
            <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: 'rgba(245,241,232,0.25)' }}>
              Field Season 2024 · 847 Gems Catalogued
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase mb-5" style={{ color: 'rgba(216,199,165,0.5)' }}>Explore</p>
            <ul className="space-y-3">
              {[
                { to: '/hidden-gems', label: 'Hidden Gems' },
                { to: '/adventures', label: 'Adventures' },
                { to: '/experiences', label: 'Experiences' },
                { to: '/vanguard', label: 'Vanguard' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm transition-colors duration-300 font-light" style={{ color: 'rgba(245,241,232,0.5)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="font-mono text-[10px] tracking-widest uppercase mb-5" style={{ color: 'rgba(216,199,165,0.5)' }}>Company</p>
            <ul className="space-y-3 mb-6">
              <li><Link to="/about" className="text-sm transition-colors duration-300 font-light" style={{ color: 'rgba(245,241,232,0.5)' }}>About</Link></li>
              <li><p className="text-sm font-light" style={{ color: 'rgba(245,241,232,0.5)' }}>Panampilly Nagar, Kochi, Kerala</p></li>
              <li><p className="text-sm font-light" style={{ color: 'rgba(245,241,232,0.5)' }}>+91 9995134199</p></li>
              <li><p className="text-sm font-light" style={{ color: 'rgba(245,241,232,0.5)' }}>info@wakinglife.com</p></li>
            </ul>
            <div className="flex space-x-4">
              <a href="#" className="transition-colors duration-300" style={{ color: 'rgba(245,241,232,0.4)' }} aria-label="Instagram">
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <a href="#" className="transition-colors duration-300" style={{ color: 'rgba(245,241,232,0.4)' }} aria-label="Twitter">
                <Twitter className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid rgba(245,241,232,0.1)' }}>
          <div className="flex items-center gap-3">
            <img src="/Logo Large.jpeg" alt="Woander" className="h-6 w-6 object-contain rounded-full opacity-50" />
            <p className="text-xs font-light" style={{ color: 'rgba(245,241,232,0.3)' }}>
              © 2024 Woander. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="text-xs transition-colors" style={{ color: 'rgba(245,241,232,0.3)' }}>Privacy</a>
            <a href="#" className="text-xs transition-colors" style={{ color: 'rgba(245,241,232,0.3)' }}>Terms</a>

            <button
              onClick={() => setCoordVisible(v => !v)}
              className="font-mono text-[10px] tracking-widest transition-colors duration-700"
              style={{ color: 'rgba(216,199,165,0.2)' }}
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
