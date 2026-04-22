import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout, { StatCard, ActivityItem } from '../components/DashboardLayout';
import { 
  Users, Calendar, CheckCircle, MessageSquare, AlertTriangle, 
  Clock, MapPin, Search, Filter, Edit, Trash2, Plus, 
  Activity, Bell, Compass, FileText, Check, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Settings from '../components/Settings';
import Profile from '../components/Profile';

const StaffDashboard = () => {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [todayBookings, setTodayBookings] = useState([]);
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [dbRes, bookingsRes] = await Promise.all([
        api.get('/staff/dashboard'),
        api.get('/staff/bookings/today')
      ]);
      setDashboardData(dbRes.data);
      setTodayBookings(bookingsRes.data.allBookings || []);
    } catch (error) {
      console.error('Staff data load failed:', error);
      // Mock fallback
      setDashboardData({
        pendingTasks: 5, todayBookings: 12, messages: 2, todayVisitors: 34,
        todaySchedule: [
          { id: 1, title: 'Bird Watching Intro', time: '09:00 AM', location: 'Zone A', status: 'completed' },
          { id: 2, title: 'Wetland Documentation', time: '02:00 PM', location: 'Zone C', status: 'scheduled' }
        ],
        recentActivity: []
      });
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCheckIn = async (id) => {
    try {
      await api.post(`/staff/bookings/${id}/checkin`);
      toast.success('Member checked in');
      loadData();
    } catch (e) { toast.error('Action failed'); }
  };

  if (loading && !dashboardData) return (
    <div className="min-h-screen bg-[#0D0E14] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-10 animate-in fade-in duration-500">
        
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Assigned Tasks" value={dashboardData?.pendingTasks} change="-2" icon={AlertTriangle} color="text-orange-400" />
              <StatCard title="Daily Bookings" value={dashboardData?.todayBookings} change="+15%" icon={Calendar} color="text-blue-400" />
              <StatCard title="Inquiries" value={dashboardData?.messages} change="+1" icon={MessageSquare} color="text-emerald-400" />
              <StatCard title="Footfall Today" value={dashboardData?.todayVisitors} change="+8%" icon={Users} color="text-purple-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-12">
              <div className="glass-card-premium p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" /> Operational Schedule
                  </h3>
                  <button className="text-xs text-purple-400 font-bold uppercase tracking-wider">Full Calendar</button>
                </div>
                <div className="space-y-4">
                  {dashboardData?.todaySchedule?.map((item) => (
                    <div key={item.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-10 rounded-full ${item.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                        <div>
                          <p className="font-semibold text-gray-200">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.time} • {item.location}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg ${
                        item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card-premium p-8">
                <h3 className="text-xl font-bold mb-8">Live Action Center</h3>
                <div className="grid grid-cols-2 gap-4">
                   <button className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group">
                      <CheckCircle className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-semibold">Fast Check-in</span>
                   </button>
                   <button className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group">
                      <Compass className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-semibold">Tour Assist</span>
                   </button>
                   <button className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group col-span-2">
                      <FileText className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-semibold">Incident Report</span>
                   </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Daily Manifest for Staff Coordination */}
        {activeTab === 'tasks' && (
          <div className="glass-card-premium overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-white/[0.02] to-transparent">
              <div>
                <h2 className="text-2xl font-black tracking-tight mb-1">Today's Dispatch</h2>
                <p className="text-xs text-gray-500 italic">Field manifest for {new Date().toLocaleDateString()}</p>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Active Check-ins</span>
                   <span className="text-xl font-bold">{todayBookings.filter(b => b.bookingStatus === 'CHECKED_IN').length}</span>
                </div>
                <div className="w-px h-10 bg-white/10 mx-2"></div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Expected Souls</span>
                   <span className="text-xl font-bold">{todayBookings.length}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-white/[0.01]">
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                  <input type="text" placeholder="Filter manifest by visitor name or clearance..." className="w-full bg-black/20 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-purple-500/30 transition-all" />
               </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                    <th className="p-6">Visitor Entity</th>
                    <th className="p-6">Time Window</th>
                    <th className="p-6">Access Status</th>
                    <th className="p-6 text-right">Coordination</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {todayBookings.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-20 text-center text-gray-600 italic font-light">No visitor fragments synchronized for this cycle.</td>
                    </tr>
                  ) : todayBookings.map(b => (
                    <tr key={b.bookingId} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/5 flex items-center justify-center font-black text-[10px] text-purple-400 uppercase tracking-tighter">
                              {(b.user?.firstName?.charAt(0) || '') + (b.user?.lastName?.charAt(0) || (b.user?.firstName ? '' : 'V'))}
                           </div>
                           <div>
                              <p className="font-bold tracking-tight">{b.user?.firstName} {b.user?.lastName}</p>
                              <p className="text-[10px] text-gray-500 font-mono italic">{b.user?.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="p-6">
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-gray-300 flex items-center gap-2">
                               <Clock className="w-3 h-3 text-blue-400" /> Morning Slot
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-tighter">Verified for {b.visitDate}</span>
                         </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit ${
                          b.bookingStatus === 'CHECKED_IN' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                        }`}>
                          {b.bookingStatus === 'CHECKED_IN' ? <Check className="w-3 h-3" /> : <RefreshCw className="w-3 h-3 animate-spin-slow" />}
                          {b.bookingStatus === 'CHECKED_IN' ? 'In Zone' : 'Pending Clearance'}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        {b.bookingStatus !== 'CHECKED_IN' ? (
                          <button 
                            onClick={() => handleCheckIn(b.bookingId)}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-black py-2.5 px-6 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                          >
                            Authorize Arrival
                          </button>
                        ) : (
                          <div className="flex items-center justify-end gap-2 text-emerald-500/60 font-bold text-[10px] uppercase tracking-widest">
                             <CheckCircle className="w-4 h-4" /> Arrival Verified
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'profile' && <Profile />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
