import React from 'react';
import { Phone, Mail, MapPin, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-forest-950 text-mist-300/80 border-t border-gold-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src="/Logo Large.jpeg" alt="Woander" className="h-9 w-9 object-contain rounded-sm opacity-80" />
              <span
                className="text-lg font-serif text-mist-100 tracking-wider"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Woander
              </span>
            </div>
            <p className="text-sm text-mist-500/70 mb-6 leading-relaxed">
              A community of modern explorers, pathfinders, and curious observers.
              <br className="hidden sm:block" />
              <span className="text-mist-400/50 italic">
                Not tourists.
              </span>
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center border border-mist-700/30 text-mist-500/60 hover:border-gold-500/30 hover:text-gold-400 transition-all duration-300"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 flex items-center justify-center border border-mist-700/30 text-mist-500/60 hover:border-gold-500/30 hover:text-gold-400 transition-all duration-300"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-mist-500/50 mb-6">Explore</h3>
            <ul className="space-y-3">
              {['Hidden Gems', 'Adventures', 'Destinations', 'Experiences'].map(link => (
                <li key={link}>
                  <a href="#" className="text-sm text-mist-500/70 hover:text-mist-200 transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-mist-500/50 mb-6">Community</h3>
            <ul className="space-y-3">
              {['Gem Founders', 'Contributors', 'Become a Guide', 'Submit a Place'].map(link => (
                <li key={link}>
                  <a href="#" className="text-sm text-mist-500/70 hover:text-mist-200 transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-mist-500/50 mb-6">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-3.5 w-3.5 text-gold-500/50 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-mist-500/70">
                  Panampilly Nagar,<br />
                  Kochi, Kerala
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-3.5 w-3.5 text-gold-500/50 flex-shrink-0" />
                <a href="tel:+919995134199" className="text-sm text-mist-500/70 hover:text-mist-200 transition-colors duration-300">
                  +91 99951 34199
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-3.5 w-3.5 text-gold-500/50 flex-shrink-0" />
                <a href="mailto:hello@woander.life" className="text-sm text-mist-500/70 hover:text-mist-200 transition-colors duration-300">
                  hello@woander.life
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Coordinate Signature */}
        <div className="mt-16 pt-8 border-t border-mist-800/30">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Philosophical Quote */}
            <p
              className="text-xs text-mist-600/50 italic tracking-wider"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              "The map is never the territory."
            </p>

            {/* Coordinates */}
            <div className="hidden md:flex items-center gap-6 text-[10px] text-mist-600/30 font-mono tracking-widest">
              <span>10.0° N</span>
              <span className="w-px h-3 bg-mist-700/30" />
              <span>76.3° E</span>
              <span className="w-px h-3 bg-mist-700/30" />
              <span className="text-gold-500/30">KOCHI</span>
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-4 text-[10px] text-mist-600/40 uppercase tracking-wider">
              <span>{currentYear} Woander</span>
              <span className="w-px h-3 bg-mist-700/30" />
              <a href="#" className="hover:text-mist-500 transition-colors">Privacy</a>
              <span className="w-px h-3 bg-mist-700/30" />
              <a href="#" className="hover:text-mist-500 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
