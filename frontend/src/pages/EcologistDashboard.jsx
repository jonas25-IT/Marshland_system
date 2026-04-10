import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Leaf, 
  Home, 
  LogOut,
  Plus,
  Search,
  BarChart3,
  FileText,
  Edit,
  Trash2,
  Eye,
  Filter,
  Upload,
  FileDown,
  TrendingUp,
  AlertTriangle,
  Camera,
  MapPin,
  Info,
  X,
  Check,
  Image
} from 'lucide-react';
import GalleryManagement from '../components/GalleryManagement';
import FeedbackList from '../components/FeedbackList';

const EcologistDashboard = () => {
  const { user, logout, api } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Species CRUD state
  const [species, setSpecies] = useState([]);
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState(null);
  
  // Feedback state
  const [feedback, setFeedback] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState(null);
  const [showResearchModal, setShowResearchModal] = useState(false);
  const [researchData, setResearchData] = useState({});

  const loadDashboardData = useCallback(async () => {
    try {
      // Load dashboard overview
      console.log('Loading dashboard data...');
      const dashboardResponse = await api.get('/ecologist/dashboard');
      console.log('Dashboard API response:', dashboardResponse);
      setDashboardData(dashboardResponse.data);
      
      // Load species data
      console.log('Loading species data...');
      const speciesResponse = await api.get('/species');
      console.log('Species API response:', speciesResponse);
      setSpecies(speciesResponse.data);
      
      // Load feedback data
      try {
        const feedbackResponse = await api.get('/feedback');
        setFeedback(feedbackResponse.data);
      } catch (feedbackError) {
        console.error('Failed to load feedback:', feedbackError);
        setFeedback([]);
      }
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set mock data
      setDashboardData({
        totalSpecies: 156,
        mySpecies: 23,
        endangeredSpecies: 12,
        recentAdditions: 5,
        speciesByType: {
          'Birds': 89,
          'Plants': 45,
          'Mammals': 15,
          'Amphibians': 7
        },
        conservationStatus: {
          'Least Concern': 120,
          'Near Threatened': 18,
          'Vulnerable': 12,
          'Endangered': 4,
          'Critically Endangered': 2
        },
        recentActivities: [
          { id: 1, type: 'species_added', description: 'Added Grey Heron to database', timestamp: '2 hours ago' },
          { id: 2, type: 'observation', description: 'Spotted rare White Water Lily', timestamp: '5 hours ago' },
          { id: 3, type: 'research', description: 'Completed habitat assessment for Papyrus', timestamp: '1 day ago' },
        ]
      });
      
      // Mock species data
      setSpecies([
        { speciesId: 1, scientificName: 'Ardea cinerea', commonName: 'Grey Heron', type: 'BIRD', conservationStatus: 'Least Concern', description: 'Large wading bird', creatorName: 'Dr. Jane Smith', dateAdded: '2024-03-28' },
        { speciesId: 2, scientificName: 'Nymphaea lotus', commonName: 'Egyptian Water Lily', type: 'PLANT', conservationStatus: 'Least Concern', description: 'Aquatic flowering plant', creatorName: 'Dr. John Doe', dateAdded: '2024-03-27' },
        { speciesId: 3, scientificName: 'Hippopotamus amphibius', commonName: 'Hippopotamus', type: 'MAMMAL', conservationStatus: 'Vulnerable', description: 'Large semi-aquatic mammal', creatorName: 'Dr. Jane Smith', dateAdded: '2024-03-26' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Species CRUD Operations
  const handleCreateSpecies = async (speciesData) => {
    try {
      const response = await api.post('/species', speciesData);
      setSpecies([...species, response.data]);
      await loadDashboardData(); // Refresh dashboard stats
      setShowSpeciesModal(false);
    } catch (error) {
      console.error('Failed to create species:', error);
    }
  };

  const handleUpdateSpecies = async (id, speciesData) => {
    try {
      const response = await api.put(`/species/${id}`, speciesData);
      setSpecies(species.map(spec => spec.speciesId === id ? response.data : spec));
      setShowSpeciesModal(false);
      setEditingSpecies(null);
    } catch (error) {
      console.error('Failed to update species:', error);
    }
  };

  const handleDeleteSpecies = async (id) => {
    if (window.confirm('Are you sure you want to delete this species?')) {
      try {
        await api.delete(`/species/${id}`);
        setSpecies(species.filter(spec => spec.speciesId !== id));
        await loadDashboardData(); // Refresh dashboard stats
      } catch (error) {
        console.error('Failed to delete species:', error);
      }
    }
  };

  // Upload functionality
  const handleUploadData = async (file, dataType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dataType', dataType);
      
      const response = await api.post('/ecologist/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setUploadData(response.data);
      setShowUploadModal(false);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to upload data:', error);
    }
  };

  // Research data management
  const handleSaveResearch = async (researchInfo) => {
    try {
      const response = await api.post('/ecologist/research', researchInfo);
      setResearchData(response.data);
      setShowResearchModal(false);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to save research data:', error);
    }
  };

  // Generate reports
  const handleGenerateReport = async (reportType) => {
    try {
      const response = await api.get(`/ecologist/reports/${reportType}`, {
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleEditSpecies = (species) => {
    setEditingSpecies(species);
    setShowSpeciesModal(true);
  };

  // Filter species based on search and type
  const filteredSpecies = species.filter(spec => {
    const matchesSearch = spec.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spec.commonName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || spec.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="glass-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-primary-800">Ecologist Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name || user?.email}</span>
              <button
                onClick={() => navigate('/')}
                className="btn-outline"
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
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
          <h2 className="text-3xl font-bold text-gray-800">Welcome, Ecologist!</h2>
          <p className="text-gray-600">Manage biodiversity and species conservation</p>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Total Species</h3>
                <p className="text-3xl font-bold text-primary-800">{dashboardData?.totalSpecies || 0}</p>
              </div>
              <Leaf className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">My Species</h3>
                <p className="text-3xl font-bold text-blue-600">{dashboardData?.mySpecies || 0}</p>
              </div>
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Endangered</h3>
                <p className="text-3xl font-bold text-red-600">{dashboardData?.endangeredSpecies || 0}</p>
              </div>
              <Search className="h-8 w-8 text-red-600" />
            </div>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Recent Additions</h3>
                <p className="text-3xl font-bold text-green-600">{dashboardData?.recentAdditions || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <button 
            onClick={() => setShowSpeciesModal(true)}
            className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
          >
            <Plus className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Add Species</h3>
            <p className="text-sm text-gray-600">Record new species</p>
          </button>
          
          <button 
            onClick={() => setShowUploadModal(true)}
            className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
          >
            <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Upload Data</h3>
            <p className="text-sm text-gray-600">Import research data</p>
          </button>
          
          <button 
            onClick={() => setShowResearchModal(true)}
            className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
          >
            <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Research Notes</h3>
            <p className="text-sm text-gray-600">Add observations</p>
          </button>
          
          <button 
            onClick={() => handleGenerateReport('biodiversity')}
            className="glass-card p-6 text-center hover:shadow-lg transition-shadow"
          >
            <FileDown className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800">Generate Report</h3>
            <p className="text-sm text-gray-600">Export biodiversity data</p>
          </button>
        </section>

        {/* Tab Navigation */}
        <section className="glass-card p-6 mb-8">
          <div className="flex space-x-6 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('species')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'species'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Species Management
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'gallery'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feedback'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visitor Feedback
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Species by Type</h4>
                <div className="space-y-2">
                  {Object.entries(dashboardData?.speciesByType || {}).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">{type}</span>
                      <span className="font-semibold text-primary-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-700 mb-3">Conservation Status</h4>
                <div className="space-y-2">
                  {Object.entries(dashboardData?.conservationStatus || {}).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-gray-700">{status}</span>
                      <span className={`font-semibold ${
                        status === 'Endangered' ? 'text-red-600' : 
                        status === 'Vulnerable' ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div>
              <GalleryManagement />
            </div>
          )}

          {activeTab === 'species' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Species Management</h3>
                <button 
                  onClick={() => setShowSpeciesModal(true)}
                  className="btn-primary flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Species
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search species..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="BIRD">Birds</option>
                    <option value="PLANT">Plants</option>
                    <option value="MAMMAL">Mammals</option>
                    <option value="AMPHIBIAN">Amphibians</option>
                  </select>
                </div>
              </div>

              {/* Species Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scientific Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Common Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conservation Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSpecies.map((spec) => (
                      <tr key={spec.speciesId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {spec.scientificName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {spec.commonName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {spec.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            spec.conservationStatus === 'Endangered' ? 'bg-red-100 text-red-800' : 
                            spec.conservationStatus === 'Vulnerable' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {spec.conservationStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {spec.creatorName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditSpecies(spec)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSpecies(spec.speciesId)}
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
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Biodiversity Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">Species Distribution</h4>
                  <div className="space-y-3">
                    {Object.entries(dashboardData?.speciesByType || {}).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-gray-700">{type}</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-primary-600 h-2 rounded-full" 
                              style={{ width: `${(count / dashboardData?.totalSpecies) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="glass-card p-6">
                  <h4 className="font-semibold text-gray-700 mb-4">Conservation Priority</h4>
                  <div className="space-y-3">
                    {Object.entries(dashboardData?.conservationStatus || {}).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          status === 'Endangered' ? 'text-red-600' : 
                          status === 'Vulnerable' ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>{status}</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${
                                status === 'Endangered' ? 'bg-red-600' : 
                                status === 'Vulnerable' ? 'bg-yellow-600' : 
                                'bg-green-600'
                              }`} 
                              style={{ width: `${(count / dashboardData?.totalSpecies) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">Conservation Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Endangered Species Report</h4>
                  <p className="text-gray-600 mb-4">Detailed analysis of endangered species and conservation efforts.</p>
                  <button className="btn-primary w-full">Generate Report</button>
                </div>
                
                <div className="glass-card p-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Biodiversity Assessment</h4>
                  <p className="text-gray-600 mb-4">Comprehensive assessment of marshland biodiversity and ecosystem health.</p>
                  <button className="btn-primary w-full">Generate Report</button>
                </div>
                
                <div className="glass-card p-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Species Inventory</h4>
                  <p className="text-gray-600 mb-4">Complete inventory of all recorded species with detailed information.</p>
                  <button className="btn-primary w-full">Generate Report</button>
                </div>
                
                <div className="glass-card p-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Conservation Status Update</h4>
                  <p className="text-gray-600 mb-4">Latest updates on conservation status and protection measures.</p>
                  <button className="btn-primary w-full">Generate Report</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Visitor Feedback</h3>
                <div className="text-sm text-gray-600">
                  Total Feedback: {feedback.length}
                </div>
              </div>
              <FeedbackList 
                feedbacks={feedback} 
                loading={loading}
                showUser={true}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default EcologistDashboard;
