import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Image as ImageIcon, 
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
  BarChart3,
  RefreshCw,
  MoreVertical,
  Globe,
  Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';

const GalleryManagement = ({ allowedRoles = ['ADMIN', 'ECOLOGIST', 'STAFF'] }) => {
  const { user, api } = useAuth();
  const { t } = useSettings();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [uploadMode, setUploadMode] = useState('file'); // Default to file for local upload
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const loadPhotos = async () => {
    try {
      const response = await api.get('/gallery/photos');
      setPhotos(response.data);
    } catch (error) {
      console.error('Failed to load photos:', error);
      // Fallback mock
      setPhotos([
        { photo_id: 1, title: 'Morning Mist', category: 'Landscape', description: 'Early morning over the north marsh.', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80', upload_date: new Date() },
        { photo_id: 2, title: 'Grey Crane Nest', category: 'Wildlife', description: 'Rare nesting behavior observed.', image_url: 'https://images.unsplash.com/photo-1555620263-73a02c645220?auto=format&fit=crop&q=80', upload_date: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get('/gallery/photos/categories');
      setCategories(response.data.length > 0 ? response.data : ['Wildlife', 'Landscape', 'Birds', 'Plants', 'Conservation']);
    } catch (error) {
      setCategories(['Wildlife', 'Landscape', 'Birds', 'Plants', 'Conservation']);
    }
  };

  useEffect(() => {
    loadPhotos();
    loadCategories();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', 'System Capture ' + new Date().getTime());
    formData.append('category', 'WILDLIFE');
    formData.append('description', 'Synchronized from local PC');
    
    try {
      const response = await api.post('/gallery/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // The backend returns a flat object: { imageUrl, fileName, contentType, fileSize }
      return response.data;
    } catch (error) {
      console.error('File streaming failed:', error);
      toast.error('File streaming failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSavePhoto = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setUploading(true);

    try {
      let imageUrl = editingPhoto?.image_url || '';
      let metaData = {};

      if (uploadMode === 'file') {
        const file = formData.get('file');
        if (file && file.size > 0) {
          const uploadResult = await handleFileUpload(file);
          if (uploadResult) {
            imageUrl = 'http://localhost:8083' + uploadResult.imageUrl;
            metaData = {
              file_name: uploadResult.fileName,
              content_type: uploadResult.contentType,
              file_size: uploadResult.fileSize
            };
          }
        }
      } else {
        imageUrl = formData.get('image_url');
      }

      if (!imageUrl) {
        toast.error('Please provide an image');
        setUploading(false);
        return;
      }

      const photoPayload = {
        title: formData.get('title'),
        description: formData.get('description'),
        category: formData.get('category'),
        image_url: imageUrl,
        ...metaData
      };

      if (editingPhoto) {
        await api.put(`/gallery/photos/${editingPhoto.photo_id || editingPhoto.photoId}`, photoPayload);
        toast.success('Capture synchronized');
      } else {
        await api.post('/gallery/photos', photoPayload);
        toast.success('New moment captured in gallery');
      }

      setShowModal(false);
      setEditingPhoto(null);
      setPreviewUrl(null);
      loadPhotos();
    } catch (error) {
      toast.error('Failed to save to gallery');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Erase this capture from global sync?')) {
      try {
        await api.delete(`/gallery/photos/${id}`);
        toast.success('Photo removed');
        loadPhotos();
      } catch (error) { toast.error('Erase failed'); }
    }
  };

  const handlePreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const filteredPhotos = photos.filter(p => 
    (filterCategory === 'all' || p.category === filterCategory) &&
    (p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Search and Filters Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search the gallery..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full lg:w-48 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-10 py-3.5 text-sm appearance-none focus:outline-none focus:border-purple-500/50 transition-all"
            >
              <option value="all" className="bg-[#0D0E14]">All Elements</option>
              {categories.map(c => <option key={c} value={c} className="bg-[#0D0E14]">{c}</option>)}
            </select>
          </div>

          <button 
            onClick={() => { setEditingPhoto(null); setPreviewUrl(null); setShowModal(true); }}
            className="btn-premium btn-premium-primary !py-3 !px-6 flex items-center gap-2 whitespace-nowrap"
          >
            <Camera className="w-4 h-4" /> Capture Moment
          </button>
        </div>
      </div>

      {/* Cinematic Photo Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
           <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredPhotos.map((photo) => (
            <div key={photo.photo_id || photo.photoId} className="group relative glass-card-premium overflow-hidden aspect-[4/5] scale-in duration-300">
               {/* Background Image */}
               <img 
                 src={photo.image_url || photo.imageUrl} 
                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                 alt="" 
               />
               
               {/* Gradient Overlay */}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

               {/* Photo Info */}
               <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-2 block">{photo.category}</span>
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">{photo.title}</h3>
                  <p className="text-xs text-gray-400 font-light line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity">{photo.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-white/10 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(photo.upload_date || photo.uploadDate).toLocaleDateString()}
                     </span>
                     <div className="flex items-center gap-3">
                        <button 
                          onClick={() => { setEditingPhoto(photo); setPreviewUrl(null); setShowModal(true); }}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors"
                        >
                           <Edit className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDelete(photo.photo_id || photo.photoId)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors"
                        >
                           <Trash2 className="w-3 h-3" />
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          ))}

          {/* Empty State Card */}
          <button 
            onClick={() => { setEditingPhoto(null); setPreviewUrl(null); setShowModal(true); }}
            className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-500/20 transition-all aspect-[4/5] group"
          >
             <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8" />
             </div>
             <p className="text-sm font-bold text-gray-500 group-hover:text-gray-300">New Gallery Entry</p>
          </button>
        </div>
      )}

      {/* Professional Media Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          <div className="relative glass-card-premium w-full max-w-2xl p-0 overflow-hidden shadow-[0_0_100px_rgba(139,92,246,0.15)] flex flex-col md:flex-row h-[600px] md:h-auto">
            {/* Left Side: Preview */}
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative group min-h-[300px]">
               {previewUrl || editingPhoto?.image_url || editingPhoto?.imageUrl ? (
                 <img src={previewUrl || editingPhoto?.image_url || editingPhoto?.imageUrl} className="w-full h-full object-cover" alt="Preview" />
               ) : (
                 <div className="flex flex-col items-center gap-3 text-gray-700">
                    <ImageIcon className="w-12 h-12" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Media Selected</span>
                 </div>
               )}
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                  <button 
                    type="button"
                    onClick={() => document.getElementById('gallery-file-input').click()}
                    className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white mb-3"
                  >
                     <Upload className="w-6 h-6" />
                  </button>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Capture from PC</p>
               </div>
            </div>

            {/* Right Side: Attributes */}
            <form onSubmit={handleSavePhoto} className="flex-1 p-10 flex flex-col justify-between">
               <input id="gallery-file-input" name="file" type="file" className="hidden" accept="image/*" onChange={handlePreview} />
               <div>
                  <div className="flex justify-between items-start mb-8">
                     <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">{editingPhoto ? 'Edit Fragment' : 'New Capture'}</h2>
                        <p className="text-xs text-gray-500 italic mt-1">Sync visual moments with the Marshland ecosystem</p>
                     </div>
                     <button type="button" onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Title</label>
                        <input name="title" defaultValue={editingPhoto?.title} required placeholder="Name this moment..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm" />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Category</label>
                           <select name="category" defaultValue={editingPhoto?.category || 'Wildlife'} className="w-full bg-[#16171D] border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm appearance-none">
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Sync Source</label>
                           <div className="flex items-center gap-2 h-full py-4 px-2">
                              <button type="button" onClick={() => setUploadMode('file')} className={`flex-1 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${uploadMode === 'file' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Local</button>
                              <button type="button" onClick={() => setUploadMode('url')} className={`flex-1 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${uploadMode === 'url' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Internet</button>
                           </div>
                        </div>
                     </div>

                     {uploadMode === 'url' && (
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Media Link</label>
                           <input name="image_url" defaultValue={editingPhoto?.image_url || editingPhoto?.imageUrl} placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm font-mono" />
                        </div>
                     )}

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Composition Description</label>
                        <textarea name="description" defaultValue={editingPhoto?.description} rows="3" placeholder="Narrate the scenery..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-purple-500/50 transition-all text-sm resize-none" />
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 mt-10">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all">Cancel</button>
                  <input type="file" name="file" className="hidden" id="gallery-file-final" onChange={handlePreview} />
                  <button type="submit" disabled={uploading} className="flex-1 btn-premium btn-premium-primary !py-4 flex items-center justify-center gap-3">
                     {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (editingPhoto ? 'Update Fragment' : 'Authorize Sync')}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
