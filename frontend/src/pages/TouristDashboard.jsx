import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import DashboardLayout, { StatCard, ActivityItem } from '../components/DashboardLayout';
import {
  Calendar, Camera, Star, Clock, MapPin, Search, Filter,
  Heart, MessageSquare, Eye, Info, CheckCircle,
  XCircle, AlertCircle, Bird, Trees, Fish, Bug, Plus, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import FeedbackModal from '../components/FeedbackModal';
import FeedbackList from '../components/FeedbackList';
import Settings from '../components/Settings';
import Profile from '../components/Profile';
import NotificationsList from '../components/NotificationsList';

const TouristDashboard = () => {
  const { user, logout, api } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [species, setSpecies] = useState([]);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [tours, setTours] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false);
  const [previousBookingStatuses, setPreviousBookingStatuses] = useState({});
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [dbRes, speciesRes, galleryRes, toursRes, bookingsRes] = await Promise.all([
        api.get('/tourist/dashboard').catch(e => { console.error('Dashboard error:', e); return { data: null }; }),
        api.get('/species/public').catch(e => { console.error('Species error:', e); return { data: [] }; }),
        api.get('/gallery/photos').catch(e => { console.error('Gallery error:', e); return { data: [] }; }),
        api.get('/tours').catch(e => { console.error('Tours error:', e); return { data: [] }; }),
        api.get('/booking/my-bookings').catch(e => { console.error('Bookings error:', e); return { data: [] }; })
      ]);
      setDashboardData(dbRes.data);
      setSpecies(speciesRes.data);
      setGalleryPhotos(galleryRes.data || []);
      setTours(toursRes.data || []);
      // Update bookings in dashboard data with real data
      if (bookingsRes.data) {
        // Check for status changes
        bookingsRes.data.forEach(booking => {
          const previousStatus = previousBookingStatuses[booking.bookingId];
          if (previousStatus && previousStatus !== booking.bookingStatus) {
            // Status changed, show notification
            if (booking.bookingStatus === 'APPROVED') {
              toast.success(`Your booking for ${new Date(booking.visitDate?.visitDate || booking.visitDate).toLocaleDateString()} has been approved!`);
            } else if (booking.bookingStatus === 'REJECTED') {
              toast.error(`Your booking for ${new Date(booking.visitDate?.visitDate || booking.visitDate).toLocaleDateString()} has been rejected.`);
            }
          }
          // Update previous status
          setPreviousBookingStatuses(prev => ({
            ...prev,
            [booking.bookingId]: booking.bookingStatus
          }));
        });

        setDashboardData(prev => ({
          ...prev,
          bookings: bookingsRes.data,
          totalBookings: bookingsRes.data.length,
          upcomingBookings: bookingsRes.data.filter(b => b.bookingStatus === 'APPROVED').length,
          pendingBookings: bookingsRes.data.filter(b => b.bookingStatus === 'PENDING').length
        }));
      }
    } catch (error) {
      console.error('Tourist data load failed:', error);
      // Mock fallback
      setDashboardData({
        totalBookings: 3, upcomingBookings: 1, completedBookings: 2, pendingBookings: 0,
        bookings: [
          { bookingId: 101, visitDate: '2024-05-12', numberOfVisitors: 2, bookingStatus: 'APPROVED', visitType: 'Nature Walk' },
          { bookingId: 102, visitDate: '2024-06-20', numberOfVisitors: 4, bookingStatus: 'PENDING', visitType: 'Photography' }
        ],
        availableDates: [
          { id: 1, date: '2024-05-15', availableSpots: 10 },
          { id: 2, date: '2024-05-16', availableSpots: 4 }
        ]
      });
      setSpecies([
        { commonName: 'Grey Crowned Crane', type: 'Bird', conservationStatus: 'Endangered' },
        { commonName: 'Sitatunga', type: 'Mammal', conservationStatus: 'Vulnerable' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [api, previousBookingStatuses]);

  useEffect(() => {
    loadData();
    // Poll for booking status changes every 30 seconds
    const interval = setInterval(() => {
      if (activeTab === 'bookings' || activeTab === 'dashboard') {
        api.get('/booking/my-bookings')
          .then(res => {
            if (res.data) {
              res.data.forEach(booking => {
                const previousStatus = previousBookingStatuses[booking.bookingId];
                if (previousStatus && previousStatus !== booking.bookingStatus) {
                  if (booking.bookingStatus === 'APPROVED') {
                    toast.success(`Your booking for ${new Date(booking.visitDate?.visitDate || booking.visitDate).toLocaleDateString()} has been approved!`);
                  } else if (booking.bookingStatus === 'REJECTED') {
                    toast.error(`Your booking for ${new Date(booking.visitDate?.visitDate || booking.visitDate).toLocaleDateString()} has been rejected.`);
                  }
                }
                setPreviousBookingStatuses(prev => ({
                  ...prev,
                  [booking.bookingId]: booking.bookingStatus
                }));
              });
              // Update dashboard data
              setDashboardData(prev => ({
                ...prev,
                bookings: res.data,
                totalBookings: res.data.length,
                upcomingBookings: res.data.filter(b => b.bookingStatus === 'APPROVED').length,
                pendingBookings: res.data.filter(b => b.bookingStatus === 'PENDING').length
              }));
            }
          })
          .catch(e => console.error('Polling bookings error:', e));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loadData, activeTab, previousBookingStatuses]);

  const handleBooking = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const bookingData = {
        visitDate: formData.get('visitDate'),
        numberOfVisitors: parseInt(formData.get('numberOfVisitors')),
        visitType: typeof selectedTour === 'object' ? selectedTour.title : selectedTour || 'Nature Walk'
      };

      await api.post('/booking/new', bookingData);
      toast.success('Booking submitted successfully');
      setShowBookingModal(false);
      loadData();
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to submit booking');
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      await api.post(`/feedback/${selectedBooking.bookingId}`, feedbackData);
      toast.success('Feedback submitted successfully');
    } catch (error) {
      console.error('Feedback submission failed:', error);
      throw error;
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
        
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="My Visits" value={dashboardData?.totalBookings} change="History" icon={Calendar} color="text-purple-400" />
              <StatCard title="Upcoming" value={dashboardData?.upcomingBookings} change="Next Month" icon={Clock} color="text-blue-400" />
              <StatCard title="Eco Points" value={1250} change="+250" icon={Star} color="text-emerald-400" />
              <StatCard title="Saved" value={5} change="Locations" icon={Heart} color="text-pink-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12">
               {/* My Bookings List */}
              <div className="lg:col-span-2 glass-card-premium p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">My Reservations</h3>
                  <button onClick={() => setShowBookingModal(true)} className="btn-premium btn-premium-primary text-xs !py-2">Book New Visit</button>
                </div>
                <div className="space-y-4">
                  {(dashboardData?.bookings || []).map((b) => (
                    <div key={b.bookingId} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-purple-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                           <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-200">{new Date(b.visitDate).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{b.visitType} • {b.numberOfVisitors} Visitors</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          b.bookingStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                          b.bookingStatus === 'PENDING' ? 'bg-orange-500/10 text-orange-400' : 'bg-white/5 text-gray-500'
                        }`}>
                          {b.bookingStatus}
                        </span>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-500 transition-all hidden group-hover:block"><Info className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ecosystem Showcase */}
              <div className="space-y-8">
                <div className="glass-card-premium p-8 h-full">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Bird className="w-5 h-5 text-emerald-400" /> Marshland Watch
                  </h3>
                  <div className="space-y-6">
                    {species.slice(0, 3).map((s, i) => (
                      <div key={i} className="flex items-center gap-4 group cursor-pointer">
                         <div className="w-14 h-14 rounded-xl bg-white/5 overflow-hidden">
                            <img src={s.imageUrl || `https://source.unsplash.com/100x100/?nature,${s.commonName}`} className="w-full h-full object-cover group-hover:scale-110 transition-all" alt="" />
                         </div>
                         <div>
                            <p className="font-bold text-sm">{s.commonName}</p>
                            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">{s.conservationStatus}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab('gallery')} className="w-full mt-8 py-3 bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Explore Wiki</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Gallery / Tours Browse */}
        {activeTab === 'tours' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {(tours && tours.length > 0 ? tours : [
               { tourId: 1, title: 'Bird Watching', description: 'Guided tour through the north marshes.', price: 25, category: 'Wildlife', durationHours: 3, imageUrl: null },
               { tourId: 2, title: 'Photography Safari', description: 'Private access to sunrise locations.', price: 45, category: 'Photography', durationHours: 4, imageUrl: null },
               { tourId: 3, title: 'Canoe Expedition', description: 'River passage through dense papyrus.', price: 35, category: 'Adventure', durationHours: 3, imageUrl: null }
             ]).map((tour, i) => (
               <div key={tour.tourId || i} className="glass-card-premium overflow-hidden group">
                  <div className="h-48 bg-white/5 relative">
                     <img 
                       src={tour.imageUrl || `https://source.unsplash.com/400x300/?nature,marsh,${i}`} 
                       className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" 
                       alt={tour.title} 
                     />
                     <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg font-bold text-emerald-400">
                       ${tour.price}
                     </div>
                  </div>
                  <div className="p-6">
                     <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors uppercase tracking-tight">{tour.title}</h3>
                     <p className="text-sm text-gray-500 font-light mb-2 leading-relaxed">{tour.description}</p>
                     <p className="text-xs text-gray-600 mb-4">{tour.durationHours} hours • {tour.category}</p>
                     <button onClick={() => { setSelectedTour(tour); setShowBookingModal(true); }} className="w-full btn-premium btn-premium-secondary !text-xs !py-3">Check Availability</button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(galleryPhotos && galleryPhotos.length > 0 ? galleryPhotos : [...Array(8)]).map((p, i) => {
              const imageUrl = p?.image_url || p?.imageUrl;
              let fullImageUrl;
              if (imageUrl) {
                if (imageUrl.startsWith('http')) {
                  fullImageUrl = imageUrl;
                } else if (imageUrl.startsWith('/api/gallery/files/')) {
                  fullImageUrl = `http://localhost:8083${imageUrl}`;
                } else {
                  fullImageUrl = `http://localhost:8083${imageUrl}`;
                }
              } else {
                fullImageUrl = `https://source.unsplash.com/400x400/?marsh,nature,wildlife,${i}`;
              }
              return (
                <div key={p?.photo_id || p?.photoId || i} className="aspect-square glass-card-premium overflow-hidden group relative">
                  <img
                    src={fullImageUrl}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    alt={p?.title || "Gallery Fragment"}
                    onError={(e) => { e.target.src = `https://source.unsplash.com/400x400/?marsh,nature,wildlife,${i}`; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">{p?.title || "Scientific Capture"}</p>
                    <p className="text-[10px] text-purple-400 font-medium">{p?.category || "Field Observation"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-8">
            <div className="glass-card-premium p-8">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-400" />
                My Bookings
              </h2>
              <div className="space-y-4">
                {(dashboardData?.bookings || []).map((b) => {
                  const visitDate = b.visitDate?.visitDate || b.visitDate;
                  const visitType = b.specialRequests || b.visitType || 'Nature Walk';
                  return (
                    <div key={b.bookingId} className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                            <Calendar className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-gray-200">{new Date(visitDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p className="text-sm text-gray-500">{visitType} • {b.numberOfVisitors} Visitors</p>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider ${
                          b.bookingStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          b.bookingStatus === 'PENDING' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          b.bookingStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-white/5 text-gray-500 border border-white/10'
                        }`}>
                          {b.bookingStatus}
                        </span>
                      </div>
                      <div className="flex gap-4 pt-4 border-t border-white/5">
                        {b.bookingStatus === 'APPROVED' && (
                          <button onClick={() => { setSelectedBooking(b); setShowFeedbackModal(true); }} className="flex-1 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-sm font-bold text-emerald-400 transition-all">
                            Submit Feedback
                          </button>
                        )}
                        <button onClick={() => { setSelectedBooking(b); setShowBookingDetailsModal(true); }} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-gray-400 transition-all">
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
                {(dashboardData?.bookings || []).length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No bookings yet</p>
                    <button onClick={() => setShowBookingModal(true)} className="btn-premium btn-premium-primary !py-3">
                      Book Your First Visit
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && <NotificationsList />}

        {activeTab === 'profile' && <Profile />}
        {activeTab === 'settings' && <Settings />}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#16171D] rounded-3xl max-w-md w-full p-8 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Book Your Visit</h2>
              <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleBooking} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Visit Date</label>
                <input 
                  type="date" 
                  name="visitDate" 
                  required 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Number of Visitors</label>
                <input 
                  type="number" 
                  name="numberOfVisitors" 
                  required 
                  min="1" 
                  max="20"
                  defaultValue="1"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Visit Type</label>
                <select
                  name="visitType"
                  defaultValue={selectedTour || 'Nature Walk'}
                  className="w-full bg-[#16171D] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm appearance-none"
                >
                  <option value="Nature Walk">Nature Walk</option>
                  <option value="Bird Watching">Bird Watching</option>
                  <option value="Photography">Photography</option>
                  <option value="Canoe Expedition">Canoe Expedition</option>
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-premium btn-premium-primary !py-4"
                >
                  Submit Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedBooking && (
        <FeedbackModal
          booking={selectedBooking}
          isOpen={showFeedbackModal}
          onClose={() => { setShowFeedbackModal(false); setSelectedBooking(null); }}
          onSubmit={handleFeedbackSubmit}
        />
      )}

      {/* Booking Details Modal */}
      {showBookingDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#16171D] rounded-3xl max-w-lg w-full p-8 border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Booking Details</h2>
              <button onClick={() => { setShowBookingDetailsModal(false); setSelectedBooking(null); }} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Booking ID</p>
                    <p className="font-bold text-gray-200">#{selectedBooking.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase ${
                      selectedBooking.bookingStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                      selectedBooking.bookingStatus === 'PENDING' ? 'bg-orange-500/10 text-orange-400' :
                      selectedBooking.bookingStatus === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                      'bg-white/5 text-gray-500'
                    }`}>
                      {selectedBooking.bookingStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Visit Date</p>
                    <p className="font-bold text-gray-200">{new Date(selectedBooking.visitDate?.visitDate || selectedBooking.visitDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Visitors</p>
                    <p className="font-bold text-gray-200">{selectedBooking.numberOfVisitors}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Visit Type</p>
                    <p className="font-bold text-gray-200">{selectedBooking.specialRequests || selectedBooking.visitType || 'Nature Walk'}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setShowBookingDetailsModal(false); setSelectedBooking(null); }} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all">
                  Close
                </button>
                {selectedBooking.bookingStatus === 'APPROVED' && (
                  <button onClick={() => { setShowBookingDetailsModal(false); setShowFeedbackModal(true); }} className="flex-1 btn-premium btn-premium-primary !py-4">
                    Submit Feedback
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default TouristDashboard;
