import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, FileCheck, AlertTriangle, ArrowRight, CheckCircle2, Layers, Cpu, QrCode, Sparkles, Box, Scale, Globe, Building2, ExternalLink } from 'lucide-react';

interface HomePageProps {
  lang: 'en' | 'hi';
}

export const HomePage: React.FC<HomePageProps> = ({ lang }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const isEn = lang === 'en';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleStateChipClick = (queryStr: string) => {
    navigate(`/search?q=${encodeURIComponent(queryStr)}`);
  };

  return (
    <div className="space-y-12 pb-16 transition-colors duration-300">
      {/* Hero Section — DILRMP Pan-India National Layer */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-2xl border-b border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold animate-pulse">
            <Globe className="w-4 h-4 text-sky-400" />
            <span>Digital India Land Records Modernization Programme (DILRMP) • 28 States & 8 UTs National Layer</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight animate-slide-up">
            Digital India Land Records Modernization Programme (DILRMP)
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Instant unified access to 7/12 Extracts, Khatauni RoR, RTC Pahani, Patta Chitta, and AI mutation fraud prevention across all 28 Indian States & 8 UTs.
          </p>

          <div className="max-w-3xl mx-auto bg-slate-800/90 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-700 shadow-2xl space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by State, District, Khata/Gata/Survey No, or Owner Name..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 shrink-0 hover:scale-105"
              >
                <span>Search Pan-India</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 border-t border-slate-700/60 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold text-[11px] flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Explore Live State Cases:</span>
              </span>

              <button
                onClick={() => handleStateChipClick('Jharkhand Bokaro Chas')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 font-mono text-[11px] transition-colors"
              >
                Jharkhand (Bokaro / Chas)
              </button>

              <button
                onClick={() => handleStateChipClick('Uttar Pradesh Noida Dadri')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 font-mono text-[11px] transition-colors"
              >
                Uttar Pradesh (Noida / Dadri)
              </button>

              <button
                onClick={() => handleStateChipClick('Maharashtra Pune 7/12')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 font-mono text-[11px] transition-colors"
              >
                Maharashtra (Pune / Hinjawadi 7/12)
              </button>

              <button
                onClick={() => handleStateChipClick('Karnataka Bengaluru RTC Pahani')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 font-mono text-[11px] transition-colors"
              >
                Karnataka (Bengaluru / RTC Pahani)
              </button>

              <button
                onClick={() => handleStateChipClick('Bihar Patna Danapur')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 font-mono text-[11px] transition-colors"
              >
                Bihar (Patna / Danapur)
              </button>

              <button
                onClick={() => handleStateChipClick('Delhi Hauz Khas Mehrauli')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 font-mono text-[11px] transition-colors"
              >
                Delhi (Hauz Khas / Mehrauli)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Story Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 dark:to-slate-900 p-6 rounded-2xl border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md hover:shadow-lg transition-all">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>3-Minute Prototype Demo Scenario</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Citizen Land Purchase Case Study — Chas, Bokaro
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Simulate a citizen verifying Khata #125, Khesra #450/2 in Bokaro. Experience instant Land Identity creation, owner mismatch detection (R001), active mutation analysis, 3D terrain polygon view, AI legal guidance, and PDF generation with QR verification.
            </p>
          </div>

          <Link
            to="/land/JH-BOK-CHA-KURA-K125-K450-2"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-2 shrink-0 hover:scale-105"
          >
            <span>Launch Demo Story</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Core Innovation Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Multi-State Land Record Portals Integration Network
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Connecting state revenue portals across India into one explainable risk intelligence layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Unified Land Identity</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Assigns a standardized canonical ID (`JH-BOK-CHS-MAU-K125-K450-2`) linking Khatian, Register-II, Mutation, Deeds, and Cadastral maps.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Deterministic Risk Engine</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Rules R001–R007 instantly flag owner mismatches, area variance, overdue mutations, unmutated deeds, and revenue court disputes with 0–100 scoring.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Grounded AI Legal Advisor</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Explains statutory land remedies under CNT Act 1908 (Section 46/71A), SPT Act 1949 (Section 20), Mutation Rules 2011, and Registration Act 1908.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Interactive 3D GIS Viewer</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Extrudes official JharBhuNaksha GeoJSON plot polygon boundaries into 3D WebGL land parcels with 360° terrain elevation controls.
            </p>
          </div>
        </div>
      </section>

      {/* Target Personas Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 transition-colors">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Built for Pan-India Ecosystem Stakeholders</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Serving Citizens, Buyers, Financial Institutions, and Revenue Officers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="font-bold text-sky-600 dark:text-sky-400 text-sm">Citizen & Land Owner</div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Lookup land records, track pending mutation SLA progress, understand ownership consistency, and download a verifiable report before any deal.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="font-bold text-amber-600 dark:text-amber-400 text-sm">Prospective Buyer & Bank</div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Run "Check Before You Buy" risk analysis to spot unmutated deeds, active bank mortgages, area discrepancies, and court stay orders.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Revenue Officers (CO / LRDC)</div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Monitor circle-wide risk distribution, investigate flagged cases with side-by-side evidence, submit decisions, and maintain audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
