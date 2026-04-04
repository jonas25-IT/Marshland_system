import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Calendar, 
  Leaf, 
  TrendingUp, 
  Home, 
  User, 
  LogOut,
  BarChart3,
  Settings,
  FileText,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Eye
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // CRUD state
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [species, setSpecies] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      // Load dashboard overview
      const dashboardResponse = await api.get('/admin/dashboard');
      setDashboardData(dashboardResponse.data);
      
      // Load all data for CRUD operations
      const [usersResponse, bookingsResponse, speciesResponse] = await Promise.all([
        api.get('/admin/users'),
        api.get('/booking/all'),
        api.get('/admin/species/all')
      ]);
      
      setUsers(usersResponse.data);
      setBookings(bookingsResponse.data);
      setSpecies(speciesResponse.data);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set mock data as fallback
      setDashboardData({
        totalUsers: 4,
        totalBookings: 0,
        totalSpecies: 9,
        pendingBookings: 0,
        recentUsers: [
          { id: 15, name: 'Admin User', email: 'admin@rugezi.rw', role: 'ADMIN', createdAt: '2026-03-12' },
          { id: 16, name: 'Jean Munyaneza', email: 'ecologist@rugezi.rw', role: 'ECOLOGIST', createdAt: '2026-03-12' },
        ],
        recentBookings: [],
      });
      
      // Mock data for CRUD (real data will come from database)
      setUsers([
        { id: 15, name: 'Admin User', email: 'admin@rugezi.rw', role: 'ADMIN', createdAt: '2026-03-12', enabled: true },
        { id: 16, name: 'Jean Munyaneza', email: 'ecologist@rugezi.rw', role: 'ECOLOGIST', createdAt: '2026-03-12', enabled: true },
        { id: 17, name: 'Sarah Johnson', email: 'tourist@rugezi.rw', role: 'TOURIST', createdAt: '2026-03-12', enabled: true },
        { id: 18, name: 'Emmanuel Niyonzima', email: 'staff@rugezi.rw', role: 'STAFF', createdAt: '2026-03-12', enabled: true },
      ]);
      
      setBookings([]);
      
      setSpecies([
        { id: 1, scientificName: 'Cyperus papyrus', commonName: 'Papyrus', type: 'FLORA', conservationStatus: 'Least Concern', description: 'A tall aquatic sedge that forms dense stands in wetlands.', addedBy: 'Admin', dateAdded: '2026-02-25' },
        { id: 2, scientificName: 'Phragmites australis', commonName: 'Common Reed', type: 'FLORA', conservationStatus: 'Least Concern', description: 'A widespread perennial grass found in wetlands.', addedBy: 'Admin', dateAdded: '2026-02-25' },
        { id: 3, scientificName: 'Typha domingensis', commonName: 'Southern Cattail', type: 'FLORA', conservationStatus: 'Least Concern', description: 'A marsh plant with distinctive brown flower spikes.', addedBy: 'Admin', dateAdded: '2026-02-25' },
        { id: 4, scientificName: 'Nymphaea lotus', commonName: 'White Water Lily', type: 'FLORA', conservationStatus: 'Least Concern', description: 'Beautiful aquatic plant with floating leaves.', addedBy: 'Admin', dateAdded: '2026-02-25' },
        { id: 5, scientificName: 'Balearica regulorum', commonName: 'Grey Crowned Crane', type: 'FAUNA', conservationStatus: 'Endangered', description: 'An iconic bird species with distinctive golden crown.', addedBy: 'Admin', dateAdded: '2026-02-25' },
        { id: 6, scientificName: 'Ardea cinerea', commonName: 'Grey Heron', type: 'FAUNA', conservationStatus: 'Least Concern', description: 'A large wading bird commonly found in wetlands.', addedBy: 'Admin', dateAdded: '2026-02-25' },
        { id: 7, scientificName: 'Anas platyrhynchos', commonName: 'Mallard', type: 'FAUNA', conservationStatus: 'Least Concern', description: 'One of the most recognizable duck species.', addedBy: 'Admin', dateAdded: '2026-02-25' },
        { id: 8, scientificName: 'Haliaeetus vociferoides', commonName: 'African Fish Eagle', type: 'FAUNA', conservationStatus: 'Vulnerable', description: 'Magnificent raptor with distinctive white head.', addedBy: 'Admin', dateAdded: '2026-02-25' },
        { id: 9, scientificName: 'Ciconia ciconia', commonName: 'White Stork', type: 'FAUNA', conservationStatus: 'Least Concern', description: 'Large migratory bird known for its long-distance migrations.', addedBy: 'Admin', dateAdded: '2026-02-25' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // CRUD Operations
  const handleApproveUser = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/approve`);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, enabled: true } : user
      ));
      await loadDashboardData(); // Refresh dashboard stats
    } catch (error) {
      console.error('Failed to approve user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
        await loadDashboardData(); // Refresh dashboard stats
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      await api.post(`/booking/${bookingId}/approve`);
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: 'APPROVED' } : booking
      ));
      await loadDashboardData(); // Refresh dashboard stats
    } catch (error) {
      console.error('Failed to approve booking:', error);
    }
  };

  const handleRejectBooking = async (bookingId) => {
    try {
      await api.post(`/booking/${bookingId}/reject`);
      setBookings(bookings.map(booking => 
        booking.id === bookingId ? { ...booking, status: 'REJECTED' } : booking
      ));
      await loadDashboardData(); // Refresh dashboard stats
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  const handleDeleteSpecies = async (speciesId) => {
    if (window.confirm('Are you sure you want to delete this species?')) {
      try {
        await api.delete(`/admin/species/${speciesId}`);
        setSpecies(species.filter(spec => spec.id !== speciesId));
        await loadDashboardData(); // Refresh dashboard stats
      } catch (error) {
        console.error('Failed to delete species:', error);
      }
    }
  };

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
              <Leaf className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-primary-800">Admin Dashboard</h1>
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
          <h2 className="text-3xl font-bold text-gray-800">Welcome, Admin!</h2>
          <p className="text-gray-600">Manage the Rugezi Marshland system</p>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
                <p className="text-3xl font-bold text-primary-800">{dashboardData?.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Total Bookings</h3>
                <p className="text-3xl font-bold text-blue-600">{dashboardData?.totalBookings || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Species</h3>
                <p className="text-3xl font-bold text-green-600">{dashboardData?.totalSpecies || 0}</p>
              </div>
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Pending</h3>
                <p className="text-3xl font-bold text-orange-600">{dashboardData?.pendingBookings || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button className="glass-card p-6 text-center hover:shadow-lg transition-shadow">
            <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Manage Users</h3>
            <p className="text-sm text-gray-600">Add, edit, remove users</p>
          </button>
          
          <button className="glass-card p-6 text-center hover:shadow-lg transition-shadow">
            <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Manage Bookings</h3>
            <p className="text-sm text-gray-600">Approve, reject bookings</p>
          </button>
          
          <button className="glass-card p-6 text-center hover:shadow-lg transition-shadow">
            <Leaf className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Manage Species</h3>
            <p className="text-sm text-gray-600">Add, edit species data</p>
          </button>
          
          <button className="glass-card p-6 text-center hover:shadow-lg transition-shadow">
            <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">View Reports</h3>
            <p className="text-sm text-gray-600">Analytics & insights</p>
          </button>
        </section>

        {/* Tab Navigation */}
        <section className="glass-card p-6 mb-8">
          <div className="flex space-x-6 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users Management
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bookings'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bookings Management
            </button>
            <button
              onClick={() => setActiveTab('species')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'species'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Species Management
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Recent Users */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {dashboardData?.recentUsers?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">Role: {user.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{user.createdAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Bookings */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Bookings</h3>
                <div className="space-y-3">
                  {dashboardData?.recentBookings?.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800">{booking.user}</p>
                        <p className="text-sm text-gray-600">{booking.visitDate} • {booking.numberOfVisitors} visitors</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${
                          booking.status === 'APPROVED' ? 'text-green-600' : 
                          booking.status === 'PENDING' ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Users Management</h3>
                <button 
                  onClick={() => setShowUserModal(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {!user.enabled && (
                              <button
                                onClick={() => handleApproveUser(user.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
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

          {activeTab === 'bookings' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Bookings Management</h3>
                <button 
                  onClick={() => setShowBookingModal(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Booking
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitors</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.user?.name}</div>
                          <div className="text-sm text-gray-500">{booking.user?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.visitDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.numberOfVisitors}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.visitType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                            booking.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {booking.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApproveBooking(booking.id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectBooking(booking.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
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

          {activeTab === 'species' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Species Management</h3>
                <button 
                  onClick={() => setShowSpeciesModal(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Species
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scientific Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Common Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conservation Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {species.map((spec) => (
                      <tr key={spec.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {spec.scientificName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {spec.commonName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {spec.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            spec.conservationStatus === 'Endangered' ? 'bg-red-100 text-red-800' : 
                            spec.conservationStatus === 'Vulnerable' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {spec.conservationStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSpecies(spec.id)}
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
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
