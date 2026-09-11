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
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-2xl border-b border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
            <Globe2 className="w-4 h-4 text-sky-400" />
            <span>
              {t('national_layer', 'Digital India Land Records Modernization Programme (DILRMP) • 28 States & 8 UTs National Layer')}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t('hero_title', 'Verify Land Records Across India. Detect Risk. Protect Ownership.')}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {isEn
              ? "BhoomiShield serves as the unified national verification layer integrated with UP Bhulekh, Mahabhulekh, Bhoomi Karnataka, Jharbhoomi, BiharBhumi, Delhi DLRC, AnyROR Gujarat, and Patta Chitta Tamil Nadu — delivering instant risk scoring, 3D cadastral GIS, and QR-certified land reports."
              : "भूमिशील्ड सभी राज्य भूलेख पोर्टलों (यूपी, महाराष्ट्र, कर्नाटक, झारखंड, बिहार, दिल्ली, गुजरात, तमिलनाडु) के साथ एकीकृत होकर अखिल भारतीय भूमि सत्यापन, 3डी कैडस्ट्रल नक्शा और क्यूआर कोड रिपोर्ट प्रदान करता है।"}
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
                className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 shrink-0"
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
                  className="px-2.5 py-1 bg-slate-900 hover:bg-sky-600/30 hover:border-sky-500/50 border border-slate-700 rounded-lg text-[11px] font-mono transition-colors text-sky-300"
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
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Globe2 className="w-5 h-5 text-emerald-400" />
                <span>Multi-State Land Record Portals Integration Network</span>
              </h3>
              <p className="text-xs text-slate-400">
                Connected with official State Revenue Record Streams across India
              </p>
            </div>
            <Link
              to="/search"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center space-x-1.5 shrink-0"
            >
              <span>Launch Pan-India Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700 text-center space-y-1">
              <div className="font-bold text-sky-400">UP Bhulekh</div>
              <div className="text-[10px] text-slate-400">Uttar Pradesh (Gata/Khatauni)</div>
            </div>
            <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700 text-center space-y-1">
              <div className="font-bold text-emerald-400">Mahabhulekh 7/12</div>
              <div className="text-[10px] text-slate-400">Maharashtra (Saat Bara)</div>
            </div>
            <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700 text-center space-y-1">
              <div className="font-bold text-amber-400">Bhoomi RTC</div>
              <div className="text-[10px] text-slate-400">Karnataka (Pahani/Survey)</div>
            </div>
            <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700 text-center space-y-1">
              <div className="font-bold text-indigo-400">Jharbhoomi</div>
              <div className="text-[10px] text-slate-400">Jharkhand (Khata/Khesra)</div>
            </div>
            <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700 text-center space-y-1">
              <div className="font-bold text-rose-400">BiharBhumi</div>
              <div className="text-[10px] text-slate-400">Bihar (DCLR/Jamabandi)</div>
            </div>
            <div className="bg-slate-800/70 p-3 rounded-xl border border-slate-700 text-center space-y-1">
              <div className="font-bold text-teal-400">Patta Chitta</div>
              <div className="text-[10px] text-slate-400">Tamil Nadu (e-Services)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Innovation Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEn ? "Why BhoomiShield for Pan-India Land Governance?" : "अखिल भारतीय स्तर पर भूमिशील्ड क्यों?"}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {isEn ? "Transforming fragmented state record queries into one unified, explainable national land intelligence layer." : "विखंडित राज्य रिकॉर्ड प्रश्नों को एकीकृत राष्ट्रीय भूमि विश्लेषण में बदलना।"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Standardized Land Identity</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Standard DILRMP canonical ID (`UP-NOI-DAD-BHAN-P340-PL112-1`) cross-linking RORs, 7/12, Mutation timelines, and GIS boundaries.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Deterministic Risk Engine</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Rules R001–R008 flag owner mismatches, area variances, overdue mutation SLAs, unmutated deeds, and civil/revenue stay orders.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">State-Aware AI Legal Advisor</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Provides statutory guidance grounded in UP Revenue Code, MLRC Maharashtra, Karnataka PTCL, CNT/SPT Acts, RERA, and Central property laws.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">QR Report Verification</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generates downloadable Land Verification Reports with cryptographic SHA-256 signatures and QR verification links (`/verify/BS-2026-XXXX`).
            </p>
          </div>
        </div>
      </section>

      {/* Target Personas Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-slate-900 rounded-3xl p-8 text-white border border-slate-800 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Built for Indian Land Governance Stakeholders</h2>
            <p className="text-xs text-slate-400">Serving Citizens, Buyers, Banks & NBFCs, Revenue Officers, and Legal Practitioners</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700 space-y-2">
              <div className="font-bold text-sky-400 text-sm">Citizens & Land Owners</div>
              <p className="text-slate-300 leading-relaxed">
                Lookup digitized land records across any state, track pending Dakhil-Kharij / Mutation SLA deadlines, and detect unmutated transaction discrepancies.
              </p>
            </div>

            <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700 space-y-2">
              <div className="font-bold text-amber-400 text-sm">Prospective Buyers & Financial Institutions</div>
              <p className="text-slate-300 leading-relaxed">
                Run comprehensive due-diligence before signing agreements to spot active bank mortgage hypothecations, civil court stay orders, or tribal land transfer bans.
              </p>
            </div>

            <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700 space-y-2">
              <div className="font-bold text-emerald-400 text-sm">Revenue Authorities (Tahsildars, CO, SDM, DC)</div>
              <p className="text-slate-300 leading-relaxed">
                Monitor circle-wide and district-wide risk distribution, inspect side-by-side digitized evidence, record review decisions, and maintain audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
