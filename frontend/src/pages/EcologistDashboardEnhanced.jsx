import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
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
  BarChart3, 
  Activity, 
  Calendar, 
  Search, 
  Filter, 
  TrendingUp, 
  MapPin, 
  Camera, 
  AlertTriangle,
  Bell,
  Users,
  Database,
  Zap,
  Download,
  RefreshCw,
  Settings,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  Clock,
  Globe,
  Shield,
  Info
} from 'lucide-react';

const EcologistDashboardEnhanced = () => {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [species, setSpecies] = useState([]);
  const [dashboardData, setDashboardData] = useState({ stats: {}, activities: [] });
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddSpeciesModal, setShowAddSpeciesModal] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState([]);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('Starting dashboard data load...');
        setLoading(true);
        
        // Test basic connection first
        try {
          await api.get('/auth/test');
          console.log('Backend connection OK');
        } catch (testError) {
          console.error('Backend connection failed:', testError);
          setLoading(false);
          return;
        }
        
        // Load species data first
        console.log('Loading species data...');
        const speciesResponse = await api.get('/species-public');
        console.log('Species data loaded:', speciesResponse.data);
        setSpecies(speciesResponse.data || []);
        
        // Try to load stats (may fail if endpoint doesn't exist)
        try {
          console.log('Loading statistics...');
          const statsResponse = await api.get('/species/statistics');
          console.log('Stats loaded:', statsResponse.data);
          
          const activitiesResponse = await api.get('/species/recent-activities');
          console.log('Activities loaded:', activitiesResponse.data);
          
          setDashboardData({
            stats: statsResponse.data || {},
            activities: activitiesResponse.data || []
          });
        } catch (statsError) {
          console.warn('Stats/activities not available:', statsError.message);
          setDashboardData({ stats: {}, activities: [] });
        }
        
        // Show success notification
        setNotifications([{
          id: Date.now(),
          type: 'success',
          message: 'Dashboard data loaded successfully'
        }]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setNotifications([{
          id: Date.now(),
          type: 'error',
          message: `Failed to load data: ${error.message}`
        }]);
      } finally {
        console.log('Dashboard data load completed');
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []); // Run only once on mount

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddSpecies = async (speciesData) => {
    try {
      const response = await api.post('/species', speciesData);
      setSpecies([...species, response.data]);
      setShowAddSpeciesModal(false);
      
      setNotifications([{
        id: Date.now(),
        type: 'success',
        message: 'Species added successfully'
      }]);
    } catch (error) {
      setNotifications([{
        id: Date.now(),
        type: 'error',
        message: 'Failed to add species'
      }]);
    }
  };

  const handleUpdateSpecies = async (speciesData) => {
    try {
      const response = await api.put(`/ecologist/species/${editingSpecies.speciesId}`, speciesData);
      setSpecies(species.map(s => s.speciesId === editingSpecies.speciesId ? response.data : s));
      setEditingSpecies(null);
      
      setNotifications([{
        id: Date.now(),
        type: 'success',
        message: 'Species updated successfully'
      }]);
    } catch (error) {
      setNotifications([{
        id: Date.now(),
        type: 'error',
        message: 'Failed to update species: ' + (error.response?.data?.message || error.message)
      }]);
    }
  };

  const handleDeleteSpecies = async (speciesId) => {
    if (window.confirm('Are you sure you want to delete this species? This action cannot be undone.')) {
      try {
        await api.delete(`/ecologist/species/${speciesId}`);
        await loadDashboardData();
        toast.success('Species deleted successfully!');
      } catch (error) {
        console.error('Failed to delete species:', error);
        toast.error('Failed to delete species: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleBulkUpload = async () => {
    try {
      const formData = new FormData();
      uploadFiles.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await api.post('/species/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSpecies([...species, ...response.data]);
      setShowBulkUploadModal(false);
      setUploadFiles([]);
      
      setNotifications([{
        id: Date.now(),
        type: 'success',
        message: `Bulk upload completed: ${response.data.length} species added`
      }]);
    } catch (error) {
      setNotifications([{
        id: Date.now(),
        type: 'error',
        message: 'Failed to upload species'
      }]);
    }
  };

  const filteredSpecies = species.filter(species => 
    species.commonName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    species.scientificName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    species.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    species.conservationStatus?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo size="medium" variant="icon-only" />
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">Biodiversity Management</h1>
                <span className="text-sm text-gray-500">Species Research & Conservation</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.firstName} {user?.lastName}</span>
              <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-center mb-2">
              <Bell className="h-5 w-5 text-blue-500" />
              <h3 className="ml-2 text-lg font-semibold">Notifications</h3>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-start p-3 hover:bg-gray-50 rounded">
                  <div className={`w-2 h-2 rounded-full mt-1 ${
                    notification.type === 'success' ? 'bg-green-100' :
                    notification.type === 'error' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}></div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500">{new Date(notification.id).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {['overview', 'species', 'analytics', 'gallery', 'research', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'overview' && <BarChart3 className="h-4 w-4 mr-2" />}
                  {tab === 'species' && <Leaf className="h-4 w-4 mr-2" />}
                  {tab === 'analytics' && <BarChart3 className="h-4 w-4 mr-2" />}
                  {tab === 'gallery' && <Camera className="h-4 w-4 mr-2" />}
                  {tab === 'research' && <Database className="h-4 w-4 mr-2" />}
                  {tab === 'settings' && <Settings className="h-4 w-4 mr-2" />}
                  <span className="capitalize">{tab}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Stats Cards */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Total Species</h3>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.stats?.totalSpecies || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Endangered Species</h3>
                  <p className="text-3xl font-bold text-red-600">{dashboardData.stats?.endangeredCount || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Research Activities</h3>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.activities?.length || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Conservation Impact</h3>
                  <p className="text-3xl font-bold text-gray-900">{dashboardData.stats?.conservationImpact || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'species' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Species Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search species..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowAddSpeciesModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Species
                  </button>
                  <button
                    onClick={() => setShowBulkUploadModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Bulk Upload
                  </button>
                </div>
              </div>
            </div>

            {/* Species Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scientific Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Common Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conservation Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSpecies.map((species) => (
                    <tr key={species.speciesId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {species.scientificName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {species.commonName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {species.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          species.conservationStatus === 'Endangered' ? 'bg-red-100 text-red-800' :
                          species.conservationStatus === 'Vulnerable' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {species.conservationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingSpecies(species);
                              setShowAddSpeciesModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateSpecies(species)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSpecies(species.speciesId)}
                            className="text-red-600 hover:text-red-900"
                          >
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
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Biodiversity Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <BarChart3 className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Species Distribution</h3>
                <div className="space-y-4">
                  {['Mammals', 'Birds', 'Reptiles', 'Amphibians', 'Fish'].map((type) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-900">{type}</span>
                      <div className="text-2xl font-bold text-gray-900">{Math.floor(Math.random() * 100)}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <BarChart3 className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Conservation Status Trends</h3>
                <div className="space-y-4">
                  {['Endangered', 'Vulnerable', 'Least Concern'].map((status) => (
                    <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        status === 'Endangered' ? 'bg-red-100 text-red-800' :
                        status === 'Vulnerable' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {status}
                      </span>
                      <div className="text-2xl font-bold text-gray-900">{Math.floor(Math.random() * 50 + 10)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Species Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {species.slice(0, 8).map((species) => (
                <div key={species.speciesId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <img 
                    src={species.imageUrl || '/api/placeholder/150x150'} 
                    alt={species.commonName}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{species.commonName}</h3>
                    <p className="text-sm italic text-gray-600">{species.scientificName}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        species.conservationStatus === 'Endangered' ? 'bg-red-100 text-red-800' :
                        species.conservationStatus === 'Vulnerable' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {species.conservationStatus}
                      </span>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'research' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Research Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <Database className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Species Database</h3>
                <p className="text-sm text-gray-600">Advanced search and filtering capabilities</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <Zap className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">AI Species Identification</h3>
                <p className="text-sm text-gray-600">Machine learning for species classification</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <FileText className="h-8 w-8 text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Research Reports</h3>
                <p className="text-sm text-gray-600">Generate comprehensive biodiversity reports</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Research Settings</h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources</h3>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Primary Data Source</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>Field Research</option>
                    <option>Citizen Science</option>
                    <option>Academic Partnerships</option>
                    <option>Government Data</option>
                  </select>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Settings</h3>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Default Export Format</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>CSV</option>
                    <option>JSON</option>
                    <option>PDF</option>
                    <option>Excel</option>
                  </select>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Email notifications for new species</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Weekly research summaries</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Species Modal */}
      {showAddSpeciesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 m-4 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Species</h3>
              <button
                onClick={() => setShowAddSpeciesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddSpecies({
                scientificName: e.target.scientificName.value,
                commonName: e.target.commonName.value,
                type: e.target.type.value,
                conservationStatus: e.target.conservationStatus.value,
                description: e.target.description.value,
                habitat: e.target.habitat.value
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Scientific Name *</label>
                  <input
                    type="text"
                    name="scientificName"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Common Name *</label>
                  <input
                    type="text"
                    name="commonName"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type *</label>
                  <select
                    name="type"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a type...</option>
                    <option value="MAMMALS">Mammals</option>
                    <option value="BIRDS">Birds</option>
                    <option value="REPTILES">Reptiles</option>
                    <option value="AMPHIBIANS">Amphibians</option>
                    <option value="FISH">Fish</option>
                    <option value="INSECTS">Insects</option>
                    <option value="PLANTS">Plants</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Conservation Status *</label>
                  <select
                    name="conservationStatus"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select status...</option>
                    <option value="Least Concern">Least Concern</option>
                    <option value="Near Threatened">Near Threatened</option>
                    <option value="Vulnerable">Vulnerable</option>
                    <option value="Endangered">Endangered</option>
                    <option value="Critically Endangered">Critically Endangered</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Habitat</label>
                  <textarea
                    name="habitat"
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the typical habitat..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    rows="4"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe the species characteristics, behavior, and conservation notes..."
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Add Species
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 m-4 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Bulk Upload Species</h3>
              <button
                onClick={() => setShowBulkUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">Click to select files or drag and drop</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".csv,.json,.xlsx"
                  onChange={(e) => setUploadFiles(Array.from(e.target.files))}
                  className="hidden"
                />
              </div>
              <div className="mt-4">
                <button
                  onClick={handleBulkUpload}
                  disabled={uploadFiles.length === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {uploadFiles.length} Files
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default EcologistDashboardEnhanced;
