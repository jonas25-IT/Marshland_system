import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  LogOut, 
  Plus, 
  Calendar, 
  MapPin, 
  Eye, 
  Edit, 
  Trash2, 
  Star, 
  MessageSquare, 
  Clock, 
  Users, 
  Camera, 
  Heart, 
  CheckCircle, 
  AlertTriangle,
  Download,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';

const TouristDashboardNew = () => {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        const [bookingsResponse, statsResponse] = await Promise.all([
          api.get('/tourist/bookings'),
          api.get('/tourist/dashboard-stats')
        ]);

        setBookings(bookingsResponse.data || []);
        setDashboardData(statsResponse.data || {});
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [api]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBookingAction = async (action, bookingId) => {
    try {
      switch (action) {
        case 'view':
          navigate(`/tourist/booking/${bookingId}`);
          break;
        case 'cancel':
          if (window.confirm('Are you sure you want to cancel this booking?')) {
            await api.post(`/tourist/bookings/${bookingId}/cancel`);
            setBookings(bookings.filter(b => b.bookingId !== bookingId));
          }
          break;
        case 'modify':
          setSelectedBooking(bookings.find(b => b.bookingId === bookingId));
          setShowBookingModal(true);
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} booking:`, error);
    }
  };

  const handleUpdateBooking = async (bookingData) => {
    try {
      const response = await api.put(`/tourist/bookings/${selectedBooking.bookingId}`, bookingData);
      setBookings(bookings.map(b => b.bookingId === selectedBooking.bookingId ? response.data : b));
      setShowBookingModal(false);
      setSelectedBooking(null);
      
      setNotifications([{
        id: Date.now(),
        type: 'success',
        message: 'Booking updated successfully'
      }]);
    } catch (error) {
      setNotifications([{
        id: Date.now(),
        type: 'error',
        message: 'Failed to update booking'
      }]);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await api.post('/tourist/feedback', feedback);
      setFeedback({ rating: 5, comment: '' });
      setShowFeedbackModal(false);
      
      setNotifications([{
        id: Date.now(),
        type: 'success',
        message: 'Feedback submitted successfully'
      }]);
    } catch (error) {
      setNotifications([{
        id: Date.now(),
        type: 'error',
        message: 'Failed to submit feedback'
      }]);
    }
  };

  const filteredBookings = bookings.filter(booking => 
    filterStatus === 'all' || 
    booking.status === filterStatus ||
    booking.commonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.scientificName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.visitDate?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">Tourist Dashboard</h1>
              <span className="ml-2 text-sm text-gray-500">Explore & Experience Nature</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.firstName} {user?.lastName}</span>
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-center mb-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <h3 className="ml-2 text-lg font-semibold">Notifications</h3>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start p-3 hover:bg-gray-50 rounded">
                  <div className={`w-2 h-2 rounded-full mt-1 ${
                    notification.type === 'success' ? 'bg-green-100' :
                    notification.type === 'error' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}></div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500">{new Date(notification.id).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {['overview', 'bookings', 'gallery', 'feedback'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'overview' && <Star className="h-4 w-4 mr-2" />}
                  {tab === 'bookings' && <Calendar className="h-4 w-4 mr-2" />}
                  {tab === 'gallery' && <Camera className="h-4 w-4 mr-2" />}
                  {tab === 'feedback' && <MessageSquare className="h-4 w-4 mr-2" />}
                  <span className="capitalize">{tab}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-blue-500 to-green-600 p-8 rounded-lg shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to Marshland!</h2>
                  <p className="text-gray-100">Discover the beauty of Rwanda's biodiversity</p>
                </div>
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-100">{user?.firstName}</p>
                <p className="text-xs text-gray-200">Tourist</p>
              </div>
            </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors">
                  <Calendar className="h-8 w-8 text-white mb-2" />
                  <span className="ml-2">Book a Visit</span>
                </button>
                <button className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors">
                  <MapPin className="h-8 w-8 text-white mb-2" />
                  <span className="ml-2">Explore Species</span>
                </button>
                <button className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors">
                  <Camera className="h-8 w-8 text-white mb-2" />
                  <span className="ml-2">View Gallery</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">My Bookings</h3>
                    <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                    <p className="text-sm text-gray-500">Total visits planned</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">Species Seen</h3>
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.stats?.speciesSeen || 0}</p>
                    <p className="text-sm text-gray-500">Unique species identified</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">Feedback Given</h3>
                    <p className="text-3xl font-bold text-gray-900">{dashboardData.stats?.feedbackGiven || 0}</p>
                    <p className="text-sm text-gray-500">Reviews submitted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Booking
                  </button>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Bookings</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visit Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visitors
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.bookingId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{booking.bookingId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.visitDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.numberOfVisitors}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleBookingAction('view', booking.bookingId)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleBookingAction('modify', booking.bookingId)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleBookingAction('cancel', booking.bookingId)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Biodiversity Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Gallery Items */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src={`https://picsum.photos/seed/marshland${item}/150/150`}
                    alt={`Species ${item}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">Species {item}</h3>
                    <p className="text-sm text-gray-600">Native to Rwanda</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                        Protected
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Share Your Experience</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Your Experience</label>
                <textarea
                  rows="4"
                  value={feedback.comment}
                  onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share your thoughts about the biodiversity you observed..."
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      className={`w-8 h-8 ${feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitFeedback}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 m-4 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedBooking.bookingId ? 'Edit Booking' : 'New Booking'}
              </h3>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedBooking(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (selectedBooking.bookingId) {
                handleUpdateBooking({
                  visitDate: e.target.visitDate.value,
                  numberOfVisitors: e.target.numberOfVisitors.value
                });
              } else {
                handleBookingAction('create', {
                  visitDate: e.target.visitDate.value,
                  numberOfVisitors: e.target.numberOfVisitors.value
                });
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Visit Date *</label>
                  <input
                    type="date"
                    name="visitDate"
                    required
                    defaultValue={selectedBooking.visitDate}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Number of Visitors *</label>
                  <input
                    type="number"
                    name="numberOfVisitors"
                    required
                    min="1"
                    max="10"
                    defaultValue={selectedBooking.numberOfVisitors}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    {selectedBooking.bookingId ? 'Update Booking' : 'Create Booking'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristDashboardNew;
