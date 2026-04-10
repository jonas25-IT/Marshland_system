import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Image, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Eye, 
  Camera, 
  Upload,
  X,
  Check,
  Grid,
  List,
  Heart,
  Calendar,
  User,
  Tag,
  BarChart3
} from 'lucide-react';

const GalleryManagement = ({ allowedRoles = ['ADMIN', 'ECOLOGIST', 'STAFF'] }) => {
  const { user, api } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const [uploading, setUploading] = useState(false);

  const loadPhotos = async () => {
    try {
      const response = await api.get('/gallery/photos');
      setPhotos(response.data);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/gallery/photos/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  useEffect(() => {
    loadPhotos();
    loadCategories();
  }, []);

  const handleCreatePhoto = async (photoData) => {
    try {
      await api.post('/gallery/photos', photoData);
      await loadPhotos();
      setShowModal(false);
      setEditingPhoto(null);
    } catch (error) {
      console.error('Failed to create photo:', error);
    }
  };

  const handleUpdatePhoto = async (photoData) => {
    try {
      await api.put(`/gallery/photos/${editingPhoto.photoId}`, photoData);
      await loadPhotos();
      setShowModal(false);
      setEditingPhoto(null);
    } catch (error) {
      console.error('Failed to update photo:', error);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await api.delete(`/gallery/photos/${photoId}`);
        await loadPhotos();
      } catch (error) {
        console.error('Failed to delete photo:', error);
      }
    }
  };

  const handleEditPhoto = (photo) => {
    setEditingPhoto(photo);
    setUploadMode('url'); // Reset to URL mode for editing
    setShowModal(true);
  };

  const handleSearch = async (term) => {
    setSearchTerm(term);
    try {
      const response = await api.get(`/gallery/photos/search?searchTerm=${term}`);
      setPhotos(response.data);
    } catch (error) {
      console.error('Failed to search photos:', error);
    }
  };

  const handleFilter = async (category) => {
    setFilterCategory(category);
    try {
      const response = await api.get(`/gallery/photos/category/${category}`);
      setPhotos(response.data);
    } catch (error) {
      console.error('Failed to filter photos:', error);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return null;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/gallery/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = !searchTerm || 
      photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (photo.fileName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (photo.contentType || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || photo.category === filterCategory;
    
    return matchesSearch && matchesCategory;
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Photo Gallery</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => handleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  setUploadMode('url'); // Reset to URL mode for new photo
                  setShowModal(true);
                }}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Photo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="container mx-auto px-6 py-8">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12">
            <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No photos found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map(photo => (
              <div key={photo.photoId} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{photo.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                          {photo.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{photo.description}</p>
                    {(photo.fileName || photo.contentType) && (
                      <p className="text-xs text-gray-500 mb-3">
                        {photo.fileName ? `File: ${photo.fileName}` : ''}
                        {photo.fileName && photo.contentType ? ' • ' : ''}
                        {photo.contentType ? `Type: ${photo.contentType}` : ''}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        {new Date(photo.uploadDate).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        {allowedRoles.includes(user?.role) && (
                          <>
                            <button
                              onClick={() => handleEditPhoto(photo)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePhoto(photo.photoId)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button className="text-gray-600 hover:text-gray-800">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPhoto ? 'Edit Photo' : 'Add New Photo'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  
                  let photoData = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    category: formData.get('category'),
                    fileName: formData.get('fileName'),
                    contentType: formData.get('contentType'),
                    fileSize: formData.get('fileSize') ? Number(formData.get('fileSize')) : null,
                  };
                  
                  if (uploadMode === 'file') {
                    const file = formData.get('file');
                    if (file && file.size > 0) {
                      const uploadResult = await handleFileUpload(file);
                      if (!uploadResult) return; // Upload failed
                      
                      photoData.imageUrl = uploadResult.imageUrl;
                      photoData.fileName = uploadResult.fileName;
                      photoData.contentType = uploadResult.contentType;
                      photoData.fileSize = uploadResult.fileSize;
                    } else {
                      alert('Please select a file to upload');
                      return;
                    }
                  } else {
                    photoData.imageUrl = formData.get('imageUrl');
                    if (!photoData.imageUrl) {
                      alert('Please enter an image URL');
                      return;
                    }
                  }
                  
                  if (editingPhoto) {
                    handleUpdatePhoto(photoData);
                  } else {
                    handleCreatePhoto(photoData);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingPhoto?.title || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="4"
                    defaultValue={editingPhoto?.description || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Source
                  </label>
                  <div className="flex space-x-4 mb-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="uploadMode"
                        value="url"
                        checked={uploadMode === 'url'}
                        onChange={(e) => setUploadMode(e.target.value)}
                        className="mr-2"
                      />
                      <span>Internet URL</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="uploadMode"
                        value="file"
                        checked={uploadMode === 'file'}
                        onChange={(e) => setUploadMode(e.target.value)}
                        className="mr-2"
                      />
                      <span>Upload from PC</span>
                    </label>
                  </div>
                  
                  {uploadMode === 'url' ? (
                    <input
                      type="url"
                      name="imageUrl"
                      defaultValue={editingPhoto?.imageUrl || ''}
                      required={uploadMode === 'url'}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  ) : (
                    <input
                      type="file"
                      name="file"
                      accept="image/*"
                      required={uploadMode === 'file'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  )}
                  
                  {uploading && (
                    <p className="text-sm text-blue-600 mt-2">Uploading file...</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    defaultValue={editingPhoto?.category || 'Wildlife'}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="Wildlife">Wildlife</option>
                    <option value="Landscape">Landscape</option>
                    <option value="Birds">Birds</option>
                    <option value="Plants">Plants</option>
                    <option value="Insects">Insects</option>
                    <option value="Events">Events</option>
                    <option value="Conservation">Conservation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Name (optional)
                  </label>
                  <input
                    type="text"
                    name="fileName"
                    defaultValue={editingPhoto?.fileName || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Type (optional)
                  </label>
                  <input
                    type="text"
                    name="contentType"
                    defaultValue={editingPhoto?.contentType || ''}
                    placeholder="image/png"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Size (bytes) (optional)
                  </label>
                  <input
                    type="number"
                    name="fileSize"
                    defaultValue={editingPhoto?.fileSize || ''}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                  >
                    {editingPhoto ? 'Update' : 'Create'} Photo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
