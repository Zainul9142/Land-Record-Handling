import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, FileCheck, AlertTriangle, ArrowRight, CheckCircle2, Layers, Cpu, QrCode, Globe2, MapPin, Sparkles, Navigation, FolderLock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
  lang?: string;
}

export const HomePage: React.FC<HomePageProps> = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const isEn = lang === 'en';
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const stateDemos = [
    { state: 'Jharkhand', dist: 'Bokaro', sub: 'Chas', id: 'JH-BOK-CHA-KURA-K125-K450-2', label: 'Jharkhand (Bokaro / Chas)' },
    { state: 'Uttar Pradesh', dist: 'Gautam Buddha Nagar (Noida)', sub: 'Dadri', id: 'UP-GAU-DAD-BHAN-P340-PL112-1', label: 'Uttar Pradesh (Noida / Dadri)' },
    { state: 'Maharashtra', dist: 'Pune', sub: 'Haveli', id: 'MH-PUN-HAV-HINJ-G145-P23-B', label: 'Maharashtra (Pune / Hinjawadi 7/12)' },
    { state: 'Karnataka', dist: 'Bengaluru Urban', sub: 'Bengaluru South', id: 'KA-BLR-SOU-WHIT-S89-P3-A', label: 'Karnataka (Bengaluru / RTC Pahani)' },
    { state: 'Bihar', dist: 'Patna', sub: 'Danapur', id: 'BR-PAT-DAN-KHAG-K201-P56-3', label: 'Bihar (Patna / Danapur)' },
    { state: 'Delhi', dist: 'South Delhi', sub: 'Hauz Khas', id: 'DL-SOU-HAU-MEH-K56-P12-A', label: 'Delhi (Hauz Khas / Mehrauli)' }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-2xl border-b border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
            <Globe2 className="w-4 h-4 text-sky-400" />
            <span>
              {t('national_layer', 'Digital India Land Records Modernization Programme (DILRMP) • 28 States & 8 UTs National Layer')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t('hero_title', 'Digital India Land Records Modernization Programme (DILRMP)')}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('hero_subtitle', 'Instant unified access to 7/12 Extracts, Khatauni RoR, RTC Pahani, Patta Chitta, and AI mutation fraud prevention across all 28 Indian States & 8 UTs.')}
          </p>

          {/* Quick Universal Search Card */}
          <div className="max-w-2xl mx-auto bg-slate-800/90 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-slate-700 shadow-2xl">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEn ? "Search by State, District, Khata/Gata/Survey No, or Owner Name..." : "राज्य, ज़िला, खाता/गाटा/सर्वे सं., या मालिक का नाम खोजें..."}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                <span>{isEn ? "Search Pan-India" : "खोजें"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick State Presets */}
            <div className="mt-3.5 pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-300">
              <span className="text-slate-400 font-semibold flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Explore Live State Cases:</span>
              </span>
              {stateDemos.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/land/${s.id}`)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-sky-600/30 hover:border-sky-500/50 border border-slate-700 rounded-lg text-[11px] font-mono transition-colors text-sky-300 cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* State Portals Integration Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <Globe2 className="w-5 h-5 text-emerald-400" />
                <span>Multi-State Land Record Portals Integration Network</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Connected with official State Revenue Record Streams and Cadastral GIS layers across India
              </p>
            </div>
            <Link
              to="/search"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center space-x-2 shrink-0"
            >
              <span>Launch Pan-India Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <Link to="/search?state=Uttar+Pradesh" className="bg-slate-800/80 hover:bg-slate-800 hover:border-sky-500/50 p-4 rounded-xl border border-slate-700 text-center space-y-1.5 transition-all">
              <div className="font-bold text-sky-400 text-sm">UP Bhulekh</div>
              <div className="text-[11px] text-slate-400">Uttar Pradesh (Gata/Khatauni)</div>
              <div className="text-[9px] text-emerald-400 font-mono font-semibold">● Real-Time API</div>
            </Link>
            <Link to="/search?state=Maharashtra" className="bg-slate-800/80 hover:bg-slate-800 hover:border-emerald-500/50 p-4 rounded-xl border border-slate-700 text-center space-y-1.5 transition-all">
              <div className="font-bold text-emerald-400 text-sm">Mahabhulekh 7/12</div>
              <div className="text-[11px] text-slate-400">Maharashtra (Saat Bara)</div>
              <div className="text-[9px] text-emerald-400 font-mono font-semibold">● Real-Time API</div>
            </Link>
            <Link to="/search?state=Karnataka" className="bg-slate-800/80 hover:bg-slate-800 hover:border-amber-500/50 p-4 rounded-xl border border-slate-700 text-center space-y-1.5 transition-all">
              <div className="font-bold text-amber-400 text-sm">Bhoomi RTC</div>
              <div className="text-[11px] text-slate-400">Karnataka (Pahani/Survey)</div>
              <div className="text-[9px] text-emerald-400 font-mono font-semibold">● Real-Time API</div>
            </Link>
            <Link to="/search?state=Jharkhand" className="bg-slate-800/80 hover:bg-slate-800 hover:border-indigo-500/50 p-4 rounded-xl border border-slate-700 text-center space-y-1.5 transition-all">
              <div className="font-bold text-indigo-400 text-sm">Jharbhoomi</div>
              <div className="text-[11px] text-slate-400">Jharkhand (Khata/Khesra)</div>
              <div className="text-[9px] text-emerald-400 font-mono font-semibold">● Real-Time API</div>
            </Link>
            <Link to="/search?state=Bihar" className="bg-slate-800/80 hover:bg-slate-800 hover:border-rose-500/50 p-4 rounded-xl border border-slate-700 text-center space-y-1.5 transition-all">
              <div className="font-bold text-rose-400 text-sm">BiharBhumi</div>
              <div className="text-[11px] text-slate-400">Bihar (DCLR/Jamabandi)</div>
              <div className="text-[9px] text-emerald-400 font-mono font-semibold">● Real-Time API</div>
            </Link>
            <Link to="/search?state=Tamil+Nadu" className="bg-slate-800/80 hover:bg-slate-800 hover:border-teal-500/50 p-4 rounded-xl border border-slate-700 text-center space-y-1.5 transition-all">
              <div className="font-bold text-teal-400 text-sm">Patta Chitta</div>
              <div className="text-[11px] text-slate-400">Tamil Nadu (e-Services)</div>
              <div className="text-[9px] text-emerald-400 font-mono font-semibold">● Real-Time API</div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
