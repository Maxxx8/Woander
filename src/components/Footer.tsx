import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Compass } from 'lucide-react';

const Footer = () => {
  const [coordVisible, setCoordVisible] = useState(false);

  return (
    <footer id="contact" className="relative overflow-hidden" style={{ backgroundColor: '#263D35' }}>
      {/* Large statement */}
      <div className="relative max-w-4xl mx-auto px-6 py-32 text-center">
        <Compass className="mx-auto mb-8" size={24} strokeWidth={1.5} style={{ color: 'rgba(231,217,197,0.35)' }} />
        <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light italic leading-[1.15] mb-6" style={{ color: '#F6F2E9' }}>
          Wander beyond<br />the obvious.
        </h2>
        <div className="w-12 h-px mx-auto mt-8" style={{ background: 'linear-gradient(to right, transparent, rgba(231,217,197,0.3), transparent)' }} />
      </div>

      {/* Divider */}
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(231,217,197,0.15), transparent)' }} />
      </div>

      {/* Links + info */}
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <img src="/Logo Large.jpeg" alt="Woander" className="h-8 w-8 object-contain rounded-full opacity-60 group-hover:opacity-80 transition-opacity" />
              <span className="font-display text-lg font-light transition-colors" style={{ color: 'rgba(246,242,233,0.75)' }}>Woander</span>
            </Link>
            <p className="text-sm leading-relaxed font-light max-w-sm mb-6" style={{ color: 'rgba(246,242,233,0.45)' }}>
              A hidden portal for explorers. Community-powered discovery of hidden India —
              built by the people who actually walk these paths.
            </p>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(246,242,233,0.25)' }}>
              Field Season 2024 · 847 Gems Catalogued
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(231,217,197,0.45)' }}>Explore</p>
            <ul className="space-y-3">
              {[
                { to: '/hidden-gems', label: 'Hidden Gems' },
                { to: '/adventures', label: 'Adventures' },
                { to: '/experiences', label: 'Experiences' },
                { to: '/vanguard', label: 'Vanguard' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm transition-colors duration-300 font-light hover:text-[#E7D9C5]" style={{ color: 'rgba(246,242,233,0.45)' }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(231,217,197,0.45)' }}>Company</p>
            <ul className="space-y-3 mb-6">
              <li><Link to="/about" className="text-sm transition-colors duration-300 font-light hover:text-[#E7D9C5]" style={{ color: 'rgba(246,242,233,0.45)' }}>About</Link></li>
              <li><p className="text-sm font-light" style={{ color: 'rgba(246,242,233,0.45)' }}>Panampilly Nagar, Kochi, Kerala</p></li>
              <li><p className="text-sm font-light" style={{ color: 'rgba(246,242,233,0.45)' }}>+91 9995134199</p></li>
              <li><p className="text-sm font-light" style={{ color: 'rgba(246,242,233,0.45)' }}>info@wakinglife.com</p></li>
            </ul>
            <div className="flex space-x-4">
              <a href="#" className="transition-colors duration-300 hover:text-[#E7D9C5]" style={{ color: 'rgba(246,242,233,0.35)' }} aria-label="Instagram">
                <Instagram className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <a href="#" className="transition-colors duration-300 hover:text-[#E7D9C5]" style={{ color: 'rgba(246,242,233,0.35)' }} aria-label="Twitter">
                <Twitter className="h-4 w-4" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderTop: '1px solid rgba(246,242,233,0.08)' }}>
          <div className="flex items-center gap-3">
            <img src="/Logo Large.jpeg" alt="Woander" className="h-5 w-5 object-contain rounded-full opacity-40" />
            <p className="text-xs font-light" style={{ color: 'rgba(246,242,233,0.3)' }}>
              © 2024 Woander. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="text-xs transition-colors hover:text-[#E7D9C5]" style={{ color: 'rgba(246,242,233,0.3)' }}>Privacy</a>
            <a href="#" className="text-xs transition-colors hover:text-[#E7D9C5]" style={{ color: 'rgba(246,242,233,0.3)' }}>Terms</a>

            <button
              onClick={() => setCoordVisible(v => !v)}
              className="font-mono text-[10px] tracking-[0.2em] transition-colors duration-700"
              style={{ color: 'rgba(231,217,197,0.2)' }}
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
