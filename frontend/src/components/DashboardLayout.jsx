import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import {
  Leaf, Home as HomeIcon, LogOut, Plus, Search,
  BarChart3, Activity, Globe, Bell, Settings as SettingsIcon,
  Database, Users, Calendar, Map, Camera, LayoutGrid, FileText, X, Menu
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardLayout = ({ children, activeTab, onTabChange }) => {
  const { user, logout, api } = useAuth();
  const { settings, t } = useSettings();
  const navigate = useNavigate();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const [unreadRes, allRes] = await Promise.all([
        api.get('/notifications/unread/count'),
        api.get('/notifications')
      ]);
      setUnreadCount(unreadRes.data.count || 0);
      setNotifications(allRes.data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      loadNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const menuItems = {
    ADMIN: [
      { id: 'dashboard', label: t.dashboard, icon: LayoutGrid },
      { id: 'users', label: t.users, icon: Users },
      { id: 'bookings', label: t.bookings, icon: Calendar },
      { id: 'species', label: t.species, icon: Database },
      { id: 'reports', label: t.reports, icon: FileText },
      { id: 'monitoring', label: 'Monitoring', icon: Activity },
      { id: 'config', label: 'Config', icon: SettingsIcon },
    ],
    ECOLOGIST: [
      { id: 'dashboard', label: t.dashboard, icon: HomeIcon },
      { id: 'species', label: t.species, icon: Database },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'census', label: 'Census Data', icon: Activity },
      { id: 'mapping', label: 'Mapping', icon: Globe },
    ],
    TOURIST: [
      { id: 'dashboard', label: t.dashboard, icon: HomeIcon },
      { id: 'tours', label: 'Browse Tours', icon: Map },
      { id: 'bookings', label: t.bookings, icon: Calendar },
      { id: 'gallery', label: 'Gallery', icon: Camera },
    ],
    STAFF: [
      { id: 'dashboard', label: t.dashboard, icon: HomeIcon },
      { id: 'bookings', label: t.bookings, icon: Calendar },
      { id: 'logs', label: 'Logs', icon: FileText },
    ]
  };

  const userRole = user?.role || 'TOURIST';
  const roleItems = menuItems[userRole] || menuItems.TOURIST;

  return (
    <div className="min-h-screen flex dashboard-bg font-sans transition-colors duration-300">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isSidebarCollapsed ? 'w-16' : 'w-64'} 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 
        sidebar-gradient flex flex-col fixed h-screen z-20 transition-all duration-300 ease-in-out
      `}>
        {/* Sidebar Header */}
        <div className={`p-4 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl shadow-lg shadow-purple-500/20 flex-shrink-0">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <span className="font-bold text-xl tracking-tight text-glow">Marshland</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-2 overflow-y-auto custom-scrollbar">
          {roleItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => {
                onTabChange ? onTabChange(item.id) : null;
                setIsSidebarOpen(false); // Close mobile menu after selection
              }}
              className={`w-full sidebar-item ${activeTab === item.id ? 'sidebar-item-active' : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}
              title={isSidebarCollapsed ? item.label : ''}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="ml-3">{item.label}</span>}
            </button>
          ))}
          
          {!isSidebarCollapsed && (
            <div className="pt-8 pb-4 text-xs font-semibold text-gray-500 uppercase px-4">{t.system}</div>
          )}
          <button
            onClick={() => {
              onTabChange('notifications');
              setIsSidebarOpen(false); // Close mobile menu after selection
            }}
            className={`w-full sidebar-item ${activeTab === 'notifications' ? 'sidebar-item-active' : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title={isSidebarCollapsed ? 'Notifications' : ''}
          >
            <Bell className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="ml-3">Notifications</span>}
            {unreadCount > 0 && !isSidebarCollapsed && (
              <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              onTabChange('settings');
              setIsSidebarOpen(false); // Close mobile menu after selection
            }}
            className={`w-full sidebar-item ${activeTab === 'settings' ? 'sidebar-item-active' : ''} ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title={isSidebarCollapsed ? 'Settings' : ''}
          >
            <SettingsIcon className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="ml-3">{t.settings}</span>}
          </button>
        </nav>

        {/* Logout Button */}
        <div className={`p-2 border-t border-white/5 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
          <button 
            onClick={handleLogout}
            className={`w-full sidebar-item text-red-400 hover:bg-red-500/10 hover:text-red-300 ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title={isSidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isSidebarCollapsed && <span className="ml-3">{t.logout}</span>}
          </button>
        </div>

        {/* Collapse Toggle (Desktop Only) */}
        <div className="hidden lg:flex absolute -right-3 top-8">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-6 h-6 bg-gray-800 rounded-full border border-white/10 flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <X className={`w-3 h-3 text-gray-400 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ease-in-out min-h-screen ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} ml-0 p-4 lg:p-8`}>
        {/* Top Header */}
        <header className="flex justify-between items-center mb-6 lg:mb-10">
          {/* Menu Button - Available to all users */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>

          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 capitalize tracking-tight">{userRole.toLowerCase()} Panel</h1>
            <p className="text-sm lg:text-base text-gray-400 font-light italic">System status: <span className="text-emerald-400 font-medium">Synced</span></p>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div
              className="bg-white/5 border border-white/10 p-2 rounded-xl cursor-pointer hover:bg-white/10 relative group"
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (showNotifications) loadNotifications();
              }}
            >
              <Bell className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white/5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 lg:gap-4 pl-2 lg:pl-4 border-l border-white/10 relative group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold tracking-tight opacity-90">{user?.firstName} {user?.lastName}</p>
                <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest leading-none">{user?.role}</p>
              </div>
              
              <button 
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="relative cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px] shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  <div className="w-full h-full rounded-full bg-[#16171D] flex items-center justify-center border border-white/5 overflow-hidden">
                    <span className="text-xs font-black text-white tracking-widest uppercase">
                      {(user?.firstName?.charAt(0) || '') + (user?.lastName?.charAt(0) || (user?.firstName ? '' : 'U'))}
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#16171D] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute top-[calc(100%+15px)] right-0 w-80 sm:w-96 glass-card-premium border border-white/10 shadow-2xl z-[70] p-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
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
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.notificationId}
                            className={`p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer ${
                              !notification.isRead ? 'bg-purple-500/5' : ''
                            }`}
                            onClick={() => {
                              if (!notification.isRead) {
                                markAsRead(notification.notificationId);
                              }
                              if (notification.link) {
                                window.location.href = notification.link;
                              }
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                notification.isRead ? 'bg-gray-500' : 'bg-purple-500'
                              }`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-200 truncate">{notification.title}</p>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notification.message}</p>
                                <p className="text-[10px] text-gray-500 mt-2">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* User Dropdown Menu */}
              {isAccountOpen && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setIsAccountOpen(false)}></div>
                  <div className="absolute top-[calc(100%+15px)] right-0 w-64 glass-card-premium border border-white/10 shadow-2xl z-[70] p-0 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-6 py-4 border-b border-white/5">
                      <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">{t.myAccount}</p>
                      <p className="text-xs text-gray-400 font-medium truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => { onTabChange('profile'); setIsAccountOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <Users className="w-4 h-4" /> {t.profile}
                      </button>
                      <button 
                        onClick={() => { onTabChange('settings'); setIsAccountOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                      >
                        <SettingsIcon className="w-4 h-4" /> {t.settings}
                      </button>
                      <div className="h-px bg-white/5 my-2 mx-2"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" /> {t.logout}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
};

// Reusable Stat Card
export const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <div className="glass-card-premium p-6 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm mb-1">{title}</p>
        <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
        <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-emerald-400' : 'text-pink-400'}`}>
          {change} <span className="text-gray-500 ml-1 font-light tracking-tight">since last update</span>
        </p>
      </div>
      <div className={`p-3 bg-white/5 rounded-xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

// Reusable Activity Item
export const ActivityItem = ({ type, title, desc, time }) => (
  <div className="flex justify-between items-center group">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
        type === 'new' ? 'bg-purple-500/10 text-purple-400' :
        type === 'update' ? 'bg-blue-500/10 text-blue-400' :
        'bg-pink-500/10 text-pink-400'
      }`}>
        <Activity className="w-5 h-5" />
      </div>
      <div>
        <p className="font-bold text-gray-200">{title}</p>
        <p className="text-sm text-gray-500 font-light">{desc}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xs text-gray-600 font-medium mb-1">{time}</p>
    </div>
  </div>
);

export default DashboardLayout;
