import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Eye, EyeOff, Mail, Lock, User, UserPlus, ChevronDown, Shield, Bird } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register, loading, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'TOURIST',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'Required';
    if (!formData.lastName) newErrors.lastName = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.password) newErrors.password = 'Required';
    else if (formData.password.length < 6) newErrors.password = 'Too short (min 6)';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Mismatch';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const result = await register(formData);
    if (result.success) {
      toast.success('Clearance Granted. Welcome to Rugezi!');
      const path = getDashboardPath(result.user.role);
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0E14] flex items-center justify-center p-4 dashboard-bg font-sans relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-2xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-2xl shadow-xl shadow-purple-500/20">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-glow">Marshland</span>
          </Link>
          <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">Create Identity</h2>
          <p className="text-gray-400 font-light italic">Join the Rugezi ecosystem network</p>
        </div>

        <div className="glass-card-premium p-10 relative overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* First Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">Legal First Name</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-600 group-focus-within/input:text-purple-400 transition-colors" />
                  </div>
                  <input
                    name="firstName"
                    type="text"
                    required
                    autoComplete="given-name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-gray-700"
                    placeholder="e.g. John"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                {errors.firstName && <p className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-tighter ml-1">{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">Legal Last Name</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-600 group-focus-within/input:text-purple-400 transition-colors" />
                  </div>
                  <input
                    name="lastName"
                    type="text"
                    required
                    autoComplete="family-name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-gray-700"
                    placeholder="e.g. Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
                {errors.lastName && <p className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-tighter ml-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">System Email</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-600 group-focus-within/input:text-purple-400 transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-gray-700"
                  placeholder="name@rugezi.rw"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-tighter ml-1">{errors.email}</p>}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">Contact Phone (Optional)</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <div className="w-4 h-4 text-gray-600 font-bold text-[10px] flex items-center justify-center">+</div>
                </div>
                <input
                  name="phone"
                  type="tel"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-gray-700"
                  placeholder="e.g. +250..."
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Role & Access Key Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
               {/* Custom Premium Role Selector */}
               <div className="relative">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1 flex justify-between">
                    Clearance Level 
                    <span className="text-[9px] text-purple-400 font-black">Authorized</span>
                  </label>
                  
                  <div className="relative group/dropdown">
                    <button 
                      type="button"
                      onClick={() => setIsRoleOpen(!isRoleOpen)}
                      className={`w-full bg-white/5 border ${isRoleOpen ? 'border-purple-500/50 shadow-[0_0_20px_rgba(139,92,246,0.1)]' : 'border-white/10'} rounded-2xl py-4 px-6 text-left flex items-center justify-between transition-all duration-300 hover:bg-white/10`}
                    >
                      <div className="flex items-center gap-3">
                         {formData.role === 'TOURIST' && <User className="w-4 h-4 text-emerald-400" />}
                         {formData.role === 'ECOLOGIST' && <Bird className="w-4 h-4 text-purple-400" />}
                         {formData.role === 'STAFF' && <Shield className="w-4 h-4 text-blue-400" />}
                         
                         <span className="text-sm font-medium text-gray-200">
                           {formData.role === 'TOURIST' ? 'Visitor / Tourist' : 
                            formData.role === 'ECOLOGIST' ? 'Scientific Ecologist' : 'Operations Staff'}
                         </span>
                      </div>
                      <div className={`transition-transform duration-300 ${isRoleOpen ? 'rotate-180' : ''}`}>
                         <ChevronDown className="w-4 h-4 text-gray-500" />
                      </div>
                    </button>

                    {isRoleOpen && (
                      <div className="absolute top-[calc(100%+10px)] left-0 w-full glass-card-premium z-50 p-2 border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        {[
                          { id: 'TOURIST', l: 'Visitor / Tourist', d: 'Eco-tourism clearance', i: User, c: 'text-emerald-400' },
                          { id: 'ECOLOGIST', l: 'Scientific Ecologist', d: 'Research & Biodiversity data', i: Bird, c: 'text-purple-400' },
                          { id: 'STAFF', l: 'Operations Staff', d: 'Marshland daily orchestration', i: Shield, c: 'text-blue-400' }
                        ].map((role) => (
                           <button
                             key={role.id}
                             type="button"
                             onClick={() => {
                               setFormData({...formData, role: role.id});
                               setIsRoleOpen(false);
                             }}
                             className={`w-full flex items-start gap-4 p-4 rounded-xl transition-all text-left group/item ${
                               formData.role === role.id ? 'bg-purple-500/10 border border-purple-500/30' : 'hover:bg-white/5 border border-transparent'
                             }`}
                           >
                             <div className={`p-2 rounded-lg bg-white/5 ${role.c}`}>
                                <role.i className="w-4 h-4" />
                             </div>
                             <div>
                                <div className="text-[11px] font-bold text-white tracking-widest uppercase mb-0.5">{role.l}</div>
                                <div className="text-[10px] text-gray-500 font-light lowercase font-italic">{role.d}</div>
                             </div>
                           </button>
                        ))}
                      </div>
                    )}
                  </div>
               </div>

               {/* Access Key */}
               <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">Access Key</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-600 group-focus-within/input:text-purple-400 transition-colors" />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-gray-700"
                      placeholder="Min 6 chars"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-tighter ml-1">{errors.password}</p>}
               </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">Confirm Access Key</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-600 group-focus-within/input:text-purple-400 transition-colors" />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-gray-700"
                  placeholder="Repeat passphrase"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-2 text-[10px] text-red-500 font-bold uppercase tracking-tighter ml-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-premium btn-premium-primary py-5 flex items-center justify-center gap-3 group/btn text-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
              ) : (
                <>
                  Generate Clearance <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>

          </form>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
             <p className="text-sm text-gray-500 font-light">
                Securely registered with the Rugezi network?{' '}
                <Link to="/login" className="font-bold text-white hover:text-purple-400 underline underline-offset-4 transition-all">
                   System Portal Access
                </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
