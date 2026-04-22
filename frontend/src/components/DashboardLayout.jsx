import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Leaf, Home as HomeIcon, LogOut, Plus, Search, 
  BarChart3, Activity, Globe, Bell, Settings as SettingsIcon, 
  Database, Users, Calendar, Map, Camera, LayoutGrid, FileText
} from 'lucide-react';

const DashboardLayout = ({ children, activeTab, onTabChange }) => {
  const { user, logout } = useAuth();
  const { settings, t } = useSettings();
  const navigate = useNavigate();
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = {
    ADMIN: [
      { id: 'dashboard', label: t.dashboard, icon: LayoutGrid },
      { id: 'users', label: t.users, icon: Users },
      { id: 'bookings', label: t.bookings, icon: Calendar },
      { id: 'species', label: t.species, icon: Database },
      { id: 'reports', label: t.reports, icon: FileText },
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
      { id: 'tasks', label: 'Assigned Tasks', icon: Activity },
      { id: 'observations', label: 'Field Logs', icon: Database },
    ]
  };

  const userRole = user?.role || 'TOURIST';
  const roleItems = menuItems[userRole] || menuItems.TOURIST;

  return (
    <div className="min-h-screen flex dashboard-bg font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 sidebar-gradient flex flex-col fixed h-screen z-20">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl shadow-lg shadow-purple-500/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-glow">Marshland</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {roleItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => onTabChange ? onTabChange(item.id) : null}
              className={`w-full sidebar-item ${activeTab === item.id ? 'sidebar-item-active' : ''}`}
            >
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
          
          <div className="pt-8 pb-4 text-xs font-semibold text-gray-500 uppercase px-4">{t.system}</div>
          <button className="w-full sidebar-item"><Bell className="w-5 h-5" /> Announcements</button>
          <button 
            onClick={() => onTabChange('settings')}
            className={`w-full sidebar-item ${activeTab === 'settings' ? 'sidebar-item-active' : ''}`}
          >
            <SettingsIcon className="w-5 h-5" /> {t.settings}
          </button>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full sidebar-item text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="w-5 h-5" /> {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 min-h-screen">
        {/* Top Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-1 capitalize tracking-tight">{userRole.toLowerCase()} Panel</h1>
            <p className="text-gray-400 font-light italic">System status: <span className="text-emerald-400 font-medium">Synced</span></p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/5 border border-white/10 p-2 rounded-xl cursor-pointer hover:bg-white/10 relative group">
              <Bell className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-white/5"></span>
            </div>
            <div className="flex items-center gap-4 pl-4 border-l border-white/10 relative group">
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
