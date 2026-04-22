import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, Mail, Phone, Lock, 
  MapPin, Shield, Camera, Save, 
  RefreshCw, Eye, EyeOff 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      // In a real app, you'd send this to the profile update endpoint
      // const response = await api.put('/auth/profile', formData);
      await updateProfile(formData);
      toast.success('Profile Identity Synchronized');
    } catch (error) {
      toast.error(error.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-2 opacity-90">My Profile</h1>
        <p className="text-gray-500 font-light italic">Universal ID and clearance management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card-premium p-8 text-center relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
             <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border-2 border-white/5 shadow-2xl relative overflow-hidden">
                   <span className="text-5xl font-black text-white tracking-widest opacity-20 uppercase">
                      {(user?.firstName?.charAt(0) || '') + (user?.lastName?.charAt(0) || (user?.firstName ? '' : 'U'))}
                   </span>
                   <div className="absolute inset-0 bg-purple-600/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-8 h-8 text-white" />
                   </div>
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-white rounded-xl border-4 border-[#0D0E14] shadow-lg">
                   <Shield className="w-4 h-4" />
                </div>
             </div>
             <h2 className="text-2xl font-black tracking-tight opacity-95">{user?.firstName} {user?.lastName}</h2>
             <p className="text-xs font-black text-purple-500 uppercase tracking-widest mt-1 mb-6">{user?.role}</p>
             <div className="flex justify-center items-center gap-2 text-xs text-gray-500 font-mono italic p-2 bg-black/20 rounded-lg">
                Member since {new Date(user?.registrationDate).getFullYear() || '2026'}
             </div>
          </div>
        </div>

        {/* Right: Management Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="glass-card-premium p-8">
               <h3 className="text-lg font-bold text-gray-200 mb-8 flex items-center gap-3">
                 <User className="w-5 h-5 text-purple-500" /> Identity Synchronization
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Legal First Name</label>
                   <input
                     name="firstName"
                     value={formData.firstName}
                     onChange={handleChange}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-purple-500/30 transition-all"
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Legal Last Name</label>
                   <input
                     name="lastName"
                     value={formData.lastName}
                     onChange={handleChange}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-purple-500/30 transition-all"
                   />
                 </div>
               </div>

               <div className="mt-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Universal Email</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-purple-500/30 transition-all opacity-60"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Secure Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-purple-500/30 transition-all"
                      />
                    </div>
                  </div>
               </div>
            </div>

            <div className="glass-card-premium p-8">
               <h3 className="text-lg font-bold opacity-80 mb-8 flex items-center gap-3">
                 <Lock className="w-5 h-5 text-pink-500" /> Access Key Rotation
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">New Access Key</label>
                   <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-14 text-sm focus:outline-none focus:border-purple-500/30 transition-all"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                   </div>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Verify Access Key</label>
                   <input
                     type="password"
                     name="confirmPassword"
                     placeholder="••••••••"
                     value={formData.confirmPassword}
                     onChange={handleChange}
                     className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-purple-500/30 transition-all"
                   />
                 </div>
               </div>
               <p className="mt-6 text-[11px] text-gray-500 italic leading-relaxed">Leave access key fields empty to maintain current credentials. Rotation requires minimum 6 characters.</p>
            </div>

            <div className="flex justify-end gap-4">
               <button 
                 type="button"
                 onClick={() => setFormData({
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    email: user?.email || '',
                    phone: user?.phone || '',
                    password: '',
                    confirmPassword: ''
                 })}
                 className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 px-8"
               >
                 Revert Changes
               </button>
               <button 
                 type="submit"
                 disabled={loading}
                 className="btn-premium btn-premium-primary py-4 px-10 flex items-center gap-3 shadow-[0_10px_30px_rgba(139,92,246,0.3)] min-w-[200px] justify-center"
               >
                 {loading ? (
                   <RefreshCw className="w-4 h-4 animate-spin text-white" />
                 ) : (
                   <>Synchronize Identity <Save className="w-5 h-5" /></>
                 )}
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
