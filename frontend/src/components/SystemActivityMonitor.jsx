import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Activity, Users, Calendar, Search, Filter, Download,
  TrendingUp, AlertCircle, CheckCircle, XCircle, Clock,
  User, FileText, Database, MapPin, Camera, BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const SystemActivityMonitor = () => {
  const { api } = useAuth();
  const [activities, setActivities] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: '',
    entityType: '',
    user: '',
    dateRange: { start: '', end: '' }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Load activities and statistics
  useEffect(() => {
    loadActivities();
    loadStatistics();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/system-activity/recent');
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to load activities:', error);
      toast.error('Failed to load system activities');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await api.get('/system-activity/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadActivities();
      return;
    }

    try {
      const response = await api.get(`/system-activity/search?keyword=${searchTerm}`);
      setActivities(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    }
  };

  const handleFilter = async (type, value) => {
    const newFilter = { ...filter, [type]: value };
    setFilter(newFilter);

    try {
      let url = '/system-activity';
      if (type === 'action' && value) {
        url = `/system-activity/action/${value}`;
      } else if (type === 'entityType' && value) {
        url = `/system-activity/entity/${value}`;
      } else if (type === 'user' && value) {
        url = `/system-activity/user/${value}`;
      } else if (newFilter.dateRange.start && newFilter.dateRange.end) {
        url = `/system-activity/range?startDate=${newFilter.dateRange.start}&endDate=${newFilter.dateRange.end}`;
      } else {
        url = '/system-activity/recent';
      }

      const response = await api.get(url);
      setActivities(response.data);
    } catch (error) {
      console.error('Filter failed:', error);
      toast.error('Filter failed');
    }
  };

  const loadTabActivities = async (tab) => {
    setActiveTab(tab);
    try {
      let url = '/api/system-activity';
      switch (tab) {
        case 'logins':
          url = '/api/system-activity/logins';
          break;
        case 'booking-decisions':
          url = '/api/system-activity/booking-decisions';
          break;
        case 'deletions':
          url = '/api/system-activity/deletions';
          break;
        case 'failed':
          url = '/api/system-activity/failed';
          break;
        default:
          url = '/api/system-activity/recent';
      }

      const response = await api.get(url);
      setActivities(response.data);
    } catch (error) {
      console.error('Failed to load tab activities:', error);
      toast.error('Failed to load activities');
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN': return <Users className="w-4 h-4" />;
      case 'LOGOUT': return <XCircle className="w-4 h-4" />;
      case 'CREATE': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'UPDATE': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'DELETE': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'APPROVE': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'REJECT': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'LOGIN': return 'text-blue-500 bg-blue-500/10';
      case 'LOGOUT': return 'text-gray-500 bg-gray-500/10';
      case 'CREATE': return 'text-green-500 bg-green-500/10';
      case 'UPDATE': return 'text-blue-500 bg-blue-500/10';
      case 'DELETE': return 'text-red-500 bg-red-500/10';
      case 'APPROVE': return 'text-emerald-500 bg-emerald-500/10';
      case 'REJECT': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getEntityIcon = (entityType) => {
    switch (entityType) {
      case 'USER': return <Users className="w-4 h-4" />;
      case 'BOOKING': return <Calendar className="w-4 h-4" />;
      case 'SPECIES': return <Database className="w-4 h-4" />;
      case 'SPECIES_REPORT': return <FileText className="w-4 h-4" />;
      case 'GALLERY': return <Camera className="w-4 h-4" />;
      case 'LOCATION': return <MapPin className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Activities</p>
                <p className="text-2xl font-bold text-white">{statistics.totalActivities}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Successful</p>
                <p className="text-2xl font-bold text-green-500">{statistics.successfulActivities}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-500">{statistics.failedActivities}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-purple-500">{statistics.uniqueUsers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Filter */}
          <select
            value={filter.action}
            onChange={(e) => handleFilter('action', e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="APPROVE">Approve</option>
            <option value="REJECT">Reject</option>
          </select>

          {/* Entity Filter */}
          <select
            value={filter.entityType}
            onChange={(e) => handleFilter('entityType', e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Entities</option>
            <option value="USER">User</option>
            <option value="BOOKING">Booking</option>
            <option value="SPECIES">Species</option>
            <option value="SPECIES_REPORT">Species Report</option>
            <option value="GALLERY">Gallery</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 border border-white/10 rounded-lg p-1">
        {[
          { id: 'all', label: 'All Activities', icon: <Activity className="w-4 h-4" /> },
          { id: 'logins', label: 'Logins', icon: <Users className="w-4 h-4" /> },
          { id: 'booking-decisions', label: 'Booking Decisions', icon: <Calendar className="w-4 h-4" /> },
          { id: 'deletions', label: 'Deletions', icon: <XCircle className="w-4 h-4" /> },
          { id: 'failed', label: 'Failed', icon: <AlertCircle className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => loadTabActivities(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Activities Table */}
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Entity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Performed By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${getActionColor(activity.action)}`}>
                        {getActionIcon(activity.action)}
                      </div>
                      <span className="text-sm text-white">{activity.action}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getEntityIcon(activity.entityType)}
                      <span className="text-sm text-white">{activity.entityType}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-white">
                      <p className="font-medium">{truncateText(activity.entityName, 30)}</p>
                      <p className="text-gray-400 text-xs">{truncateText(activity.description, 40)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm">
                      <p className="text-white">{activity.performedBy}</p>
                      <p className="text-gray-400 text-xs">{activity.performedByRole}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(activity.timestamp)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {activity.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${activity.success ? 'text-green-500' : 'text-red-500'}`}>
                        {activity.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {activities.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No activities found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemActivityMonitor;
