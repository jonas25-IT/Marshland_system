import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Users, Camera, Mail, Phone, MapPin, Menu, X } from 'lucide-react';
import Logo from '../components/Logo';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      // Redirect to appropriate dashboard
      const roleDashboardMap = {
        'ADMIN': '/dashboard/admin',
        'ECOLOGIST': '/dashboard/ecologist',
        'TOURIST': '/dashboard/tourist',
        'STAFF': '/dashboard/staff',
      };
      
      const userDashboard = roleDashboardMap[user.role] || '/dashboard/tourist';
      navigate(userDashboard);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass-card fixed w-full top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo size="medium" variant="full" animated={true} />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors">About</a>
              <a href="#biodiversity" className="text-gray-700 hover:text-primary-600 transition-colors">Biodiversity</a>
              <a href="#gallery" className="text-gray-700 hover:text-primary-600 transition-colors">Gallery</a>
              <a href="#contact" className="text-gray-700 hover:text-primary-600 transition-colors">Contact</a>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {user?.name || user?.email}!</span>
                  <button
                    onClick={handleGetStarted}
                    className="btn-primary"
                  >
                    Dashboard
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link to="/login" className="btn-primary">Login</Link>
                  <Link to="/register" className="btn-secondary">Register</Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-4">
              <a href="#about" className="block text-gray-700 hover:text-primary-600">About</a>
              <a href="#biodiversity" className="block text-gray-700 hover:text-primary-600">Biodiversity</a>
              <a href="#gallery" className="block text-gray-700 hover:text-primary-600">Gallery</a>
              <a href="#contact" className="block text-gray-700 hover:text-primary-600">Contact</a>
              
              {isAuthenticated ? (
                <div className="space-y-2">
                  <span className="block text-gray-700">Welcome, {user?.name || user?.email}!</span>
                  <button
                    onClick={handleGetStarted}
                    className="btn-primary w-full"
                  >
                    Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" className="btn-primary block w-full text-center">Login</Link>
                  <Link to="/register" className="btn-secondary block w-full text-center">Register</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section h-screen flex items-center justify-center text-white" 
               style={{ backgroundImage: 'linear-gradient(rgba(45, 80, 22, 0.8), rgba(139, 195, 74, 0.8)), url(https://images.unsplash.com/photo-1540206395-68808572332f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)' }}>
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to Rugezi Marshland
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Discover the breathtaking biodiversity of one of Rwanda's most precious wetland ecosystems
          </p>
          <button
            onClick={handleGetStarted}
            className="btn-secondary text-lg px-8 py-4"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-primary-800 mb-6">About Rugezi Marshland</h2>
              <p className="text-gray-600 mb-4">
                Rugezi Marshland is a vital wetland ecosystem located in the Northern Province of Rwanda. 
                This pristine natural habitat serves as a crucial water catchment area and supports an incredible 
                diversity of plant and animal species.
              </p>
              <p className="text-gray-600 mb-4">
                Designated as a Ramsar Wetland of International Importance, Rugezi plays a essential role in 
                climate regulation, water purification, and provides livelihood opportunities for local communities.
              </p>
              <p className="text-gray-600">
                Our management system ensures sustainable tourism, conservation efforts, and educational programs 
                to protect this invaluable natural treasure for future generations.
              </p>
            </div>
            <div className="glass-card p-8 rounded-xl">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
                  <div className="text-gray-600">Bird Species</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">200+</div>
                  <div className="text-gray-600">Plant Species</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
                  <div className="text-gray-600">Mammal Species</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
                  <div className="text-gray-600">Annual Visitors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Biodiversity Section */}
      <section id="biodiversity" className="py-20 bg-primary-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-primary-800 text-center mb-12">Biodiversity Highlights</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-6 rounded-xl text-center">
              <div className="text-4xl mb-4">🦆</div>
              <h3 className="text-xl font-semibold text-primary-700 mb-2">Water Birds</h3>
              <p className="text-gray-600">Home to endangered species like the Grey Crowned Crane and various migratory birds</p>
            </div>
            <div className="glass-card p-6 rounded-xl text-center">
              <div className="text-4xl mb-4">🌾</div>
              <h3 className="text-xl font-semibold text-primary-700 mb-2">Aquatic Plants</h3>
              <p className="text-gray-600">Diverse wetland vegetation including papyrus reeds and water lilies</p>
            </div>
            <div className="glass-card p-6 rounded-xl text-center">
              <div className="text-4xl mb-4">🦌</div>
              <h3 className="text-xl font-semibold text-primary-700 mb-2">Wildlife</h3>
              <p className="text-gray-600">Supports mammals, amphibians, and countless invertebrate species</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-primary-800 text-center mb-12">Gallery</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative overflow-hidden rounded-xl">
              <img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                   alt="Marshland landscape" className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="relative overflow-hidden rounded-xl">
              <img src="https://images.unsplash.com/photo-1552728089-57bdde3f8ff5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                   alt="Birds in marshland" className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="relative overflow-hidden rounded-xl">
              <img src="https://images.unsplash.com/photo-1540206395-68808572332f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                   alt="Sunset over marshland" className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-primary-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-primary-800 text-center mb-12">Contact Us</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold text-primary-700 mb-6">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-primary-600 mr-3" />
                  <span>info@rugezimarshland.rw</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary-600 mr-3" />
                  <span>+250 788 123 456</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary-600 mr-3" />
                  <span>Northern Province, Rwanda</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-primary-700 mb-6">Send us a Message</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="input-field"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="input-field"
                />
                <textarea
                  placeholder="Your Message"
                  rows="4"
                  className="input-field"
                ></textarea>
                <button type="submit" className="btn-primary w-full">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
