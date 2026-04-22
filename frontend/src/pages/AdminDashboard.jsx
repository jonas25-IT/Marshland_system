import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout, { StatCard, ActivityItem } from '../components/DashboardLayout';
import { 
  Users, UserCheck, UserX, BarChart3, 
  TrendingUp, Activity, Calendar, FileText, 
  Shield, AlertTriangle, Eye, Edit, Trash2, 
  Plus, Search, Filter, Download, RefreshCw,
  Check, X, Image as ImageIcon, MessageSquare, Leaf
} from 'lucide-react';
import toast from 'react-hot-toast';
import GalleryManagement from '../components/GalleryManagement';
import FeedbackList from '../components/FeedbackList';
import Settings from '../components/Settings';
import Profile from '../components/Profile';

const AdminDashboard = () => {
  const { user, isAuthenticated, logout, api } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [species, setSpecies] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
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

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      await api.post(`/admin/bookings/${id}/approve`);
      toast.success('Protocol: Booking Approved');
      loadData();
    } catch (e) { toast.error('Decision failed'); }
  };

  const handleRejectBooking = async (id) => {
    try {
      await api.post(`/admin/bookings/${id}/reject`, { reason: 'Policy non-compliance' });
      toast.error('Protocol: Booking Rejected');
      loadData();
    } catch (e) { toast.error('Decision failed'); }
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
              <StatCard title="Total Users" value={dashboardData?.totalUsers || 0} change="+12%" icon={Users} color="text-purple-400" />
              <StatCard title="Active Bookings" value={dashboardData?.totalBookings || 0} change="+5%" icon={Calendar} color="text-blue-400" />
              <StatCard title="Biodiversity" value={dashboardData?.totalSpecies || 0} change="+2%" icon={Leaf} color="text-emerald-400" />
              <StatCard title="Pending Review" value={dashboardData?.pendingBookings || 0} change="-4%" icon={AlertTriangle} color="text-orange-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
              <div className="glass-card-premium p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" /> Platform Growth
                </h3>
                <div className="h-64 flex items-end gap-5 px-4 mb-4">
                  {[35, 65, 45, 85, 60, 75, 95, 55, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/5 rounded-t-xl relative group transition-all">
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600/80 to-pink-500/80 rounded-t-xl group-hover:from-purple-500 group-hover:to-pink-400 transition-all shadow-[0_0_15px_rgba(139,92,246,0.1)]" style={{ height: `${h}%` }}></div>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity border border-white/10">
                        {Math.floor(h * 1.5)}%
                      </div>
                    </div>
                  ))}
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
                      {(dashboardData?.recentUsers || []).slice(0, 3).map((u) => (
                        <div key={`user-${u.id || u.userId}`} className="relative pl-14 group">
                           <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-[#0D0E14] border-2 border-purple-500 z-10 shadow-[0_0_8px_rgba(168,85,247,0.4)] transition-transform group-hover:scale-125"></div>
                           <div className="flex flex-col">
                              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">New Identity Registered</span>
                              <p className="text-sm font-bold text-white tracking-tight">{u.firstName} {u.lastName} <span className="text-gray-500 font-normal">authorized as</span> <span className="text-purple-400">{u.role}</span></p>
                              <p className="text-[10px] text-gray-600 mt-1 font-mono italic">Database ID: {u.userId || u.id}</p>
                           </div>
                        </div>
                      ))}
                      
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

        {/* Species Management */}
        {activeTab === 'species' && (
          <div className="glass-card-premium overflow-hidden">
             <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight">Biodiversity Inventory</h2>
              <button className="btn-premium btn-premium-primary"><Plus className="w-4 h-4" /> Register Species</button>
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
                              <img src={s.imageUrl || `https://source.unsplash.com/100x100/?nature,${s.commonName}`} className="w-full h-full object-cover" alt="" />
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
                            <button className="p-2 hover:bg-white/10 rounded-lg"><Edit className="w-4 h-4" /></button>
                            <button className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System Reports */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { t: 'User Activity', d: 'Comprehensive logs of user logins and role transitions.', i: Users, c: 'text-purple-400' },
              { t: 'Revenue Stream', d: 'Monthly analysis of tour bookings and tourism revenue.', i: TrendingUp, c: 'text-emerald-400' },
              { t: 'System Health', d: 'Server uptime and database connectivity metrics.', i: Activity, c: 'text-blue-400' }
            ].map((r, i) => (
              <div key={i} className="glass-card-premium p-8 group hover:scale-105 transition-all cursor-pointer">
                <r.i className={`w-10 h-10 mb-6 ${r.c}`} />
                <h3 className="text-lg font-bold mb-2">{r.t}</h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed mb-6">{r.d}</p>
                <button className="text-purple-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                  Generate PDF <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* User Profile */}
        {activeTab === 'profile' && <Profile />}

        {/* Global Settings */}
        {activeTab === 'settings' && <Settings />}
      </div>

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
    </DashboardLayout>
  );
};

export default AdminDashboard;
