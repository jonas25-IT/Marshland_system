import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#0D0E14] border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* About Section */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">About Marshland</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Marshland Tourism System is dedicated to preserving and showcasing the beauty of Rwanda's wetlands while promoting sustainable tourism and biodiversity conservation.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Register
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Tours
                </a>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Information</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Conservation Efforts
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Biodiversity
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  Kigali, Rwanda<br />
                  Burera District
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  +250 793 283 266
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  jonastuyisenge01@gmail.com
                </span>
              </li>
            </ul>
            <div className="mt-4">
              <a href="mailto:jonastuyisenge01@gmail.com" className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                <Mail className="w-4 h-4 mr-2" />
                Send Message
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2026 Marshland Tourism System. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="https://github.com/jonas25-IT" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center">
              <Github className="w-4 h-4 mr-1" />
              GitHub
            </a>
            <span className="text-gray-600">|</span>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
              Version 1.0.0
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
