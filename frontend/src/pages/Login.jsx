import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, loading, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const result = await login(formData.email, formData.password);
    if (result.success) {
      const dashboardPath = getDashboardPath(result.user.role);
      navigate(dashboardPath);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0E14] flex items-center justify-center p-4 dashboard-bg font-sans overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-2xl shadow-xl shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-glow">Marshland</span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-gray-400 font-light italic">Access the Rugezi System portal</p>
        </div>

        {/* glass card */}
        <div className="glass-card-premium p-10 border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 ml-1">Email Identity</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-gray-600`}
                  placeholder="Enter your system email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className="mt-2 text-[10px] text-red-400 font-bold uppercase tracking-tighter ml-1">{errors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Access Key</label>
                <a href="#" className="text-[10px] font-bold text-purple-400 hover:text-pink-400 transition-colors uppercase tracking-widest">Lost Key?</a>
              </div>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-500 group-focus-within/input:text-purple-400 transition-colors" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 pl-12 pr-12 text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-gray-600`}
                  placeholder="Secret passphrase"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-[10px] text-red-400 font-bold uppercase tracking-tighter ml-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-premium btn-premium-primary py-4 flex items-center justify-center gap-2 group/btn"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
              ) : (
                <>
                  Enter System <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-gray-500">
              New to Marshland?{' '}
              <Link to="/register" className="font-bold text-white hover:text-purple-400 transition-colors underline underline-offset-4">
                Register Clearance
              </Link>
            </p>
          </div>
        </div>

        {/* Quick Access Info */}
        <div className="mt-8 flex justify-center gap-6 opacity-30 hover:opacity-100 transition-opacity">
           <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Node-2831</div>
           <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] items-center flex gap-1"><div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div> Secure Link</div>
           <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">v2.0.4 Premium</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
