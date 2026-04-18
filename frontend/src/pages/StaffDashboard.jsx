import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import toast from 'react-hot-toast';
import { 
  Users, 
  Home, 
  User, 
  LogOut,
  Calendar,
  CheckCircle,
  MessageSquare,
  Settings,
  AlertTriangle,
  Clock,
  MapPin,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  Activity,
  Bell,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Compass,
  FileText
} from 'lucide-react';

const StaffDashboard = () => {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Operational state
  const [todayBookings, setTodayBookings] = useState([]);
  const [visitorList, setVisitorList] = useState([]);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // CRUD state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showVisitDateModal, setShowVisitDateModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [visitDates, setVisitDates] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      // Load dashboard data from backend
      const response = await api.get('/staff/dashboard');
      setDashboardData(response.data);
      
      // Load today's bookings
      const bookingsResponse = await api.get('/staff/bookings/today');
      setTodayBookings(bookingsResponse.data);
      
      // Load visitor list
      const visitorsResponse = await api.get('/staff/visitors/today');
      setVisitorList(visitorsResponse.data);
      
      // Load visit dates
      const visitDatesResponse = await api.get('/staff/visit-dates');
      setVisitDates(visitDatesResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set mock data as fallback
      setDashboardData({
        pendingTasks: 8,
        todayBookings: 15,
        messages: 3,
        todayVisitors: 45,
        weekVisitors: 128,
        activeTours: 6,
        completedToday: 39,
        todaySchedule: [
          { id: 1, title: 'Morning Bird Watching', time: '09:00 AM', location: 'North Trail', status: 'completed' },
          { id: 2, title: 'Guided Nature Walk', time: '11:00 AM', location: 'Central Area', status: 'in-progress' },
          { id: 3, title: 'Photography Tour', time: '02:00 PM', location: 'South Wetlands', status: 'scheduled' },
        ],
        pendingBookings: [
          { id: 1, user: 'John Doe', visitDate: '2024-03-30', numberOfVisitors: 3, visitType: 'Guided Tour' },
          { id: 2, user: 'Jane Smith', visitDate: '2024-03-30', numberOfVisitors: 2, visitType: 'Self-Guided' },
        ],
        recentActivity: [
          { id: 1, type: 'checkin', description: 'John Doe checked in', timestamp: '10:30 AM', user: 'Staff' },
          { id: 2, type: 'booking', description: 'New booking received', timestamp: '10:15 AM', user: 'System' },
          { id: 3, type: 'checkout', description: 'Jane Smith checked out', timestamp: '09:45 AM', user: 'Staff' },
        ]
      });
      
      // Mock today's bookings
      setTodayBookings([
        { id: 1, user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }, visitDate: '2024-03-30', numberOfVisitors: 3, visitType: 'Guided Tour', status: 'CHECKED_IN', checkInTime: '09:30 AM' },
        { id: 2, user: { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }, visitDate: '2024-03-30', numberOfVisitors: 2, visitType: 'Self-Guided', status: 'PENDING', checkInTime: null },
        { id: 3, user: { firstName: 'Bob', lastName: 'Wilson', email: 'bob@example.com' }, visitDate: '2024-03-30', numberOfVisitors: 4, visitType: 'Photography Tour', status: 'SCHEDULED', checkInTime: null },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check-in functions
  const handleCheckIn = async (bookingId) => {
    try {
      await api.post(`/staff/bookings/${bookingId}/checkin`);
      await loadDashboardData();
      setShowCheckInModal(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Failed to check in visitor:', error);
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      await api.post(`/staff/bookings/${bookingId}/checkout`);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to check out visitor:', error);
    }
  };

  const handleAssistVisitor = async (bookingId, assistanceType) => {
    try {
      await api.post(`/staff/bookings/${bookingId}/assist`, { assistanceType });
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to assist visitor:', error);
    }
  };

  // CRUD Operations for Bookings
  const handleCreateBooking = async (bookingData) => {
    try {
      await api.post('/staff/bookings', bookingData);
      await loadDashboardData();
      setShowBookingModal(false);
      setEditingItem(null);
      toast.success('Booking created successfully');
    } catch (error) {
      console.error('Failed to create booking:', error);
      toast.error('Failed to create booking: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditBooking = async (bookingData) => {
    try {
      await api.put(`/staff/bookings/${bookingData.id}`, bookingData);
      await loadDashboardData();
      setShowBookingModal(false);
      setEditingItem(null);
      toast.success('Booking updated successfully');
    } catch (error) {
      console.error('Failed to update booking:', error);
      toast.error('Failed to update booking: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.delete(`/staff/bookings/${bookingId}`);
        await loadDashboardData();
        toast.success('Booking deleted successfully');
      } catch (error) {
        console.error('Failed to delete booking:', error);
        toast.error('Failed to delete booking: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // CRUD Operations for Visit Dates
  const handleCreateVisitDate = async (visitDateData) => {
    try {
      await api.post('/staff/visit-dates', visitDateData);
      await loadDashboardData();
      setShowVisitDateModal(false);
      setEditingItem(null);
      toast.success('Visit date created successfully');
    } catch (error) {
      console.error('Failed to create visit date:', error);
      toast.error('Failed to create visit date: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditVisitDate = async (visitDateData) => {
    try {
      await api.put(`/staff/visit-dates/${visitDateData.id}`, visitDateData);
      await loadDashboardData();
      setShowVisitDateModal(false);
      setEditingItem(null);
      toast.success('Visit date updated successfully');
    } catch (error) {
      console.error('Failed to update visit date:', error);
      toast.error('Failed to update visit date: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteVisitDate = async (visitDateId) => {
    if (window.confirm('Are you sure you want to delete this visit date?')) {
      try {
        await api.delete(`/staff/visit-dates/${visitDateId}`);
        await loadDashboardData();
        toast.success('Visit date deleted successfully');
      } catch (error) {
        console.error('Failed to delete visit date:', error);
        toast.error('Failed to delete visit date: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []); // Empty dependency array to run only once

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
              <h1 className="text-2xl font-bold text-primary-800 ml-3">Staff Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {String(user?.name || user?.email || 'Staff')}</span>
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
          <h2 className="text-3xl font-bold text-gray-800">Welcome, Staff!</h2>
          <p className="text-gray-600">Manage daily operations and visitor services</p>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Pending Tasks</h3>
                <p className="text-3xl font-bold text-orange-600">{dashboardData?.pendingTasks || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Today's Bookings</h3>
                <p className="text-3xl font-bold text-blue-600">{dashboardData?.todayBookings || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">New Messages</h3>
                <p className="text-3xl font-bold text-green-600">{dashboardData?.messages || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Today's Visitors</h3>
                <p className="text-3xl font-bold text-primary-800">{dashboardData?.todayVisitors || 0}</p>
              </div>
              <Users className="h-8 w-8 text-primary-600" />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button className="glass-card p-6 text-center hover:shadow-lg transition-shadow">
            <CheckCircle className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Check-in Visitor</h3>
            <p className="text-sm text-gray-600">Register arrival</p>
          </button>
          
          <button className="glass-card p-6 text-center hover:shadow-lg transition-shadow">
            <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">View Bookings</h3>
            <p className="text-sm text-gray-600">Manage reservations</p>
          </button>
          
          <button className="glass-card p-6 text-center hover:shadow-lg transition-shadow">
            <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Messages</h3>
            <p className="text-sm text-gray-600">View inquiries</p>
          </button>
        </section>

        {/* Today's Schedule */}
        <section className="glass-card p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Today's Schedule</h3>
          <div className="space-y-3">
            {dashboardData?.todaySchedule?.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                    item.status === 'completed' ? 'bg-green-500' : 
                    item.status === 'in-progress' ? 'bg-blue-500' : 
                    'bg-gray-500'
                  }`}>
                    {item.status === 'completed' ? '✓' : 
                     item.status === 'in-progress' ? '→' : 
                     '○'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.time} - {item.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    item.status === 'completed' ? 'text-green-600' : 
                    item.status === 'in-progress' ? 'text-blue-600' : 
                    'text-gray-600'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pending Bookings */}
        <section className="glass-card p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Pending Bookings</h3>
          <div className="space-y-3">
            {dashboardData?.pendingBookings?.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-10 w-10 text-orange-500 mr-3" />
                  <div>
                    <p className="font-semibold text-gray-800">{booking.user?.firstName && booking.user?.lastName ? `${booking.user.firstName} ${booking.user.lastName}` : String(booking.user?.email || booking.user)}</p>
                    <p className="text-sm text-gray-600">{booking.visitDate} • {booking.numberOfVisitors} visitors</p>
                    <p className="text-sm text-gray-500">{booking.visitType}</p>
                  </div>
                </div>
                <div className="text-right space-x-2">
                  <button className="text-green-600 hover:text-green-800 text-sm">Approve</button>
                  <button className="text-red-600 hover:text-red-800 text-sm">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="glass-card p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {dashboardData?.recentActivity?.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-3 ${
                    activity.type === 'checkin' ? 'bg-green-500' : 
                    activity.type === 'checkout' ? 'bg-blue-500' : 
                    activity.type === 'booking' ? 'bg-orange-500' : 
                    'bg-gray-500'
                  }`}>
                    {activity.type === 'checkin' ? '✓' : 
                     activity.type === 'checkout' ? '←' : 
                     activity.type === 'booking' ? '📅' : 
                     '📋'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{activity.description}</p>
                    <p className="text-sm text-gray-600">{activity.timestamp}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">{activity.user?.firstName && activity.user?.lastName ? `${activity.user.firstName} ${activity.user.lastName}` : String(activity.user?.email || activity.user)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StaffDashboard;
