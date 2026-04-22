import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout, { StatCard, ActivityItem } from '../components/DashboardLayout';
import {
  Users, Calendar, CheckCircle, MessageSquare, AlertTriangle,
  Clock, MapPin, Search, Filter, Edit, Trash2, Plus,
  Activity, Bell, Compass, FileText, Check, X, RefreshCw,
  Mail, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import Settings from '../components/Settings';
import Profile from '../components/Profile';
import NotificationsList from '../components/NotificationsList';

const StaffDashboard = () => {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [todayBookings, setTodayBookings] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showTourAssistModal, setShowTourAssistModal] = useState(false);
  const [showIncidentReportModal, setShowIncidentReportModal] = useState(false);
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [dbRes, bookingsRes, logsRes] = await Promise.all([
        api.get('/staff/dashboard'),
        api.get('/staff/bookings/today'),
        api.get('/staff/logs/activities').catch(e => { console.error('Logs error:', e); return { data: null }; })
      ]);
      setDashboardData(dbRes.data);
      setTodayBookings(bookingsRes.data.allBookings || []);
      setActivityLogs(logsRes.data || []);
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
      toast.success('Visitor checked in successfully');
      loadData();
    } catch (e) {
      console.error('Check-in failed:', e);
      toast.error('Check-in failed: ' + (e.response?.data?.error || 'Unknown error'));
    }
  };

  const handleFastCheckIn = () => {
    setActiveTab('tasks');
    toast.success('Navigated to Today\'s Dispatch for check-in');
  };

  const handleTourAssist = () => {
    setShowTourAssistModal(true);
  };

  const handleIncidentReport = () => {
    setShowIncidentReportModal(true);
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

            {/* Capacity Awareness */}
            <div className="glass-card-premium p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  Daily Capacity Monitor
                </h3>
                <span className="text-xs text-gray-500 italic">Max: 50 visitors</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Current Visitors</span>
                    <span className="text-sm font-bold text-gray-200">{todayBookings.filter(b => b.bookingStatus === 'CHECKED_IN').length} / 50</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (todayBookings.filter(b => b.bookingStatus === 'CHECKED_IN').length / 50) > 0.8
                          ? 'bg-red-500'
                          : (todayBookings.filter(b => b.bookingStatus === 'CHECKED_IN').length / 50) > 0.6
                          ? 'bg-orange-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(todayBookings.filter(b => b.bookingStatus === 'CHECKED_IN').length / 50) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Expected Arrivals</span>
                    <span className="text-sm font-bold text-gray-200">{todayBookings.length} / 50</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        (todayBookings.length / 50) > 0.8
                          ? 'bg-red-500'
                          : (todayBookings.length / 50) > 0.6
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${(todayBookings.length / 50) * 100}%` }}
                    ></div>
                  </div>
                </div>
                {(todayBookings.length / 50) > 0.8 && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <p className="text-sm text-orange-400">
                      Approaching daily capacity limit. Monitor incoming visitors closely.
                    </p>
                  </div>
                )}
              </div>
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
                   <button onClick={handleFastCheckIn} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group">
                      <CheckCircle className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-semibold">Fast Check-in</span>
                   </button>
                   <button onClick={handleTourAssist} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group">
                      <Compass className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-semibold">Tour Assist</span>
                   </button>
                   <button onClick={handleIncidentReport} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-3 hover:bg-white/10 transition-all group col-span-2">
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

        {/* Notifications */}
        {activeTab === 'notifications' && <NotificationsList />}

        {/* Activity Logs */}
        {activeTab === 'logs' && (
          <div className="glass-card-premium overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-8 border-b border-white/5">
              <h2 className="text-2xl font-black tracking-tight mb-1">Activity Logs</h2>
              <p className="text-xs text-gray-500 italic">Operational activity log for {new Date().toLocaleDateString()}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02] text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                    <th className="p-6">Timestamp</th>
                    <th className="p-6">Activity Type</th>
                    <th className="p-6">Visitor</th>
                    <th className="p-6">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-20 text-center text-gray-600 italic font-light">No activity logs recorded for this cycle.</td>
                    </tr>
                  ) : (
                    // Check-ins
                    activityLogs.checkins?.map((log) => (
                      <tr key={log.bookingId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-6">
                          <span className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</span>
                        </td>
                        <td className="p-6">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400">
                            Check-in
                          </span>
                        </td>
                        <td className="p-6">
                          <p className="font-semibold">{log.user?.firstName} {log.user?.lastName}</p>
                        </td>
                        <td className="p-6 text-xs text-gray-500">
                          Booking #{log.bookingId}
                        </td>
                      </tr>
                    ))
                  )}
                  {activityLogs.checkouts?.map((log) => (
                    <tr key={log.bookingId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6">
                        <span className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</span>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400">
                          Check-out
                        </span>
                      </td>
                      <td className="p-6">
                        <p className="font-semibold">{log.user?.firstName} {log.user?.lastName}</p>
                      </td>
                      <td className="p-6 text-xs text-gray-500">
                        Booking #{log.bookingId}
                      </td>
                    </tr>
                  ))}
                  {activityLogs.cancellations?.map((log) => (
                    <tr key={log.bookingId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-6">
                        <span className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</span>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400">
                          Cancelled
                        </span>
                      </td>
                      <td className="p-6">
                        <p className="font-semibold">{log.user?.firstName} {log.user?.lastName}</p>
                      </td>
                      <td className="p-6 text-xs text-gray-500">
                        Booking #{log.bookingId}
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

        {/* Tour Assist Modal */}
        {showTourAssistModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <Compass className="w-6 h-6 text-blue-400" />
                  Tour Assistance
                </h2>
                <button onClick={() => setShowTourAssistModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-white/5">
                  <h3 className="text-lg font-bold mb-4 text-blue-400">RUGEZI Marshland Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-200">Main Office</p>
                        <p className="text-sm text-gray-500">RUGEZI Marshland Administration</p>
                        <p className="text-sm text-gray-500">Rwanda, East Africa</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-200">Emergency Hotline</p>
                        <p className="text-sm text-gray-500">+250 788 XXX XXX</p>
                        <p className="text-sm text-gray-500">Available 24/7</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-200">Email Support</p>
                        <p className="text-sm text-gray-500">support@rugezimarshland.rw</p>
                        <p className="text-sm text-gray-500">info@rugezimarshland.rw</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/5">
                  <h3 className="text-lg font-bold mb-4 text-gray-200">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center gap-3">
                      <Phone className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-semibold">Call Emergency</span>
                    </button>
                    <button className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-semibold">View Map</span>
                    </button>
                    <button className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center gap-3">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-semibold">Safety Guide</span>
                    </button>
                    <button className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center gap-3">
                      <Activity className="w-5 h-5 text-orange-400" />
                      <span className="text-sm font-semibold">First Aid</span>
                    </button>
                  </div>
                </div>

                <div className="bg-orange-500/10 rounded-2xl p-6 border border-orange-500/20">
                  <h3 className="text-lg font-bold mb-3 text-orange-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Important Notice
                  </h3>
                  <p className="text-sm text-gray-400">
                    For emergencies, always contact the main office first. Staff are available 24/7 for assistance.
                    Do not attempt to handle wildlife emergencies without proper training.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Incident Report Modal */}
        {showIncidentReportModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card-premium max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  Incident Report
                </h2>
                <button onClick={() => setShowIncidentReportModal(false)} className="text-gray-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <form className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Incident Type</label>
                    <select className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30 transition-all">
                      <option value="">Select incident type...</option>
                      <option value="visitor">Visitor Emergency</option>
                      <option value="wildlife">Wildlife Incident</option>
                      <option value="equipment">Equipment Failure</option>
                      <option value="weather">Weather-related</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Location</label>
                    <input type="text" placeholder="Where did the incident occur?" className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Description</label>
                    <textarea rows="4" placeholder="Describe what happened..." className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30 transition-all resize-none"></textarea>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">Severity</label>
                    <div className="flex gap-3">
                      <button type="button" className="flex-1 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-all">Low</button>
                      <button type="button" className="flex-1 p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 text-sm font-semibold hover:bg-orange-500/20 transition-all">Medium</button>
                      <button type="button" className="flex-1 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-all">High</button>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowIncidentReportModal(false)} className="flex-1 py-3 bg-white/5 border border-white/5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-all">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-red-600 hover:bg-red-500 rounded-xl text-sm font-semibold text-white transition-all">Submit Report</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
