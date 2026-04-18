import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
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
import FeedbackModal from '../components/FeedbackModal';
import FeedbackList from '../components/FeedbackList';

const TouristDashboard = () => {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [myFeedback, setMyFeedback] = useState([]);
  
  // Feedback state
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  
  // Biodiversity state
  const [species, setSpecies] = useState([]);
  const [searchSpecies, setSearchSpecies] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedSpecies, setSelectedSpecies] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      const response = await api.get('/tourist/dashboard');
      setDashboardData(response.data);
      setMyFeedback(response.data.myFeedback || []);
      setFeedbackLoading(false);
      
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
  }, []);

  // Booking functions
  const handleCreateBooking = async (bookingData) => {
    try {
      const response = await api.post('/tourist/bookings/create', bookingData);
      await loadDashboardData();
      setShowBookingModal(false);
      setEditingItem(null);
      toast.success('Booking created successfully!');
    } catch (error) {
      console.error('Failed to create booking:', error);
      toast.error('Failed to create booking: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditBooking = async (bookingData) => {
    try {
      await api.put(`/tourist/bookings/${bookingData.id}`, bookingData);
      await loadDashboardData();
      setShowBookingModal(false);
      setEditingItem(null);
      toast.success('Booking updated successfully!');
    } catch (error) {
      console.error('Failed to update booking:', error);
      toast.error('Failed to update booking: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.delete(`/tourist/bookings/${bookingId}`);
        await loadDashboardData();
        toast.success('Booking cancelled successfully!');
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        toast.error('Failed to cancel booking: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.post(`/tourist/bookings/${bookingId}/cancel`);
        await loadDashboardData();
        toast.success('Booking cancelled successfully!');
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        toast.error('Failed to cancel booking: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // CRUD Operations for Feedback
  const handleCreateFeedback = async (feedbackData) => {
    try {
      await api.post('/tourist/feedback/create', feedbackData);
      await loadDashboardData();
      setShowFeedbackModal(false);
      setEditingItem(null);
      toast.success('Feedback submitted successfully!');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditFeedback = async (feedbackData) => {
    try {
      await api.put(`/tourist/feedback/${feedbackData.id}`, feedbackData);
      await loadDashboardData();
      setShowFeedbackModal(false);
      setEditingItem(null);
      toast.success('Feedback updated successfully!');
    } catch (error) {
      console.error('Failed to update feedback:', error);
      toast.error('Failed to update feedback: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteFeedback = async (feedbackId) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await api.delete(`/tourist/feedback/${feedbackId}`);
        await loadDashboardData();
        toast.success('Feedback deleted successfully!');
      } catch (error) {
        console.error('Failed to delete feedback:', error);
        toast.error('Failed to delete feedback: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // CRUD Operations for Profile
  const handleUpdateProfile = async (profileData) => {
    try {
      await api.put('/tourist/profile', profileData);
      await loadDashboardData();
      setShowProfileModal(false);
      setEditingItem(null);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      await api.post(`/tourist/feedback/${selectedBooking.id}`, feedbackData);
      await loadDashboardData();
      await loadMyFeedback();
      setShowFeedbackModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  };

  const handleOpenFeedbackModal = (booking) => {
    setSelectedBooking(booking);
    setShowFeedbackModal(true);
  };

  const canGiveFeedback = (booking) => {
    return booking.status === 'APPROVED' || booking.status === 'COMPLETED';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

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
              <Logo size="medium" variant="icon-only" />
              <h1 className="text-2xl font-bold text-primary-800 ml-3">Tourist Dashboard</h1>
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
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${
                    booking.status === 'APPROVED' ? 'text-green-600' : 
                    booking.status === 'PENDING' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    {booking.status}
                  </span>
                  {canGiveFeedback(booking) && (
                    <button
                      onClick={() => handleOpenFeedbackModal(booking)}
                      className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Feedback
                    </button>
                  )}
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

        {/* My Feedback */}
        <section className="glass-card p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">My Feedback</h3>
          <FeedbackList 
            feedbacks={myFeedback} 
            loading={feedbackLoading}
            showUser={false}
          />
        </section>
      </main>

      {/* Feedback Modal */}
      <FeedbackModal
        booking={selectedBooking}
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleSubmitFeedback}
      />
    </div>
  );
};

export default TouristDashboard;
