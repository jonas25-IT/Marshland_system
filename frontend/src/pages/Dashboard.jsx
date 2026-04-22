import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import DashboardLayout, { StatCard, ActivityItem } from '../components/DashboardLayout';
import { 
  Users, Calendar, Bird, MapPin, Clock, TrendingUp, 
  Award, Bell, User, Leaf
} from 'lucide-react';
import Settings from '../components/Settings';
import Profile from '../components/Profile';

const Dashboard = () => {
  const { user } = useAuth();
  const { role } = useParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});

  const effectiveRole = role || user?.role || 'TOURIST';

  useEffect(() => {
    // Mock data for the generic dashboard
    const mockStats = {
      ADMIN: { u: 1247, b: 89, s: 523, v: 2456 },
      ECOLOGIST: { s: 523, e: 47, r: 12, c: 8 },
      STAFF: { v: 45, p: 23, t: 156, a: 4.8 },
      TOURIST: { b: 2, v: 8, p: 1250, n: 'Jan 15' }
    };
    setStats(mockStats[effectiveRole] || mockStats.TOURIST);
  }, [effectiveRole]);

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-10 animate-in fade-in duration-500">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {effectiveRole === 'ADMIN' && (
               <>
                 <StatCard title="Total Users" value={stats.u} change="+12%" icon={Users} color="text-purple-400" />
                 <StatCard title="Active Bookings" value={stats.b} change="+3%" icon={Calendar} color="text-blue-400" />
                 <StatCard title="Species Inventory" value={stats.s} change="+2%" icon={Bird} color="text-emerald-400" />
                 <StatCard title="Visitor Count" value={stats.v} change="+8%" icon={TrendingUp} color="text-pink-400" />
               </>
             )}
             {effectiveRole === 'TOURIST' && (
               <>
                 <StatCard title="My Reservations" value={stats.b} change="Active" icon={Calendar} color="text-purple-400" />
                 <StatCard title="Marshland Sites" value={stats.v} change="Discovered" icon={MapPin} color="text-blue-400" />
                 <StatCard title="Eco Points" value={stats.p} change="+150" icon={Award} color="text-emerald-400" />
                 <StatCard title="Next Visit" value={stats.n} change="Scheduled" icon={Clock} color="text-pink-400" />
               </>
             )}
             {/* Fallback for other roles or generic stats */}
             {!['ADMIN', 'TOURIST'].includes(effectiveRole) && (
               <>
                 <StatCard title="Records" value="4.2k" change="+5%" icon={Leaf} color="text-purple-400" />
                 <StatCard title="Sync Status" value="Online" change="100%" icon={Clock} color="text-blue-400" />
                 <StatCard title="Alerts" value="0" change="Stable" icon={Bell} color="text-emerald-400" />
                 <StatCard title="Identity" value={user?.firstName} change={user?.role} icon={User} color="text-pink-400" />
               </>
             )}
          </div>
        )}

        {activeTab === 'profile' && <Profile />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
