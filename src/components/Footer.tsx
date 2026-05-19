import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <img src="/Logo Large.jpeg" alt="Woander" className="h-10 w-10 object-contain rounded-full" />
              <span className="text-2xl font-bold font-libra">Woander</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your gateway to India's most incredible landscapes and unforgettable experiences.
              Wander where wonder awaits.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-coral-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-teal-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-coral-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#home" className="text-gray-400 hover:text-teal-500 transition-colors">Home</a></li>
              <li><a href="#destinations" className="text-gray-400 hover:text-teal-500 transition-colors">Destinations</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-teal-500 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-500 transition-colors">Tours</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-500 transition-colors">Gallery</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Destinations</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-teal-500 transition-colors">Himalayas</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-500 transition-colors">Rajasthan</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-500 transition-colors">Kerala</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-500 transition-colors">Goa</a></li>
              <li><a href="#" className="text-gray-400 hover:text-teal-500 transition-colors">Andaman</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-teal-500 mt-1" />
                <p className="text-gray-400">
                  3rd Floor, JC Chambers, Building No. 60, 44. V-56,<br />
                  Panampilly Nagar, Kochi, Kerala - 682036
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-teal-500" />
                <p className="text-gray-400">+91 9995134199</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-teal-500" />
                <p className="text-gray-400">info@wakinglife.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Woander. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-teal-500 transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-teal-500 transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-teal-500 transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;