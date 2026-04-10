import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Home, 
  User, 
  LogOut,
  Plus,
  Camera,
  Star,
  Clock,
  MapPin,
  Search,
  Filter,
  Heart,
  MessageSquare,
  Eye,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bird,
  Trees,
  Fish,
  Bug
} from 'lucide-react';

const TouristDashboard = () => {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Biodiversity state
  const [species, setSpecies] = useState([]);
  const [searchSpecies, setSearchSpecies] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/tourist/dashboard');
      setDashboardData(response.data);
      
      // Load species data for biodiversity gallery
      const speciesResponse = await api.get('/species/public');
      setSpecies(speciesResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set mock data as fallback
      setDashboardData({
        totalBookings: 8,
        upcomingBookings: 2,
        completedBookings: 5,
        pendingBookings: 1,
        bookings: [
          { id: 1, visitDate: '2024-04-01', numberOfVisitors: 3, status: 'APPROVED', visitType: 'Guided Tour' },
          { id: 2, visitDate: '2024-04-05', numberOfVisitors: 2, status: 'PENDING', visitType: 'Self-Guided' },
          { id: 3, visitDate: '2024-03-20', numberOfVisitors: 4, status: 'COMPLETED', visitType: 'Photography Tour' },
        ],
        availableDates: [
          { id: 1, date: '2024-04-02', availableSpots: 8, maxCapacity: 15 },
          { id: 2, date: '2024-04-03', availableSpots: 12, maxCapacity: 15 },
          { id: 3, date: '2024-04-04', availableSpots: 5, maxCapacity: 15 },
        ]
      });
      
      // Mock species data
      setSpecies([
        { id: 1, scientificName: 'Ardea cinerea', commonName: 'Grey Heron', type: 'BIRD', conservationStatus: 'Least Concern', imageUrl: '/images/grey-heron.jpg', description: 'Large wading bird found in wetlands' },
        { id: 2, scientificName: 'Nymphaea lotus', commonName: 'Egyptian Water Lily', type: 'PLANT', conservationStatus: 'Least Concern', imageUrl: '/images/water-lily.jpg', description: 'Beautiful aquatic flowering plant' },
        { id: 3, scientificName: 'Hippopotamus amphibius', commonName: 'Hippopotamus', type: 'MAMMAL', conservationStatus: 'Vulnerable', imageUrl: '/images/hippo.jpg', description: 'Large semi-aquatic mammal' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  // Booking functions
  const handleCreateBooking = async (bookingData) => {
    try {
      const response = await api.post('/tourist/bookings/create', bookingData);
      await loadDashboardData();
      setShowBookingModal(false);
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      await api.post(`/tourist/feedback/${selectedBooking.id}`, feedbackData);
      await loadDashboardData();
      setShowFeedbackModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="glass-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-primary-800">Tourist Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name || user?.email}</span>
              <button
                onClick={() => navigate('/')}
                className="btn-outline"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Welcome, Tourist!</h2>
          <p className="text-gray-600">Plan your visit to Rugezi Marshland</p>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Total Bookings</h3>
                <p className="text-3xl font-bold text-primary-800">{dashboardData?.totalBookings || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Upcoming</h3>
                <p className="text-3xl font-bold text-blue-600">{dashboardData?.upcomingBookings || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Completed</h3>
                <p className="text-3xl font-bold text-green-600">{dashboardData?.completedBookings || 0}</p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Pending</h3>
                <p className="text-3xl font-bold text-orange-600">{dashboardData?.pendingBookings || 0}</p>
              </div>
              <Plus className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button className="glass-card p-6 text-center hover:shadow-lg transition-shadow">
            <Plus className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Book a Visit</h3>
            <p className="text-sm text-gray-600">Schedule your visit</p>
          </button>
          
          <button className="glass-card p-6 text-center hover:shadow-lg transition-shadow">
            <Camera className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Explore Species</h3>
            <p className="text-sm text-gray-600">Discover wildlife</p>
          </button>
          
          <button className="glass-card p-6 text-center hover:shadow-lg transition-shadow">
            <Star className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Photo Gallery</h3>
            <p className="text-sm text-gray-600">View photos</p>
          </button>
        </section>

        {/* My Bookings */}
        <section className="glass-card p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">My Bookings</h3>
          <div className="space-y-3">
            {dashboardData?.bookings?.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-10 w-10 text-blue-500 mr-4" />
                  <div>
                    <p className="font-semibold text-gray-800">{booking.visitDate}</p>
                    <p className="text-sm text-gray-600">{booking.visitType} • {booking.numberOfVisitors} visitors</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    booking.status === 'APPROVED' ? 'text-green-600' : 
                    booking.status === 'PENDING' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Available Dates */}
        <section className="glass-card p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Available Visit Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData?.availableDates?.map((date) => (
              <div key={date.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-800">{date.date}</h4>
                  <span className={`text-sm ${
                    date.availableSpots > 5 ? 'text-green-600' : 
                    date.availableSpots > 0 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {date.availableSpots} spots left
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Capacity: {date.maxCapacity} • Available: {date.availableSpots}
                </div>
                {date.availableSpots > 0 && (
                  <button className="btn-primary w-full mt-3">Book Now</button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TouristDashboard;
