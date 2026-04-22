import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Leaf, ArrowRight, Shield, Globe, Users, 
  BarChart3, Camera, Activity, CheckCircle2
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0D0E14] text-white font-sans overflow-x-hidden selection:bg-purple-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex justify-between items-center px-8 py-8 max-w-7xl mx-auto backdrop-blur-md sticky top-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl shadow-lg shadow-purple-500/20">
            <Leaf className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tighter text-glow">Marshland</span>
        </div>
        <div className="flex items-center gap-8">
           <a href="#features" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Ecosystem</a>
           <a href="#impact" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Impact</a>
           {user ? (
             <Link to="/dashboard" className="btn-premium btn-premium-primary text-xs !py-2 !px-6">Open Dashboard</Link>
           ) : (
             <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold hover:text-purple-400 transition-colors">Sign In</Link>
                <Link to="/register" className="btn-premium btn-premium-primary text-xs !py-2 !px-6">Get Clearance</Link>
             </div>
           )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
          <Activity className="w-3 h-3 animate-pulse" /> Live Monitoring Active
        </div>
        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter group animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Digital Heart of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400">Rugezi Marshland</span>
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-gray-400 font-light italic leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          The ultimate management console for Rwanda's precious wetland. <br className="hidden md:block" />
          Predictive analytics, species inventory, and tourism orchestration.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
           <Link to="/register" className="btn-premium btn-premium-primary !py-5 !px-12 text-sm flex items-center gap-3 group">
              Start Manifest <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </Link>
           <button className="btn-premium btn-premium-secondary !py-5 !px-12 text-sm flex items-center gap-3">
              Explore Wiki <Globe className="w-4 h-4" />
           </button>
        </div>
      </section>

      

      {/* The Marshland Chronicle */}
      <section id="impact" className="relative z-10 px-8 py-32 max-w-7xl mx-auto border-y border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-4 sticky top-40 h-fit">
            <h2 className="text-4xl font-black tracking-tighter uppercase leading-none mb-8">
              The Marshland <br />
              <span className="text-emerald-500 italic font-light">Chronicle</span>
            </h2>
            <div className="flex flex-col gap-4 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
               <a href="#geography" className="hover:text-white transition-colors flex items-center gap-2 group"><div className="w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div> Geography</a>
               <a href="#hydrology" className="hover:text-white transition-colors flex items-center gap-2 group"><div className="w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div> Hydrology</a>
               <a href="#flora" className="hover:text-white transition-colors flex items-center gap-2 group"><div className="w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div> Flora & Fauna</a>
            </div>
          </div>
          
          <div className="lg:col-span-8 space-y-32">
            <div id="geography" className="space-y-8 group">
               <span className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em]">Section 01 // Geography</span>
               <h3 className="text-5xl font-black tracking-tight text-glow">The High Altitude Peat Bog</h3>
               <p className="text-xl text-gray-400 font-light leading-relaxed">
                 The Rugezi Marsh (also known as Ruhengeri Marsh) is a protected area in Rwanda, covering 6,735 hectares (16,640 acres). 
                 The wetland is one of the primary <span className="text-white font-medium">headwaters of the Nile</span>, situated in the Northern Province 
                 within the Buberuka Highlands. At 2,100 metres (6,900 ft), the marsh is a rare high-altitude peat bog.
               </p>
               <div className="glass-card-premium p-8 border-emerald-500/10">
                 <p className="text-sm text-gray-500 leading-relaxed italic">
                   "Rugezi developed from an accumulation of organic materials within a quartzite rock-trapping water depression. 
                   In its natural state, it plays a significant ecological, hydrological, socio-economical, and historical role in Rwanda."
                 </p>
               </div>
            </div>

            <div id="hydrology" className="space-y-8 group">
               <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">Section 02 // Hydrology</span>
               <h3 className="text-5xl font-black tracking-tight text-glow">Earth's Kidneys</h3>
               <p className="text-xl text-gray-400 font-light leading-relaxed">
                 Commonly referred to as the <span className="text-white font-medium">"Earth Kidneys"</span>, the marsh functions as a regulating basin. 
                 It moderates inflows and outflows, filtering water resources that flow into the downstream lakes of Bulera and Ruhondo.
               </p>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                     <div className="text-3xl font-black mb-1">1,200mm</div>
                     <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Avg. Annual Rainfall</div>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                     <div className="text-3xl font-black mb-1">6,735ha</div>
                     <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Protected Surface Area</div>
                  </div>
               </div>
            </div>

            <div id="flora" className="space-y-8 group">
               <span className="text-purple-500 text-[10px] font-black uppercase tracking-[0.4em]">Section 03 // Biodiversity</span>
               <h3 className="text-5xl font-black tracking-tight text-glow">Avifauna & Papyrus</h3>
               <p className="text-xl text-gray-400 font-light leading-relaxed">
                 Recognized as an Important Bird Area (IBA) by BirdLife International, Rugezi is home to 43 species of resident birds. 
                 The cohabitation of <span className="italic font-medium text-purple-400 underline decoration-purple-500/30 underline-offset-4">Bradypterus graueri</span> 
                 and <span className="italic font-medium text-pink-400 underline decoration-pink-500/30 underline-offset-4">Bradypterus carpalis</span> is uniquely unusual.
               </p>
               <div className="space-y-4">
                  {[
                    'Grey Crowned Crane (Balearica regulorum) — Endangered',
                    'Papyrus Gonolek (Laniarius mufumbiri) — Near Threatened',
                    'Grauer\'s Swamp-Warbler (Bradypterus graueri) — Endangered',
                    'Papyrus Yellow Warbler (Calamonastides gracilirostris) — Vulnerable'
                  ].map((species, i) => (
                    <div key={i} className="flex items-center gap-4 group/item cursor-default">
                       <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover/item:scale-125 transition-transform" />
                       <span className="text-sm font-medium text-gray-400 group-hover/item:text-white transition-colors">{species}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section id="features" className="relative z-10 px-8 py-32 max-w-7xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { t: 'Species Inventory', d: 'Global database of 250+ rare avian and flora species monitored in real-time.', i: Shield, c: 'text-purple-400' },
              { t: 'Smart Bookings', d: 'Automated reservation flow with synchronized staff manifests and check-in logs.', i: BarChart3, c: 'text-blue-400' },
              { t: 'Global Access', d: 'Multi-role portals for Tourists, Ecologists, and Admin Staff under one identity.', i: Users, c: 'text-emerald-400' }
            ].map((f, i) => (
              <div key={i} className="group cursor-default">
                 <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-white/10 transition-colors">
                    <f.i className={`w-6 h-6 ${f.c}`} />
                 </div>
                 <h4 className="text-xl font-bold mb-4 tracking-tight">{f.t}</h4>
                 <p className="text-gray-500 font-light leading-relaxed">{f.d}</p>
                 <div className="h-px bg-gradient-to-r from-white/10 to-transparent mt-8 group-hover:from-purple-500/50 transition-all"></div>
              </div>
            ))}
         </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 px-8 border-t border-white/5">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
               <div className="bg-white/5 p-2 rounded-xl">
                  <Leaf className="w-5 h-5 text-emerald-400" />
               </div>
               <span className="font-bold tracking-tighter uppercase">Marshland Ecosystem</span>
            </div>
            <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-gray-600">
               <a href="#" className="hover:text-purple-400 transition-colors">Security</a>
               <a href="#" className="hover:text-purple-400 transition-colors">API Docs</a>
               <a href="#" className="hover:text-purple-400 transition-colors">Privacy</a>
            </div>
            <p className="text-[10px] text-gray-700 font-bold">&copy; 2026 RUGEZI MARSHLAND SYSTEM</p>
         </div>
      </footer>
    </div>
  );
};

export default Home;
