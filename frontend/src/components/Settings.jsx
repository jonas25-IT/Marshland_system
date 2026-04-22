import React, { useState } from 'react';
import { 
  Palette, Globe, Shield, Database, 
  Moon, Sun, Check, RefreshCw, 
  Download, Save, Trash2, Clock, 
  Bell, Lock, Languages 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../contexts/SettingsContext';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);

  const toggleSetting = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('System preferences updated');
    }, 1000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to default?')) {
      updateSettings({
        darkMode: true,
        glassmorphism: true,
        themeColor: 'Purple',
        language: 'English',
        timeZone: 'CAT (GMT+2)',
        dateFormat: 'DD/MM/YYYY',
        twoFactor: false,
        sessionTimeout: true,
        notifications: true
      });
      toast.success('Returned to system defaults');
    }
  };

  const Switch = ({ checked, onChange }) => (
    <button 
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.4)]' : 'bg-white/10'}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-2 opacity-90">Settings</h1>
        <p className="text-gray-500 font-light italic">Configure your system preferences and security protocols</p>
      </div>

      {/* Appearance Section */}
      <section className="glass-card-premium p-8">
        <div className="flex items-center gap-3 mb-8 text-purple-400">
          <Palette className="w-5 h-5" />
          <h2 className="text-lg font-bold uppercase tracking-widest">Appearance</h2>
        </div>
        
        <div className="space-y-8">
          <div className="flex justify-between items-center group">
            <div>
              <p className="font-bold text-gray-200">Dark Mode</p>
              <p className="text-xs text-gray-500 font-light">Enable dark theme across the application</p>
            </div>
            <Switch checked={settings.darkMode} onChange={() => toggleSetting('darkMode')} />
          </div>

          <div>
            <p className="font-bold text-gray-200 mb-4">Theme Color</p>
            <select 
              value={settings.themeColor} 
              onChange={(e) => updateSettings({ themeColor: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30"
            >
              <option value="Purple" className="bg-[#0D0E14]">Purple (Marshland Default)</option>
              <option value="Emerald" className="bg-[#0D0E14]">Emerald Rainforest</option>
              <option value="Ocean" className="bg-[#0D0E14]">Deep Ocean Blue</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-200">Glassmorphism Effects</p>
              <p className="text-xs text-gray-500 font-light">Enable glass-like UI effects and blurs</p>
            </div>
            <Switch checked={settings.glassmorphism} onChange={() => toggleSetting('glassmorphism')} />
          </div>
        </div>
      </section>

      {/* System Section */}
      <section className="glass-card-premium p-8">
        <div className="flex items-center gap-3 mb-8 text-purple-400">
          <Globe className="w-5 h-5" />
          <h2 className="text-lg font-bold uppercase tracking-widest">System</h2>
        </div>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-bold text-gray-200 mb-3 ml-1 flex items-center gap-2">
               <Languages className="w-3 h-3" /> Language
            </label>
            <select 
              value={settings.language} 
              onChange={(e) => updateSettings({ language: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30"
            >
              <option value="English" className="bg-[#0D0E14]">English</option>
              <option value="Kinyarwanda" className="bg-[#0D0E14]">Kinyarwanda</option>
              <option value="French" className="bg-[#0D0E14]">French (Français)</option>
            </select>
          </div>

          <div>
            <p className="font-bold text-gray-200 mb-3 ml-1">Time Zone</p>
            <select 
              value={settings.timeZone} 
              onChange={(e) => updateSettings({ timeZone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30"
            >
              <option value="UTC (GMT+0)" className="bg-[#0D0E14]">UTC (GMT+0)</option>
              <option value="CAT (GMT+2)" className="bg-[#0D0E14]">CAT (GMT+2) - Rwanda Standard Time</option>
              <option value="EST (GMT-5)" className="bg-[#0D0E14]">EST (GMT-5)</option>
            </select>
          </div>

          <div>
            <p className="font-bold text-gray-200 mb-3 ml-1">Date Format</p>
            <select 
              value={settings.dateFormat} 
              onChange={(e) => updateSettings({ dateFormat: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/30"
            >
              <option value="MM/DD/YYYY" className="bg-[#0D0E14]">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY" className="bg-[#0D0E14]">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD" className="bg-[#0D0E14]">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section className="glass-card-premium p-8">
        <div className="flex items-center gap-3 mb-8 text-purple-400">
          <Shield className="w-5 h-5" />
          <h2 className="text-lg font-bold uppercase tracking-widest">Privacy & Security</h2>
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-200 flex items-center gap-2">Two-Factor Authentication <Lock className="w-3 h-3 text-gray-500" /></p>
              <p className="text-xs text-gray-500 font-light">Add an extra layer of security to your account</p>
            </div>
            <Switch checked={settings.twoFactor} onChange={() => toggleSetting('twoFactor')} />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-200">Session Timeout</p>
              <p className="text-xs text-gray-500 font-light">Auto logout after 30 minutes of inactivity</p>
            </div>
            <Switch checked={settings.sessionTimeout} onChange={() => toggleSetting('sessionTimeout')} />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-200">Login Notifications</p>
              <p className="text-xs text-gray-500 font-light">Get notified of new logins on unknown devices</p>
            </div>
            <Switch checked={settings.notifications} onChange={() => toggleSetting('notifications')} />
          </div>
        </div>
      </section>

      {/* Data Management Section */}
      <section className="glass-card-premium p-8">
        <div className="flex items-center gap-3 mb-8 text-purple-400">
          <Database className="w-5 h-5" />
          <h2 className="text-lg font-bold uppercase tracking-widest">Data Management</h2>
        </div>

        <div className="space-y-10">
          <div>
            <p className="font-bold text-gray-200 mb-1">Backup Data</p>
            <p className="text-xs text-gray-500 font-light mb-4">Create a comprehensive encrypted backup of all system records</p>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
               Create Backup <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div>
             <p className="font-bold text-gray-200 mb-1">Export Data</p>
             <p className="text-xs text-gray-500 font-light mb-4">Download your manifest and data in JSON or CSV format</p>
             <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                Export Data <Download className="w-3 h-3" />
             </button>
          </div>

          <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                   <Trash2 className="w-6 h-6" />
                </div>
                <div>
                   <p className="font-bold text-red-500">Delete All Data</p>
                   <p className="text-xs text-gray-500 font-light mb-4 mt-1 leading-relaxed">Permanently delete all system data, including user records, bookings, and species entries. This action is irreversible.</p>
                   <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl text-xs shadow-lg shadow-red-500/20 transition-all uppercase tracking-widest">
                      Terminate Data Sync
                   </button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 flex items-center gap-4 z-50">
        <button 
          onClick={handleReset}
          className="bg-[#0D0E14] border border-white/10 text-gray-400 hover:text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-2xl transition-all"
        >
          Reset to Defaults
        </button>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-premium btn-premium-primary py-3 px-10 flex items-center gap-3 shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>Save All Changes <Save className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;
