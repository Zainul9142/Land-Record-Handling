import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, FileCheck, AlertTriangle, ArrowRight, CheckCircle2, Layers, Cpu, QrCode } from 'lucide-react';

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

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-2xl border-b border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>{isEn ? "SIH 2026 / Jharkhand Revenue & Land Reforms Innovation Layer" : "एसआईएच 2026 / झारखंड राजस्व नवाचार परत"}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {isEn ? (
              <>
                Verify Land Records. <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">Detect Risk.</span> Protect Ownership.
              </>
            ) : (
              <>
                भूमि रिकॉर्ड सत्यापित करें। <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">जोखिम पहचानें।</span> स्वामित्व सुरक्षित करें।
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {isEn
              ? "BhoomiShield sits as an intelligent verification layer above Jharbhoomi, JharBhuNaksha, and Registration services — creating a unified Land Identity, cross-record risk scoring, explainable evidence analysis, and QR-verifiable land reports."
              : "भूमिशील्ड झारभूमि, झारभूनक्शा और निबंधन सेवाओं के ऊपर एक बुद्धिमान सत्यापन परत के रूप में काम करता है — एकीकृत भूमि पहचान, क्रॉस-रिकॉर्ड जोखिम विश्लेषण और क्यूआर सत्यापन योग्य रिपोर्ट प्रदान करता है।"}
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
                  placeholder={isEn ? "Enter Khata No, Khesra No, Owner Name, or Land Identity ID..." : "खाता सं., खेसरा सं., मालिक का नाम दर्ज करें..."}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2 shrink-0"
              >
                <span>{isEn ? "Search Land" : "भूमि खोजें"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
              <span>{isEn ? "Try Demo Parcel:" : "नमूना देखें:"}</span>
              <button
                onClick={() => navigate('/land/JH-BOK-CHA-KURA-K125-K450-2')}
                className="font-mono text-sky-400 hover:underline flex items-center space-x-1"
              >
                <span>JH-BOK-CHA-KURA-K125-K450-2 (Bokaro Demo Case)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Story Quick Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 p-6 rounded-2xl border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>{isEn ? "3-Minute Prototype Demo Scenario" : "3-मिनट का लाइव डेमो"}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEn ? "Citizen Land Purchase Case Study — Chas, Bokaro" : "बोकारो चास - नागरिक भूमि खरीद केस स्टडी"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
              {isEn
                ? "Simulate a citizen verifying Khata #125, Khesra #450/2 in Bokaro. Experience instant Land Identity creation, owner mismatch detection (R001), active mutation analysis, grounded AI Q&A, and PDF generation with QR verification."
                : "बोकारो में खाता #125, खेसरा #450/2 का सत्यापन करें। नाम बेमेल (R001), म्यूटेशन विश्लेषण, एआई प्रश्नोत्तर और क्यूआर कोड रिपोर्ट का अनुभव करें।"}
            </p>
          </div>

          <Link
            to="/land/JH-BOK-CHA-KURA-K125-K450-2"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-colors flex items-center space-x-2 shrink-0"
          >
            <span>{isEn ? "Launch Demo Story" : "डेमो शुरू करें"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Core Platform Innovation Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEn ? "Why BhoomiShield for Jharkhand?" : "झारखंड के लिए भूमिशील्ड क्यों?"}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {isEn ? "Transforming fragmented record queries into one unified, explainable land intelligence layer." : "विखंडित रिकॉर्ड प्रश्नों को एकीकृत भूमि विश्लेषण में बदलना।"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Unified Land Identity</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Assigns a standardized canonical ID (`JH-BOK-CHS-MAU-K125-K450-2`) linking Khatian, Register-II, Mutation, Deeds, and Cadastral maps.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Deterministic Risk Engine</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Rules R001–R007 instantly flag owner mismatches, area variance, overdue mutations, unmutated deeds, and revenue court disputes with 0–100 scoring.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Grounded AI Explainer</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Explains complex legal record findings in simple language with 100% evidence citations back to verified digitized records.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">QR Report Verification</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generates downloadable Land Verification Reports with embedded QR code pointing to a public anti-tamper verification URL (`/verify/BS-2026-XXXX`).
            </p>
          </div>
        </div>
      </section>

      {/* Target Personas Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-slate-900 rounded-3xl p-8 text-white border border-slate-800 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Built for Jharkhand Ecosystem Stakeholders</h2>
            <p className="text-xs text-slate-400">Serving Citizens, Buyers, Financial Institutions, and Revenue Officers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700 space-y-2">
              <div className="font-bold text-sky-400 text-sm">Citizen & Land Owner</div>
              <p className="text-slate-300 leading-relaxed">
                Lookup land records, track pending mutation SLA progress, understand ownership consistency, and download a verifiable report before any deal.
              </p>
            </div>

            <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700 space-y-2">
              <div className="font-bold text-amber-400 text-sm">Prospective Buyer & Bank</div>
              <p className="text-slate-300 leading-relaxed">
                Run "Check Before You Buy" risk analysis to spot unmutated deeds, active bank mortgages, area discrepancies, and court stay orders.
              </p>
            </div>

            <div className="bg-slate-800/70 p-5 rounded-2xl border border-slate-700 space-y-2">
              <div className="font-bold text-emerald-400 text-sm">Revenue Officers (CO / LRDC)</div>
              <p className="text-slate-300 leading-relaxed">
                Monitor circle-wide risk distribution, investigate flagged cases with side-by-side evidence, submit decisions, and maintain audit logs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
