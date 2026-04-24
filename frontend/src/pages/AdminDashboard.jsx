import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import DashboardLayout, { StatCard, ActivityItem } from '../components/DashboardLayout';
import {
  Users, UserCheck, UserX, BarChart3,
  TrendingUp, Activity, Calendar, FileText,
  Shield, AlertTriangle, Eye, Edit, Trash2,
  Plus, Search, Filter, Download, RefreshCw,
  Check, X, Image as ImageIcon, MessageSquare, Leaf, Database, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import GalleryManagement from '../components/GalleryManagement';
import FeedbackList from '../components/FeedbackList';
import Settings from '../components/Settings';
import Profile from '../components/Profile';
import SystemActivityMonitor from '../components/SystemActivityMonitor';

const AdminDashboard = () => {
  const { user, isAuthenticated, logout, api } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Helper function to construct full image URL
  const getImageUrl = (imageUrl, fallbackKeyword = 'nature') => {
    if (!imageUrl) {
      return `https://source.unsplash.com/100x100/?${fallbackKeyword}`;
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Replace hardcoded port 8081 with 8083 if present
      let url = imageUrl.replace(':8081', ':8083');
      // Use API endpoint for better URL decoding support
      if (url.includes('/uploads/species/')) {
        const filename = url.split('/uploads/species/').pop();
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api';
        return `${apiBaseUrl}/files/species/${encodeURIComponent(filename)}`;
      }
      return url;
    }
    // Extract filename and use API endpoint for proper URL decoding
    let filename = imageUrl.startsWith('/') ? imageUrl.split('/').pop() : imageUrl;
    // Handle existing records that have /uploads/ prefix
    if (filename.startsWith('/uploads/')) {
      filename = filename.split('/uploads/').pop();
    }
    if (filename.startsWith('species/')) {
      filename = filename.split('species/').pop();
    }
    
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api';
    const fullUrl = `${apiBaseUrl}/files/species/${encodeURIComponent(filename)}`;
    console.log('Species Image URL:', fullUrl);
    return fullUrl;
  };
  
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [species, setSpecies] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSpeciesModalOpen, setIsSpeciesModalOpen] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState(null);
  const [speciesImageFile, setSpeciesImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [reportsData, setReportsData] = useState(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    selectedUserIds: [],
    title: '',
    message: '',
    type: 'INFO',
    link: ''
  });
  const [broadcastToAll, setBroadcastToAll] = useState(false);
  const [allNotifications, setAllNotifications] = useState([]);
  const [editingNotification, setEditingNotification] = useState(null);
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Debug: Check authentication state
      console.log('Current user:', user);
      console.log('User role:', user?.role);
      console.log('Is authenticated:', isAuthenticated);
      
      // Debug: Check JWT token
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token value:', token ? token.substring(0, 50) + '...' : 'null');
      
      // Test authentication first
      // Test authentication and get verified role from server
      try {
        const authTest = await api.get('/auth/profile');
        console.log('Server verified user:', authTest.data);
        
        const serverRole = authTest.data.role || '';
        const isAdmin = serverRole.toUpperCase().includes('ADMIN');
        
        if (!isAdmin) {
          console.error('User lacks administrative authority:', serverRole);
          toast.error('Access denied. Admin privileges required.');
          navigate('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Authority verification failed:', error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          toast.error('Session out of sync. Re-authenticating...');
          // Clear stale session data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => {
            navigate('/login');
          }, 1500);
        } else {
          toast.error('Connectivity error during authority verification.');
        }
        return;
      }
      
      const [dbRes, usersRes, bookingsRes, speciesRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/bookings/all'),
        api.get('/admin/species/all')
      ]);
      
      // Extract data safely regardless of wrapping
      const getListData = (res) => res.data?.data || res.data || [];
      
      setDashboardData(dbRes.data);
      setUsers(getListData(usersRes));
      setBookings(getListData(bookingsRes));
      setSpecies(getListData(speciesRes));
    } catch (error) {
      console.error('Data load failed:', error);
      console.error('Error details:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 403) {
        toast.error('Access denied. You may not have admin privileges.');
        console.error('403 Forbidden - User may not have ADMIN role');
        // Don't auto-redirect for debugging
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        console.error('401 Unauthorized - Session expired');
        // Don't auto-redirect for debugging
      } else {
        toast.error('System synchronization failed. Verify database connectivity.');
      }
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadReports = useCallback(async () => {
    try {
      const response = await api.get('/admin/analytics/reports');
      setReportsData(response.data);
    } catch (e) {
      console.error('Reports load error:', e);
      toast.error('Failed to load reports');
    }
  }, [api]);

  const exportToCSV = () => {
    if (!reportsData) return;

    const csvContent = [
      ['Report Category', 'Metric', 'Value'],
      ['User Statistics', 'Total Users', reportsData.userStats?.total || 0],
      ['User Statistics', 'Active Users', reportsData.userStats?.active || 0],
      ['User Statistics', 'New This Month', reportsData.userStats?.newThisMonth || 0],
      ['User Statistics', 'Admins', reportsData.userStats?.admins || 0],
      ['Booking Statistics', 'Total Bookings', reportsData.bookingStats?.total || 0],
      ['Booking Statistics', 'Pending', reportsData.bookingStats?.pending || 0],
      ['Booking Statistics', 'Approved', reportsData.bookingStats?.approved || 0],
      ['Booking Statistics', 'Rejected', reportsData.bookingStats?.rejected || 0]
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marshland_reports.csv';
    a.click();
  };

  const handleCreateNotification = async () => {
    try {
      if (broadcastToAll) {
        // Broadcast to all users
        console.log('Users available:', users);
        const allUsers = users.map(u => Number(u.userId));
        console.log('Broadcasting to all users:', allUsers);
        await api.post('/notifications/broadcast', {
          userIds: allUsers,
          title: notificationForm.title,
          message: notificationForm.message,
          type: notificationForm.type,
          link: notificationForm.link || null
        });
        toast.success('Notification broadcasted to all users');
      } else {
        // Send to selected users
        if (notificationForm.selectedUserIds.length === 0) {
          toast.error('Please select at least one user');
          return;
        }
        const selectedIds = notificationForm.selectedUserIds.map(id => Number(id));
        console.log('Selected user IDs:', selectedIds);
        await api.post('/notifications/broadcast', {
          userIds: selectedIds,
          title: notificationForm.title,
          message: notificationForm.message,
          type: notificationForm.type,
          link: notificationForm.link || null
        });
        toast.success(`Notification sent to ${notificationForm.selectedUserIds.length} user(s)`);
      }
      setShowNotificationModal(false);
      setBroadcastToAll(false);
      setNotificationForm({
        selectedUserIds: [],
        title: '',
        message: '',
        type: 'INFO',
        link: ''
      });
      loadAllNotifications();
    } catch (error) {
      console.error('Failed to create notification:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      if (error.response?.data?.error) {
        toast.error(`Failed: ${error.response.data.error}`);
      } else {
        toast.error('Failed to create notification');
      }
    }
  };

  const loadAllNotifications = async () => {
    try {
      const response = await api.get('/notifications/admin/all');
      setAllNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleEditNotification = (notification) => {
    setEditingNotification(notification);
    setNotificationForm({
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.link || ''
    });
    setShowNotificationModal(true);
  };

  const handleUpdateNotification = async () => {
    try {
      const payload = {
        ...notificationForm,
        userId: parseInt(notificationForm.userId)
      };
      await api.put(`/notifications/admin/${editingNotification.notificationId}`, payload);
      toast.success('Notification updated successfully');
      setShowNotificationModal(false);
      setEditingNotification(null);
      setNotificationForm({
        userId: '',
        title: '',
        message: '',
        type: 'INFO',
        link: ''
      });
      loadAllNotifications();
    } catch (error) {
      console.error('Failed to update notification:', error);
      toast.error('Failed to update notification');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await api.delete(`/notifications/admin/${notificationId}`);
      toast.success('Notification deleted successfully');
      loadAllNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  useEffect(() => {
    if (activeTab === 'notifications') {
      loadAllNotifications();
    }
  }, [activeTab]);

  const exportUsersCSV = () => {
    if (!users.length) {
      toast.error('No users to export');
      return;
    }

    const csvContent = [
      ['User ID', 'First Name', 'Last Name', 'Email', 'Role', 'Phone', 'Registration Date', 'Active'],
      ...users.map(u => [
        u.userId,
        u.firstName,
        u.lastName,
        u.email,
        u.role,
        u.phone || 'N/A',
        u.registrationDate || 'N/A',
        u.isActive ? 'Yes' : 'No'
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Users exported successfully');
  };

  const exportSpeciesCSV = () => {
    if (!species.length) {
      toast.error('No species to export');
      return;
    }

    const csvContent = [
      ['Species ID', 'Common Name', 'Scientific Name', 'Type', 'Conservation Status', 'Habitat', 'Description'],
      ...species.map(s => [
        s.speciesId,
        s.commonName,
        s.scientificName,
        s.type,
        s.conservationStatus,
        s.habitat || 'N/A',
        s.description || 'N/A'
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `species_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Species exported successfully');
  };

  const exportBookingsCSV = () => {
    if (!bookings.length) {
      toast.error('No bookings to export');
      return;
    }

    const csvContent = [
      ['Booking ID', 'User', 'Visit Date', 'Number of Visitors', 'Status', 'Booking Date', 'Special Requests'],
      ...bookings.map(b => [
        b.bookingId,
        b.user?.firstName + ' ' + b.user?.lastName || 'N/A',
        b.visitDate?.visitDate || 'N/A',
        b.numberOfVisitors,
        b.bookingStatus,
        b.bookingDate || 'N/A',
        b.specialRequests || 'N/A'
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Bookings exported successfully');
  };

  const exportVisitDatesCSV = async () => {
    try {
      const response = await api.get('/visit-dates');
      const visitDates = response.data || [];

      if (!visitDates.length) {
        toast.error('No visit dates to export');
        return;
      }

      const csvContent = [
        ['Date ID', 'Visit Date', 'Max Capacity', 'Current Bookings', 'Remaining Capacity'],
        ...visitDates.map(vd => [
          vd.dateId,
          vd.visitDate || vd.date,
          vd.maxCapacity,
          vd.currentBookings,
          vd.maxCapacity - vd.currentBookings
        ])
      ];

      const csvString = csvContent.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visit_dates_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Visit dates exported successfully');
    } catch (e) {
      console.error('Export visit dates error:', e);
      toast.error('Failed to export visit dates');
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'reports' && !reportsData) {
      loadReports();
    }
  }, [activeTab, reportsData, loadReports]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User removed');
      loadData();
    } catch (e) { toast.error('Action failed'); }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    try {
      if (editingUser) {
        await api.put(`/admin/users/${editingUser.userId}`, data);
        toast.success('Identity updated');
      } else {
        await api.post('/admin/users', data);
        toast.success('New member registered');
      }
      setIsUserModalOpen(false);
      setEditingUser(null);
      loadData();
    } catch (e) { toast.error('Identity forge failed'); }
  };

  const handleApproveBooking = async (id) => {
    try {
      console.log('Attempting to approve booking:', id);
      const response = await api.post(`/admin/bookings/${id}/approve`);
      console.log('Approve response:', response.data);
      toast.success('Protocol: Booking Approved');
      loadData();
    } catch (e) {
      console.error('Approve error:', e);
      console.error('Error response data:', JSON.stringify(e.response?.data, null, 2));
      console.error('Error status:', e.response?.status);
      console.error('Error message:', e.message);
      toast.error(e.response?.data?.error || e.response?.data?.message || 'Decision failed');
    }
  };

  const handleRejectBooking = async (id) => {
    try {
      await api.post(`/admin/bookings/${id}/reject`, { reason: 'Policy non-compliance' });
      toast.error('Protocol: Booking Rejected');
      loadData();
    } catch (e) { toast.error('Decision failed'); }
  };

  const handleDeleteSpecies = async (id) => {
    if (!window.confirm('Delete this species? This action cannot be undone.')) return;
    try {
      await api.delete(`/species/${id}`);
      toast.success('Species removed from inventory');
      loadData();
    } catch (e) { 
      console.error('Delete error:', e);
      toast.error('Failed to remove species'); 
    }
  };

  const handleSaveSpecies = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      let savedSpecies;
      if (editingSpecies) {
        savedSpecies = (await api.put(`/species/${editingSpecies.speciesId}`, data)).data.data;
        toast.success('Species record updated');
      } else {
        savedSpecies = (await api.post('/species', data)).data.data;
        toast.success('New species registered');
      }

      // Upload image if file is selected
      if (speciesImageFile && savedSpecies?.speciesId) {
        const imageFormData = new FormData();
        imageFormData.append('file', speciesImageFile);
        try {
          await api.post(`/species/${savedSpecies.speciesId}/upload-image`, imageFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast.success('Species image uploaded');
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          toast.error('Species saved but image upload failed');
        }
      }

      setIsSpeciesModalOpen(false);
      setEditingSpecies(null);
      setSpeciesImageFile(null);
      setImagePreview(null);
      loadData();
    } catch (e) { 
      console.error('Save error:', e);
      toast.error('Species registration failed'); 
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSpeciesImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading && !dashboardData) return (
    <div className="min-h-screen bg-[#0D0E14] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-10 animate-in fade-in duration-500">
        
        {/* Main Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title={t.totalUsers} value={dashboardData?.totalUsers || 0} change="+12%" icon={Users} color="text-purple-400" />
              <StatCard title={t.bookings} value={dashboardData?.totalBookings || 0} change="+5%" icon={Calendar} color="text-blue-400" />
              <StatCard title={t.species} value={dashboardData?.totalSpecies || 0} change="+2%" icon={Leaf} color="text-emerald-400" />
              <StatCard title={t.pendingApprovals} value={dashboardData?.pendingBookings || 0} change="-4%" icon={AlertTriangle} color="text-orange-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
              <div className="glass-card-premium p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" /> {t.recentActivity}
                </h3>
                <div className="h-64 relative px-4 mb-4">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={(dashboardData?.platformGrowth || [35, 65, 45, 85, 60, 75, 95, 55, 80, 100]).map((h, i) => {
                        const x = (i / 9) * 100;
                        const y = 100 - h;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    {(dashboardData?.platformGrowth || [35, 65, 45, 85, 60, 75, 95, 55, 80, 100]).map((h, i) => (
                      <circle
                        key={i}
                        cx={(i / 9) * 100}
                        cy={100 - h}
                        r="3"
                        fill="#8B5CF6"
                        className="hover:r-4 transition-all cursor-pointer"
                      />
                    ))}
                  </svg>
                  <div className="flex items-end gap-5 h-full relative z-10">
                    {(dashboardData?.platformGrowth || [35, 65, 45, 85, 60, 75, 95, 55, 80, 100]).map((h, i) => (
                      <div key={i} className="flex-1 bg-white/5 rounded-t-xl relative group transition-all">
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600/30 to-pink-500/30 rounded-t-xl group-hover:from-purple-500/50 group-hover:to-pink-400/50 transition-all" style={{ height: `${h}%` }}></div>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
                          {Math.floor(h * 1.5)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between px-2 text-[9px] text-gray-500 font-black uppercase tracking-widest">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span>
                </div>
              </div>

              <div className="glass-card-premium p-8 overflow-hidden relative">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-xl font-bold flex items-center gap-2">
                     <Activity className="w-5 h-5 text-pink-500" /> System Activity Tracking
                   </h3>
                   <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-tighter border border-emerald-500/20 rounded-lg">Live Monitoring</span>
                </div>
                
                <div className="space-y-0 relative">
                   {/* Vertical tracking line */}
                   <div className="absolute left-[23px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-transparent"></div>
                   
                   <div className="space-y-10">
                      {(dashboardData?.recentUsers && dashboardData.recentUsers.length > 0) ? (
                        dashboardData.recentUsers.slice(0, 5).map((u) => (
                          <div key={`user-${u.id || u.userId}`} className="relative pl-14 group">
                             <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-[#0D0E14] border-2 border-purple-500 z-10 shadow-[0_0_8px_rgba(168,85,247,0.4)] transition-transform group-hover:scale-125"></div>
                             <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">New Identity Registered</span>
                                <p className="text-sm font-bold text-white tracking-tight">{u.firstName || 'Unknown'} {u.lastName || ''} <span className="text-gray-500 font-normal">authorized as</span> <span className="text-purple-400">{u.role || 'USER'}</span></p>
                                <p className="text-[10px] text-gray-600 mt-1 font-mono italic">Database ID: {u.userId || u.id}</p>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="relative pl-14">
                          <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-[#0D0E14] border-2 border-gray-500 z-10"></div>
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">No Recent Activity</span>
                            <p className="text-sm text-gray-400">Waiting for new user registrations...</p>
                          </div>
                        </div>
                      )}
                      
                      {bookings.slice(0, 2).map((b) => (
                        <div key={`booking-${b.bookingId || b.id}`} className="relative pl-14 group">
                           <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-[#0D0E14] border-2 border-pink-500 z-10 shadow-[0_0_8px_rgba(236,72,153,0.4)] transition-transform group-hover:scale-125"></div>
                           <div className="flex flex-col">
                              <span className="text-xs text-pink-500/70 font-bold uppercase tracking-widest mb-1">Reservation Protocol {b.bookingStatus}</span>
                              <p className="text-sm font-bold text-white tracking-tight">Booking #{b.bookingId} <span className="text-gray-500 font-normal">for</span> {b.user?.firstName} <span className="text-gray-500 font-normal">verified.</span></p>
                              <p className="text-[10px] text-gray-600 mt-1 font-mono italic">Location: Central Marshland Cluster</p>
                           </div>
                        </div>
                      ))}
                   </div>

                   {(!dashboardData?.recentUsers || (dashboardData.recentUsers.length === 0 && bookings.length === 0)) && (
                     <p className="text-gray-500 text-center py-10 italic">Awaiting system activities...</p>
                   )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="glass-card-premium overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Access Control</h2>
              <button 
                onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
                className="btn-premium btn-premium-primary"
              >
                <Plus className="w-4 h-4" /> Add Member
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                    <th className="p-6">Profile</th>
                    <th className="p-6">Authorized Role</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u.userId} className="hover:bg-white/[0.01] transition-colors border-l-2 border-transparent hover:border-purple-500">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/10">
                            {u.firstName?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-200">{u.firstName} {u.lastName}</p>
                            <p className="text-xs text-gray-500 font-light italic">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-purple-400 border border-purple-500/10">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></span>
                          <span className="text-sm font-medium">{u.isActive ? 'Active' : 'Suspended'}</span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => { setEditingUser(u); setIsUserModalOpen(true); }}
                            className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteUser(u.userId)} className="p-2 hover:bg-red-500/10 rounded-lg text-gray-500 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bookings Management */}
        {activeTab === 'bookings' && (
          <div className="glass-card-premium overflow-hidden">
             <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Global Reservations</h2>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500/30" placeholder="Global search..." />
                </div>
                <button className="btn-premium btn-premium-secondary"><Filter className="w-4 h-4" /> Advanced</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                    <th className="p-6">Primary Guest</th>
                    <th className="p-6">Visit Schedule</th>
                    <th className="p-6">Group Size</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bookings.map(b => (
                    <tr key={b.bookingId} className="hover:bg-white/[0.01] transition-colors border-l-2 border-transparent hover:border-blue-500">
                      <td className="p-6">
                        <p className="font-semibold text-gray-200">{b.user?.firstName} {b.user?.lastName}</p>
                        <p className="text-[10px] text-gray-500">{b.user?.email}</p>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                           <Calendar className="w-3 h-3 text-blue-500" />
                           {new Date(b.visitDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="p-6 text-sm font-light">{b.numberOfVisitors} Pax</td>
                      <td className="p-6">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter ${
                          b.bookingStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          b.bookingStatus === 'PENDING' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        {b.bookingStatus === 'PENDING' ? (
                          <div className="flex justify-end gap-3">
                             <button onClick={() => handleApproveBooking(b.bookingId)} className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-all shadow-lg hover:shadow-emerald-500/10"><Check className="w-4 h-4" /></button>
                             <button onClick={() => handleRejectBooking(b.bookingId)} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all shadow-lg hover:shadow-red-500/10"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600 italic">Decision Made</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notifications Management */}
        {activeTab === 'notifications' && (
          <div className="glass-card-premium overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Notifications Management</h2>
                <p className="text-xs text-gray-500 italic">Create and manage system notifications</p>
              </div>
              <button
                onClick={() => {
                  setEditingNotification(null);
                  setBroadcastToAll(false);
                  setNotificationForm({
                    selectedUserIds: [],
                    title: '',
                    message: '',
                    type: 'INFO',
                    link: ''
                  });
                  setShowNotificationModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Notification
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                    <th className="p-6">ID</th>
                    <th className="p-6">User ID</th>
                    <th className="p-6">Title</th>
                    <th className="p-6">Type</th>
                    <th className="p-6">Status</th>
                    <th className="p-6">Created</th>
                    <th className="p-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {allNotifications.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-20 text-center text-gray-600 italic font-light">No notifications found</td>
                    </tr>
                  ) : (
                    allNotifications.map((notification) => (
                      <tr key={notification.notificationId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-6 font-mono text-xs text-gray-400">#{notification.notificationId}</td>
                        <td className="p-6 font-semibold">{notification.userId}</td>
                        <td className="p-6">
                          <p className="font-semibold">{notification.title}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{notification.message}</p>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            notification.type === 'INFO' ? 'bg-blue-500/10 text-blue-400' :
                            notification.type === 'WARNING' ? 'bg-orange-500/10 text-orange-400' :
                            notification.type === 'ERROR' ? 'bg-red-500/10 text-red-400' :
                            notification.type === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' :
                            notification.type === 'ALERT' ? 'bg-purple-500/10 text-purple-400' :
                            'bg-gray-500/10 text-gray-400'
                          }`}>
                            {notification.type}
                          </span>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            notification.isRead ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                          }`}>
                            {notification.isRead ? 'Read' : 'Unread'}
                          </span>
                        </td>
                        <td className="p-6 text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </td>
                        <td className="p-6">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditNotification(notification)}
                              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNotification(notification.notificationId)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Species Management */}
        {activeTab === 'species' && (
          <div className="glass-card-premium overflow-hidden">
             <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Biodiversity Inventory</h2>
              <button 
                onClick={() => { 
                  setEditingSpecies(null); 
                  setSpeciesImageFile(null);
                  setImagePreview(null);
                  setIsSpeciesModalOpen(true); 
                }}
                className="btn-premium btn-premium-primary"
              >
                <Plus className="w-4 h-4" /> Register Species
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-bold uppercase text-gray-500 tracking-widest">
                    <th className="p-6">Species Fragment</th>
                    <th className="p-6">Scientific Classification</th>
                    <th className="p-6">Conservation</th>
                    <th className="p-6 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {species.map(s => (
                    <tr key={s.speciesId} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden border border-white/10">
                              <img
                                src={getImageUrl(s.imageUrl, s.commonName)}
                                className="w-full h-full object-cover"
                                alt={s.commonName}
                                onError={(e) => {
                                  e.target.src = `https://source.unsplash.com/100x100/?nature,${s.commonName}`;
                                }}
                              />
                           </div>
                           <p className="font-bold text-gray-200">{s.commonName}</p>
                        </div>
                      </td>
                      <td className="p-6 text-xs text-gray-500 italic uppercase tracking-tighter">
                        {s.scientificName} • {s.type}
                      </td>
                      <td className="p-6">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          s.conservationStatus === 'Endangered' ? 'bg-pink-500/10 text-pink-400' : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {s.conservationStatus}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                         <div className="flex justify-end gap-2 text-gray-500">
                            <button 
                              onClick={() => { 
                                setEditingSpecies(s); 
                                setSpeciesImageFile(null);
                                setImagePreview(null);
                                setIsSpeciesModalOpen(true); 
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg hover:text-white transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSpecies(s.speciesId)}
                              className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
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

        {/* System Monitoring */}
        {activeTab === 'monitoring' && (
          <div className="glass-card-premium overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h2 className="text-2xl font-black tracking-tight mb-1">System Monitoring</h2>
              <p className="text-xs text-gray-500 italic">Real-time system activity and data integrity</p>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="w-6 h-6 text-emerald-400" />
                    <h3 className="font-bold text-emerald-400">System Status</h3>
                  </div>
                  <p className="text-3xl font-bold mb-2">Operational</p>
                  <p className="text-xs text-gray-500">All services running normally</p>
                </div>
                <div className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Database className="w-6 h-6 text-blue-400" />
                    <h3 className="font-bold text-blue-400">Database</h3>
                  </div>
                  <p className="text-3xl font-bold mb-2">Connected</p>
                  <p className="text-xs text-gray-500">MySQL connection stable</p>
                </div>
                <div className="bg-purple-500/10 rounded-2xl p-6 border border-purple-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-purple-400" />
                    <h3 className="font-bold text-purple-400">Security</h3>
                  </div>
                  <p className="text-3xl font-bold mb-2">Secure</p>
                  <p className="text-xs text-gray-500">JWT authentication active</p>
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold mb-4 text-gray-200">Recent Access Logs</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm">Admin login successful</span>
                    </div>
                    <span className="text-xs text-gray-500">2 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">New user registration</span>
                    </div>
                    <span className="text-xs text-gray-500">15 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">Booking approval completed</span>
                    </div>
                    <span className="text-xs text-gray-500">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Activity Monitoring */}
        {activeTab === 'monitoring' && (
          <div className="glass-card-premium overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">System Activity Monitor</h2>
                <p className="text-xs text-gray-500 italic">Track all system activities including logins, bookings, and changes</p>
              </div>
            </div>
            <div className="p-8">
              <SystemActivityMonitor />
            </div>
          </div>
        )}

        {/* System Configuration */}
        {activeTab === 'config' && (
          <div className="glass-card-premium overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">System Configuration</h2>
                <p className="text-xs text-gray-500 italic">Manage system-wide settings and capacities</p>
              </div>
              <button
                onClick={() => setShowNotificationModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl text-sm font-bold transition-all"
              >
                <Bell className="w-4 h-4" />
                Create Notification
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold mb-4 text-gray-200">Daily Visit Capacity</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Default Max Capacity</label>
                    <input type="number" defaultValue="50" className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Peak Hours Capacity</label>
                    <input type="number" defaultValue="75" className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30 transition-all" />
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold mb-4 text-gray-200">Booking Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Auto-approve Bookings</label>
                    <select className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30 transition-all">
                      <option value="false">Manual Approval Required</option>
                      <option value="true">Auto-approve All Bookings</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Cancellation Window (hours)</label>
                    <input type="number" defaultValue="24" className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30 transition-all" />
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold text-white transition-all">
                Save Configuration
              </button>
            </div>
          </div>
        )}

        {/* System Reports */}
        {activeTab === 'reports' && (
          <div className="space-y-8">
            {reportsData ? (
              <>
                {/* Export Buttons */}
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setExportModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl text-sm font-bold transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Print Report
                  </button>
                  <button
                    onClick={() => exportToCSV()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-sm font-bold transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Export Reports CSV
                  </button>
                </div>

                {/* User Statistics */}
                <div className="glass-card-premium p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Users className="text-purple-500" />
                    User Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Total Users</p>
                      <p className="text-2xl font-bold">{reportsData.userStats?.total || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Active Users</p>
                      <p className="text-2xl font-bold">{reportsData.userStats?.active || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">New This Month</p>
                      <p className="text-2xl font-bold">{reportsData.userStats?.newThisMonth || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Admins</p>
                      <p className="text-2xl font-bold">{reportsData.userStats?.admins || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Statistics */}
                <div className="glass-card-premium p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Calendar className="text-emerald-500" />
                    Booking Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Total Bookings</p>
                      <p className="text-2xl font-bold">{reportsData.bookingStats?.total || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Pending</p>
                      <p className="text-2xl font-bold text-yellow-400">{reportsData.bookingStats?.pending || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Approved</p>
                      <p className="text-2xl font-bold text-emerald-400">{reportsData.bookingStats?.approved || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Cancelled</p>
                      <p className="text-2xl font-bold text-red-400">{reportsData.bookingStats?.cancelled || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Species Statistics */}
                <div className="glass-card-premium p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <Database className="text-blue-500" />
                    Species Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Total Species</p>
                      <p className="text-2xl font-bold">{reportsData.speciesStats?.total || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Flora</p>
                      <p className="text-2xl font-bold text-emerald-400">{reportsData.speciesStats?.flora || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Fauna</p>
                      <p className="text-2xl font-bold text-orange-400">{reportsData.speciesStats?.fauna || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Endangered</p>
                      <p className="text-2xl font-bold text-red-400">{reportsData.speciesStats?.endangered || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Analytics */}
                {reportsData.financialAnalytics && (
                  <div className="glass-card-premium p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <TrendingUp className="text-green-500" />
                      Financial Analytics (Last 30 Days)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Total Revenue</p>
                        <p className="text-2xl font-bold">${reportsData.financialAnalytics?.totalRevenue || 0}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Average Booking Value</p>
                        <p className="text-2xl font-bold">${reportsData.financialAnalytics?.averageBookingValue || 0}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Growth Rate</p>
                        <p className="text-2xl font-bold text-emerald-400">
                          {reportsData.financialAnalytics?.growthRate > 0 ? '+' : ''}{reportsData.financialAnalytics?.growthRate || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visitor Analytics */}
                {reportsData.visitorAnalytics && (
                  <div className="glass-card-premium p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                      <Activity className="text-blue-500" />
                      Visitor Analytics (Last 30 Days)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Total Visitors</p>
                        <p className="text-2xl font-bold">{reportsData.visitorAnalytics?.totalVisitors || 0}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Average per Day</p>
                        <p className="text-2xl font-bold">{reportsData.visitorAnalytics?.averagePerDay || 0}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Peak Day</p>
                        <p className="text-2xl font-bold">{reportsData.visitorAnalytics?.peakDay || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card-premium p-12 text-center">
                <Activity className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-500">Loading reports...</p>
              </div>
            )}
          </div>
        )}

        {/* User Profile */}
        {activeTab === 'profile' && <Profile />}

        {/* Notification Creation Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card-premium max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Bell className="w-6 h-6 text-purple-400" />
                  {editingNotification ? 'Edit Notification' : 'Create Notification'}
                </h2>
                <button onClick={() => {
                  setShowNotificationModal(false);
                  setEditingNotification(null);
                  setBroadcastToAll(false);
                }} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                {!editingNotification && (
                  <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <input
                      type="checkbox"
                      id="broadcastToAll"
                      checked={broadcastToAll}
                      onChange={(e) => setBroadcastToAll(e.target.checked)}
                      className="w-5 h-5 rounded border-purple-500/30 bg-black/20 text-purple-500 focus:ring-purple-500/30"
                    />
                    <label htmlFor="broadcastToAll" className="text-sm font-semibold text-purple-300 cursor-pointer">
                      Broadcast to all users in the system
                    </label>
                  </div>
                )}
                {!broadcastToAll && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Select Users</label>
                    <div className="bg-black/20 border border-white/5 rounded-xl p-4 max-h-48 overflow-y-auto">
                      {users.length === 0 ? (
                        <p className="text-gray-500 text-sm">No users available</p>
                      ) : (
                        users.map((user) => (
                          <label key={user.userId} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notificationForm.selectedUserIds.includes(user.userId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNotificationForm({
                                    ...notificationForm,
                                    selectedUserIds: [...notificationForm.selectedUserIds, user.userId]
                                  });
                                } else {
                                  setNotificationForm({
                                    ...notificationForm,
                                    selectedUserIds: notificationForm.selectedUserIds.filter(id => id !== user.userId)
                                  });
                                }
                              }}
                              className="w-4 h-4 rounded border-purple-500/30 bg-black/20 text-purple-500 focus:ring-purple-500/30"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-sm">{user.username}</p>
                              <p className="text-xs text-gray-500">{user.email} - {user.role}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {notificationForm.selectedUserIds.length} user(s) selected
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Title</label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    placeholder="Notification title"
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Message</label>
                  <textarea
                    rows="4"
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    placeholder="Notification message"
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Type</label>
                  <select
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value })}
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30 transition-all"
                  >
                    <option value="INFO">INFO</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ERROR">ERROR</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="BOOKING">BOOKING</option>
                    <option value="SYSTEM">SYSTEM</option>
                    <option value="ALERT">ALERT</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Link (Optional)</label>
                  <input
                    type="text"
                    value={notificationForm.link}
                    onChange={(e) => setNotificationForm({ ...notificationForm, link: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30 transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowNotificationModal(false);
                      setEditingNotification(null);
                    }}
                    className="flex-1 py-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingNotification ? handleUpdateNotification : handleCreateNotification}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold text-white transition-all"
                  >
                    {editingNotification ? 'Update Notification' : 'Create Notification'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Settings */}
        {activeTab === 'settings' && <Settings />}
      </div>

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setExportModalOpen(false)}></div>
          <div className="relative glass-card-premium w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Download className="text-purple-500" />
                Export Data
              </h3>
              <button onClick={() => setExportModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => { exportUsersCSV(); setExportModalOpen(false); }}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold">Export Users</p>
                  <p className="text-xs text-gray-500">Download all user data as CSV</p>
                </div>
                <Download className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-all" />
              </button>

              <button
                onClick={() => { exportSpeciesCSV(); setExportModalOpen(false); }}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-all">
                  <Leaf className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold">Export Species</p>
                  <p className="text-xs text-gray-500">Download all species data as CSV</p>
                </div>
                <Download className="w-5 h-5 text-gray-500 group-hover:text-emerald-400 transition-all" />
              </button>

              <button
                onClick={() => { exportBookingsCSV(); setExportModalOpen(false); }}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold">Export Bookings</p>
                  <p className="text-xs text-gray-500">Download all booking data as CSV</p>
                </div>
                <Download className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-all" />
              </button>

              <button
                onClick={() => { exportVisitDatesCSV(); setExportModalOpen(false); }}
                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-all">
                  <Calendar className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold">Export Visit Dates</p>
                  <p className="text-xs text-gray-500">Download all visit date data as CSV</p>
                </div>
                <Download className="w-5 h-5 text-gray-500 group-hover:text-orange-400 transition-all" />
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <button
                onClick={() => setExportModalOpen(false)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase text-[10px] tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Forge Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)}></div>
          <div className="relative glass-card-premium w-full max-w-md p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Shield className="text-purple-500" />
                {editingUser ? 'Update Authority' : 'Forge New Identity'}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">First Name</label>
                  <input name="firstName" defaultValue={editingUser?.firstName} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Name</label>
                  <input name="lastName" defaultValue={editingUser?.lastName} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none" required />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Address</label>
                <input name="email" defaultValue={editingUser?.email} type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none" required />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Security Role</label>
                <select name="role" defaultValue={editingUser?.role || 'TOURIST'} className="w-full bg-[#1A1C26] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none">
                  <option value="ADMIN">ADMIN</option>
                  <option value="ECOLOGIST">ECOLOGIST</option>
                  <option value="STAFF">STAFF</option>
                  <option value="TOURIST">TOURIST</option>
                </select>
              </div>

              {!editingUser && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Password</label>
                  <input name="password" type="password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none" required />
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 btn-premium btn-premium-primary">
                  {editingUser ? 'Commit Sync' : 'Finalize Forge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Species Registration Modal */}
      {isSpeciesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSpeciesModalOpen(false)}></div>
          <div className="relative glass-card-premium w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Leaf className="text-emerald-500" />
                {editingSpecies ? 'Update Species Record' : 'Register New Species'}
              </h3>
              <button onClick={() => setIsSpeciesModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveSpecies} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Common Name</label>
                <input 
                  name="commonName" 
                  defaultValue={editingSpecies?.commonName} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none" 
                  required 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Scientific Name</label>
                <input 
                  name="scientificName" 
                  defaultValue={editingSpecies?.scientificName} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none italic" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Species Type</label>
                  <select 
                    name="type" 
                    defaultValue={editingSpecies?.type || 'FLORA'} 
                    className="w-full bg-[#1A1C26] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                  >
                    <option value="FLORA">Flora</option>
                    <option value="FAUNA">Fauna</option>
                    <option value="AVIFAUNA">Avifauna</option>
                    <option value="AQUATIC">Aquatic</option>
                    <option value="INSECT">Insect</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Conservation Status</label>
                  <select 
                    name="conservationStatus" 
                    defaultValue={editingSpecies?.conservationStatus || 'Least Concern'} 
                    className="w-full bg-[#1A1C26] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none"
                  >
                    <option value="Least Concern">Least Concern</option>
                    <option value="Near Threatened">Near Threatened</option>
                    <option value="Vulnerable">Vulnerable</option>
                    <option value="Endangered">Endangered</option>
                    <option value="Critically Endangered">Critically Endangered</option>
                    <option value="Extinct in the Wild">Extinct in the Wild</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Habitat</label>
                <input 
                  name="habitat" 
                  defaultValue={editingSpecies?.habitat || ''} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Description</label>
                <textarea 
                  name="description" 
                  defaultValue={editingSpecies?.description || ''} 
                  rows="4"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Species Image</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-emerald-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-500/10 file:text-emerald-400 file:cursor-pointer hover:file:bg-emerald-500/20"
                  />
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-widest">Preview</p>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-xl border border-white/10"
                    />
                  </div>
                )}
                {editingSpecies?.imageUrl && !imagePreview && (
                  <div className="mt-4">
                    <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-widest">Current Image</p>
                    <img
                      src={getImageUrl(editingSpecies.imageUrl)}
                      alt="Current"
                      className="w-full h-48 object-cover rounded-xl border border-white/10"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsSpeciesModalOpen(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold uppercase text-[10px] tracking-widest">Cancel</button>
                <button type="submit" className="flex-1 btn-premium btn-premium-primary">
                  {editingSpecies ? 'Update Record' : 'Register Species'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
