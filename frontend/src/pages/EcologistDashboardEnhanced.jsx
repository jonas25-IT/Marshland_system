import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Leaf, Home, LogOut, Plus, Upload, FileText, 
  Eye, Edit, Trash2, BarChart3, Activity, 
  Search, TrendingUp, MapPin, Camera, Image as ImageIcon, 
  AlertTriangle, Bell, Database, Zap, 
  Settings as SettingsIcon,
  RefreshCw, X, CheckCircle, 
  Clock, Globe, Shield, Info, ChevronRight,
  MoreVertical, Filter, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import Settings from '../components/Settings';
import Profile from '../components/Profile';
import GalleryManagement from '../components/GalleryManagement';
import RugeziMap from '../components/RugeziMap';
import NotificationsList from '../components/NotificationsList';

const EcologistDashboardEnhanced = () => {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [species, setSpecies] = useState([]);
  const [dashboardData, setDashboardData] = useState({ stats: {}, activities: [] });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSpeciesModalOpen, setIsSpeciesModalOpen] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Helper function to construct full image URL
  const getImageUrl = (imageUrl, fallbackKeyword = 'nature') => {
    if (!imageUrl) {
      console.log('No imageUrl provided, using fallback');
      return `https://source.unsplash.com/400x300/?${fallbackKeyword}`;
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Replace hardcoded port 8081 with 8083 if present
      let url = imageUrl.replace(':8081', ':8083');
      // Ensure species images have /species/ in the path for compatibility
      if (url.includes('/uploads/') && !url.includes('/uploads/species/')) {
        url = url.replace('/uploads/', '/uploads/species/');
      }
      console.log('Image URL (HTTP):', url);
      return url;
    }
    // Backend serves static files at http://localhost:8083/uploads/species/**
    // Ensure imageUrl starts with /uploads/species
    const path = imageUrl.startsWith('/') ? imageUrl : `/uploads/species/${imageUrl}`;
    const fullUrl = `http://localhost:8083${path}`;
    console.log('Image URL (Local):', fullUrl);
    return fullUrl;
  };

  // Image error handler
  const handleImageError = (e, fallbackKeyword = 'nature') => {
    console.error('Image failed to load, using fallback');
    e.target.src = `https://source.unsplash.com/400x300/?${fallbackKeyword}`;
    e.target.onerror = null; // Prevent infinite loop
  };
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [speciesRes, statsRes] = await Promise.all([
        api.get('/species'),
        api.get('/species/statistics')
      ]);
      
      // Handle the nested data structure from the backend
      setSpecies(speciesRes.data.data.species || []);
      setDashboardData({
        stats: statsRes.data.data || {},
        activities: [
          { id: 1, type: 'new', title: 'New Species Logged', desc: 'Mountain Gorilla observed in Sector 4', time: '5 min ago' },
          { id: 2, type: 'update', title: 'Status Updated', desc: 'Golden Monkey moved to Vulnerable', time: '1 hour ago' },
          { id: 3, type: 'alert', title: 'Critical Alert', desc: 'Unusual migration pattern in Marsh B', time: '2 hours ago' }
        ]
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to sync with ecosystem data');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Notification functions
  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data || []);
      setUnreadCount(response.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n =>
        n.notificationId === notificationId
          ? { ...n, isRead: true, readAt: new Date().toISOString() }
          : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({
        ...n,
        isRead: true,
        readAt: new Date().toISOString()
      })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      console.error('Error response:', error.response?.data);
      toast.error(`Failed: ${error.response?.data?.error || error.message}`);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this species record? This cannot be undone.')) return;
    try {
      await api.delete(`/species/${id}`);
      toast.success('Species record removed');
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete record');
    }
  };

  const handleSaveSpecies = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      let response;
      if (editingSpecies) {
        response = await api.put(`/species/${editingSpecies.speciesId}`, data);
        toast.success('Species updated successfully');
      } else {
        response = await api.post('/species', data);
        toast.success('New species registered');
      }

      const speciesId = editingSpecies ? editingSpecies.speciesId : response.data.data.species_id || response.data.data.speciesId;

      // Handle Image Upload if a file is selected
      if (selectedFile && speciesId) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await api.post(`/species/${speciesId}/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setIsSpeciesModalOpen(false);
      setEditingSpecies(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving species');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const openEditModal = (s) => {
    setEditingSpecies(s);
    setIsSpeciesModalOpen(true);
  };

  if (loading && !species.length) {
    return (
      <div className="min-h-screen bg-[#0D0E14] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <Leaf className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500 w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0E14] text-gray-100 flex dashboard-bg font-sans">
      {/* Sidebar */}
      <aside className="w-64 sidebar-gradient flex flex-col fixed h-screen z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl shadow-lg shadow-purple-500/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-glow">Marshland</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full sidebar-item ${activeTab === 'dashboard' ? 'sidebar-item-active' : ''}`}
          >
            <Home className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('species')}
            className={`w-full sidebar-item ${activeTab === 'species' ? 'sidebar-item-active' : ''}`}
          >
            <Database className="w-5 h-5" /> Species
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`w-full sidebar-item ${activeTab === 'gallery' ? 'sidebar-item-active' : ''}`}
          >
            <ImageIcon className="w-5 h-5" /> Gallery
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full sidebar-item ${activeTab === 'analytics' ? 'sidebar-item-active' : ''}`}
          >
            <BarChart3 className="w-5 h-5" /> Analytics
          </button>
          <button
            onClick={() => setActiveTab('census')}
            className={`w-full sidebar-item ${activeTab === 'census' ? 'sidebar-item-active' : ''}`}
          >
            <Activity className="w-5 h-5" /> Census Data
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`w-full sidebar-item ${activeTab === 'map' ? 'sidebar-item-active' : ''}`}
          >
            <Globe className="w-5 h-5" /> Mapping
          </button>
          
          <div className="pt-8 pb-4 text-xs font-semibold text-gray-500 uppercase px-4">System</div>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full sidebar-item ${activeTab === 'notifications' ? 'sidebar-item-active' : ''}`}
          >
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full sidebar-item ${activeTab === 'settings' ? 'sidebar-item-active' : ''}`}
          >
            <SettingsIcon className="w-5 h-5" /> Settings
          </button>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full sidebar-item text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-1">Ecologist Console</h1>
            <p className="text-gray-400">Welcome back, {user?.firstName}. System status: <span className="text-emerald-400 font-medium">Optimal</span></p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Universal Search..."
                className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 w-64 focus:outline-none focus:border-purple-500/50 transition-all font-light"
              />
            </div>
            <div className="relative group">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (showNotifications) loadNotifications();
                }}
                className="bg-white/5 border border-white/10 p-2 rounded-xl cursor-pointer hover:bg-white/10 relative"
              >
                <Bell className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white/5">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 glass-card-premium border border-white/10 shadow-2xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-gray-200">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500 text-center">No notifications</p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.notificationId}
                        onClick={() => markAsRead(notification.notificationId)}
                        className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!notification.isRead ? 'bg-white/[0.02]' : ''}`}
                      >
                        <p className="text-sm font-semibold mb-1">{notification.title}</p>
                        <p className="text-xs text-gray-400 mb-2">{notification.message}</p>
                        <p className="text-[10px] text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 pl-4 border-l border-white/10 relative group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold tracking-tight opacity-90">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest leading-none">{user?.role}</p>
              </div>

              <button className="relative cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px] shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <div className="w-full h-full rounded-full bg-[#0D0E14] flex items-center justify-center border border-white/5 overflow-hidden">
                    <span className="text-xs font-black text-white tracking-widest uppercase">
                      {(user?.firstName?.charAt(0) || '') + (user?.lastName?.charAt(0) || (user?.firstName ? '' : 'U'))}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0D0E14] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </button>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Species', value: dashboardData.stats.totalSpecies || 0, change: '+12%', icon: Globe, color: 'text-blue-400' },
                { title: 'Endangered', value: (dashboardData.stats.speciesByConservationStatus?.endangered || []).length, change: '-2%', icon: AlertTriangle, color: 'text-orange-400' },
                { title: 'Habitats', value: Object.keys(dashboardData.stats.speciesByHabitat || {}).length, change: '+5%', icon: MapPin, color: 'text-emerald-400' },
                { title: 'Conservation Score', value: '87.5%', change: '+5.2%', icon: TrendingUp, color: 'text-purple-400' },
              ].map((stat, i) => (
                <div key={i} className="glass-card-premium p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                      <h3 className="text-3xl font-bold">{stat.value}</h3>
                      <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-pink-400'}`}>
                        {stat.change} <span className="text-gray-500 ml-1 font-light tracking-tight">from last month</span>
                      </p>
                    </div>
                    <div className={`p-3 bg-white/5 rounded-xl ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Middle Section: Active Research & Progress */}
            <div className="flex justify-between items-center mt-12 mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-500" /> Priority Species Watch
              </h2>
              <button onClick={() => setIsSpeciesModalOpen(true)} className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 group">
                View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {species.slice(0, 4).map((s) => (
                <div key={s.speciesId} className="glass-card-premium overflow-hidden group">
                  <div className="h-40 relative overflow-hidden">
                    <img
                      src={getImageUrl(s.imageUrl, s.commonName)}
                      alt={s.commonName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.target.src = `https://source.unsplash.com/400x300/?nature,${s.commonName}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1C26] to-transparent opacity-60"></div>
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-white">
                        {s.type}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <h4 className="font-bold text-lg leading-tight">{s.commonName}</h4>
                      <p className="text-xs text-gray-300 italic opacity-80">{s.scientificName}</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.habitat}</span>
                      <span className={`font-bold ${s.conservationStatus === 'Endangered' ? 'text-pink-400' : 'text-emerald-400'}`}>
                        {s.conservationStatus}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                        <span>Research Progress</span>
                        <span>{Math.floor(Math.random() * 40 + 60)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full progress-gradient rounded-full" 
                          style={{ width: `${Math.floor(Math.random() * 40 + 60)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => openEditModal(s)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2">
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button onClick={() => handleDelete(s.speciesId)} className="p-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {/* Add New Card */}
              <button 
                onClick={() => { setEditingSpecies(null); setIsSpeciesModalOpen(true); }}
                className="glass-card-premium border-dashed border-white/10 flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-purple-400 group h-[360px]"
              >
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                  <Plus className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold">Register Species</p>
                  <p className="text-xs opacity-60">Add new ecosystem data</p>
                </div>
              </button>
            </div>

            {/* Bottom Section: Recent Activity */}
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
              <div className="glass-card-premium p-4 md:p-8 space-y-6">
                {dashboardData.activities.map((activity, i) => (
                  <div key={activity.id} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        activity.type === 'new' ? 'bg-purple-500/10 text-purple-400' :
                        activity.type === 'update' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-pink-500/10 text-pink-400'
                      }`}>
                        {activity.type === 'new' ? <Plus className="w-5 h-5" /> :
                         activity.type === 'update' ? <RefreshCw className="w-5 h-5" /> :
                         <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-200">{activity.title}</p>
                        <p className="text-sm text-gray-500 font-light">{activity.desc}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-medium mb-1">{activity.time}</p>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'species' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Species Inventory</h2>
              <button 
                onClick={() => { setEditingSpecies(null); setIsSpeciesModalOpen(true); }}
                className="btn-premium btn-premium-primary"
              >
                <Plus className="w-4 h-4" /> Add New Species
              </button>
            </div>
            
            <div className="glass-card-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-500">Common Name</th>
                      <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-500">Scientific Name</th>
                      <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-500">Type</th>
                      <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-500">Conservation</th>
                      <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-500">Habitat</th>
                      <th className="p-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {species.map((s) => (
                      <tr key={s.speciesId} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5">
                              <img
                                src={getImageUrl(s.imageUrl, s.commonName)}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = `https://source.unsplash.com/100x100/?nature,${s.commonName}`;
                                }}
                              />
                            </div>
                            <span className="font-semibold text-purple-300">{s.commonName}</span>
                          </div>
                        </td>
                        <td className="p-6 text-sm text-gray-400 italic">{s.scientificName}</td>
                        <td className="p-6">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            s.type === 'FLORA' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                          }`}>
                            {s.type}
                          </span>
                        </td>
                        <td className="p-6">
                           <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            s.conservationStatus === 'Endangered' ? 'bg-pink-500/10 text-pink-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {s.conservationStatus}
                          </span>
                        </td>
                        <td className="p-6 text-sm text-gray-500">{s.habitat}</td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                             <button onClick={() => openEditModal(s)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400 transition-all">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(s.speciesId)} className="p-2 hover:bg-red-500/10 rounded-lg text-pink-500 transition-all">
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
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && <NotificationsList />}

        {/* User Profile */}
        {activeTab === 'profile' && <Profile />}

        {/* Global Gallery Sync */}
        {activeTab === 'gallery' && (
          <div className="p-8">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Marshland Fragment Sync</h1>
            <p className="text-gray-500 font-light italic mb-10">Manage visual captures synchronized with the global database.</p>
            <GalleryManagement />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-8 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Ecological Analytics</h1>
            <p className="text-gray-500 font-light italic mb-10">Comprehensive analysis of marshland ecosystem data and trends.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { title: 'Total Species', value: dashboardData.stats.totalSpecies || 0, change: '+12%', icon: Globe, color: 'text-blue-400' },
                { title: 'Endangered', value: (dashboardData.stats.speciesByConservationStatus?.endangered || []).length, change: '-2%', icon: AlertTriangle, color: 'text-orange-400' },
                { title: 'Habitats', value: Object.keys(dashboardData.stats.speciesByHabitat || {}).length, change: '+5%', icon: MapPin, color: 'text-emerald-400' },
                { title: 'Conservation Score', value: '87.5%', change: '+5.2%', icon: TrendingUp, color: 'text-purple-400' },
              ].map((stat, i) => (
                <div key={i} className="glass-card-premium p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                      <h3 className="text-3xl font-bold">{stat.value}</h3>
                      <p className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-pink-400'}`}>
                        {stat.change} <span className="text-gray-500 ml-1 font-light tracking-tight">from last month</span>
                      </p>
                    </div>
                    <div className={`p-3 bg-white/5 rounded-xl ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card-premium p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" /> Species by Conservation Status
                </h3>
                <div className="space-y-4">
                  {Object.entries(dashboardData.stats.speciesByConservationStatus || {}).map(([status, speciesList], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{status}</span>
                      <span className="font-bold">{Array.isArray(speciesList) ? speciesList.length : 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card-premium p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" /> Species by Habitat
                </h3>
                <div className="space-y-4">
                  {Object.entries(dashboardData.stats.speciesByHabitat || {}).map(([habitat, count], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{habitat}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Census Data Tab */}
        {activeTab === 'census' && (
          <div className="p-8 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Census Data</h1>
            <p className="text-gray-500 font-light italic mb-10">Population census data for species across the marshland ecosystem.</p>

            <div className="glass-card-premium p-8 mb-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Population Records
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th className="pb-4">Species</th>
                      <th className="pb-4">Type</th>
                      <th className="pb-4">Population</th>
                      <th className="pb-4">Trend</th>
                      <th className="pb-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {species.slice(0, 10).map((s) => (
                      <tr key={s.speciesId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/5 rounded-lg overflow-hidden">
                              <img src={getImageUrl(s.imageUrl, s.commonName)} alt="" className="w-full h-full object-cover" onError={(e) => handleImageError(e, s.commonName)} />
                            </div>
                            <div>
                              <p className="font-semibold">{s.commonName}</p>
                              <p className="text-xs text-gray-500 italic">{s.scientificName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-gray-400">{s.type}</td>
                        <td className="py-4 font-bold">{Math.floor(Math.random() * 5000) + 100}</td>
                        <td className="py-4">
                          <span className={`text-sm ${Math.random() > 0.5 ? 'text-emerald-400' : 'text-pink-400'}`}>
                            {Math.random() > 0.5 ? '↑' : '↓'} {Math.floor(Math.random() * 20) + 1}%
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            s.conservationStatus === 'Endangered' ? 'bg-pink-500/10 text-pink-400' :
                            s.conservationStatus === 'Vulnerable' ? 'bg-orange-500/10 text-orange-400' :
                            'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {s.conservationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="p-8 animate-in fade-in duration-500">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Ecosystem Mapping</h1>
            <p className="text-gray-500 font-light italic mb-10">Geographic distribution and habitat mapping of species at Rugezi Marshland.</p>

            <div className="glass-card-premium p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" /> Rugezi Marshland Map
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Location: 1°30'46.6"S 29°54'14.2"E | Northern Province, Rwanda
              </p>
              <RugeziMap species={species} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {Object.entries(dashboardData.stats.speciesByHabitat || {}).slice(0, 3).map(([habitat, count], i) => (
                  <div key={i} className="glass-card-premium p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className={`w-5 h-5 ${['text-blue-400', 'text-emerald-400', 'text-purple-400'][i]}`} />
                      <span className="font-bold">{habitat}</span>
                    </div>
                    <p className="text-3xl font-bold mb-2">{count}</p>
                    <p className="text-xs text-gray-500">Species recorded</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Global Settings */}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* Species Modal (CRUD) */}
      {isSpeciesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSpeciesModalOpen(false)}></div>
          <div className="relative glass-card-premium w-full max-w-xl p-8 shadow-2xl scale-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Leaf className="text-purple-500" />
                {editingSpecies ? 'Update Species Record' : 'Register New Species'}
              </h2>
              <button 
                onClick={() => setIsSpeciesModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveSpecies} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Common Name</label>
                  <input 
                    name="commonName"
                    defaultValue={editingSpecies?.commonName}
                    placeholder="e.g. Mountain Gorilla"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Scientific Name</label>
                  <input 
                    name="scientificName"
                    defaultValue={editingSpecies?.scientificName}
                    placeholder="e.g. Gorilla beringei"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Species Type</label>
                  <select 
                    name="type"
                    defaultValue={editingSpecies?.type || ''}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all appearance-none"
                    required
                  >
                    <option value="" disabled className="bg-[#1A1C26]">Select Type</option>
                    <option value="FLORA" className="bg-[#1A1C26]">Flora (Plant Life)</option>
                    <option value="FAUNA" className="bg-[#1A1C26]">Fauna (Animal Life)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status</label>
                  <select 
                    name="conservationStatus"
                    defaultValue={editingSpecies?.conservationStatus || ''}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all appearance-none"
                    required
                  >
                    <option value="" disabled className="bg-[#1A1C26]">Select Status</option>
                    <option value="Least Concern" className="bg-[#1A1C26]">Least Concern</option>
                    <option value="Near Threatened" className="bg-[#1A1C26]">Near Threatened</option>
                    <option value="Vulnerable" className="bg-[#1A1C26]">Vulnerable</option>
                    <option value="Endangered" className="bg-[#1A1C26]">Endangered</option>
                    <option value="Critically Endangered" className="bg-[#1A1C26]">Critically Endangered</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Habitat / Region</label>
                <input 
                  name="habitat"
                  defaultValue={editingSpecies?.habitat}
                  placeholder="e.g. Bamboo Forests, Sector 4"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Species Photo</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center group relative">
                    {previewUrl || editingSpecies?.imageUrl ? (
                      <img src={previewUrl || getImageUrl(editingSpecies?.imageUrl, editingSpecies?.commonName)} className="w-full h-full object-cover" alt="Preview" onError={(e) => handleImageError(e, editingSpecies?.commonName || 'nature')} />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-700" />
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all">
                       <Upload className="w-5 h-5 text-white" />
                       <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-500 mb-2 italic">Upload a clear photo from your local computer for system identification.</p>
                    <button 
                      type="button" 
                      onClick={() => document.querySelector('input[type="file"]').click()}
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Browse Documents...
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</label>
                <textarea 
                  name="description"
                  defaultValue={editingSpecies?.description}
                  rows="3"
                  placeholder="Enter detailed observation notes..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsSpeciesModalOpen(false)}
                  className="flex-1 btn-premium btn-premium-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-premium btn-premium-primary"
                >
                  {editingSpecies ? 'Update Record' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcologistDashboardEnhanced;
