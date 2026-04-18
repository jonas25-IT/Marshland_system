import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Leaf, 
  Home, 
  LogOut, 
  Plus, 
  Upload, 
  FileText, 
  FileDown, 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  BarChart3, 
  Activity, 
  Calendar, 
  Filter, 
  TrendingUp, 
  MapPin, 
  Camera, 
  AlertTriangle,
  Users,
  Database,
  Zap
} from 'lucide-react';

const EcologistDashboard = () => {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [species, setSpecies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load dashboard data
        const dashboardResponse = await api.get('/ecologist/dashboard');
        setDashboardData(dashboardResponse.data);
        
        // Load species data
        const speciesResponse = await api.get('/species');
        setSpecies(speciesResponse.data || []);
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [api]);

  const handleLogout = () => {
    logout();
  };

  const safeString = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);
    return JSON.stringify(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-blue-800">Ecologist Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-800">
                <Home className="h-4 w-4 mr-2" />
                Home
              </button>
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome, {safeString(user?.firstName || user?.email || 'Ecologist')}!
          </h2>
          <p className="text-gray-600">Manage biodiversity and species conservation</p>
        </section>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'species', 'analytics', 'gallery', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">Total Species</h3>
                    <p className="text-3xl font-bold text-blue-600">{safeString(dashboardData?.totalSpecies || 0)}</p>
                  </div>
                  <Leaf className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">My Species</h3>
                    <p className="text-3xl font-bold text-green-600">{safeString(dashboardData?.mySpecies?.length || 0)}</p>
                  </div>
                  <Plus className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">Endangered</h3>
                    <p className="text-3xl font-bold text-red-600">{safeString(dashboardData?.conservationStatus?.endangered || 0)}</p>
                  </div>
                  <Search className="h-8 w-8 text-red-600" />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-600">Recent Additions</h3>
                    <p className="text-3xl font-bold text-purple-600">{safeString(dashboardData?.recentSpecies?.length || 0)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Species Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-semibold text-gray-700 mb-4">Species by Type</h4>
                <div className="space-y-2">
                  {Object.entries(dashboardData?.speciesByType || {}).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">{safeString(type)}</span>
                      <span className="font-semibold text-blue-600">{safeString(count)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="font-semibold text-gray-700 mb-4">Conservation Status</h4>
                <div className="space-y-2">
                  {Object.entries(dashboardData?.conservationStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">{safeString(status)}</span>
                      <span className="font-semibold text-gray-600">{safeString(count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'species' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Species Management</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Search species..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Species
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scientific Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Common Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {species.filter(spec => 
                      safeString(spec.scientificName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                      safeString(spec.commonName).toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((spec) => (
                      <tr key={safeString(spec.speciesId)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {safeString(spec.scientificName)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {safeString(spec.commonName)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {safeString(spec.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {safeString(spec.conservationStatus)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
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

        {activeTab === 'analytics' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Analytics & Reports</h3>
            <p className="text-gray-600">Analytics features coming soon...</p>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Gallery Management</h3>
            <p className="text-gray-600">Gallery features coming soon...</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reports</h3>
            <p className="text-gray-600">Report generation features coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default EcologistDashboard;
