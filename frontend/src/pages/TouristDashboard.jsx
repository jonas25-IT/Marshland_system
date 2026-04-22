import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import DashboardLayout, { StatCard, ActivityItem } from '../components/DashboardLayout';
import { 
  Calendar, Camera, Star, Clock, MapPin, Search, Filter, 
  Heart, MessageSquare, Eye, Info, CheckCircle, 
  XCircle, AlertCircle, Bird, Trees, Fish, Bug, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import FeedbackModal from '../components/FeedbackModal';
import FeedbackList from '../components/FeedbackList';
import Settings from '../components/Settings';
import Profile from '../components/Profile';

const TouristDashboard = () => {
  const { user, logout, api } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [species, setSpecies] = useState([]);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [dbRes, speciesRes, galleryRes] = await Promise.all([
        api.get('/tourist/dashboard'),
        api.get('/species/public'),
        api.get('/gallery/photos')
      ]);
      setDashboardData(dbRes.data);
      setSpecies(speciesRes.data);
      setGalleryPhotos(galleryRes.data || []);
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
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
                  <button className="btn-premium btn-premium-primary text-xs !py-2">Book New Visit</button>
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
             {[
               { t: 'Bird Watching', d: 'Guided tour through the north marshes.', p: '25$' },
               { t: 'Photography Safari', d: 'Private access to sunrise locations.', p: '45$' },
               { t: 'Canoe Expedition', d: 'River passage through dense papyrus.', p: '35$' }
             ].map((tour, i) => (
               <div key={i} className="glass-card-premium overflow-hidden group">
                  <div className="h-48 bg-white/5 relative">
                     <img src={`https://source.unsplash.com/400x300/?nature,marsh,${i}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" alt="" />
                     <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg font-bold text-emerald-400">{tour.p}</div>
                  </div>
                  <div className="p-6">
                     <h3 className="text-lg font-bold mb-2 group-hover:text-purple-400 transition-colors uppercase tracking-tight">{tour.t}</h3>
                     <p className="text-sm text-gray-500 font-light mb-6 leading-relaxed">{tour.d}</p>
                     <button className="w-full btn-premium btn-premium-secondary !text-xs !py-3">Check Availability</button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(galleryPhotos && galleryPhotos.length > 0 ? galleryPhotos : [...Array(8)]).map((p, i) => (
              <div key={p?.photo_id || p?.photoId || i} className="aspect-square glass-card-premium overflow-hidden group relative">
                <img 
                  src={p?.image_url || p?.imageUrl || `https://source.unsplash.com/400x400/?marsh,nature,wildlife,${i}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" 
                  alt={p?.title || "Gallery Fragment"} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">{p?.title || "Scientific Capture"}</p>
                  <p className="text-[10px] text-purple-400 font-medium">{p?.category || "Field Observation"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'profile' && <Profile />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </DashboardLayout>
  );
};

export default TouristDashboard;
