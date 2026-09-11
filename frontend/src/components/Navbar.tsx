import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SupportedLanguage } from '../i18n/translations';
import { 
  ShieldCheck, Search, Lock, Languages, UserCheck, Scale, 
  ShieldAlert, Menu, X, Globe2, FolderLock, Landmark, 
  LogIn, LogOut, User as UserIcon, ChevronDown, Calculator, Database,
  Sparkles, Compass, FileCheck, Layers, Grid, ArrowRight, ExternalLink, BadgeCheck, FileText
} from 'lucide-react';

interface NavbarProps {
  lang?: string;
  setLang?: (l: any) => void;
  userRole?: string;
  setUserRole?: (role: string) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const location = useLocation();
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { user, isAuthenticated, isOfficial, isAdmin, logout } = useAuth();
  const { lang, setLang, t, currentLangInfo, languages } = useLanguage();
  const isEn = lang === 'en';

  const toggleMenuDrawer = () => setMenuDrawerOpen(!menuDrawerOpen);
  const closeMenuDrawer = () => setMenuDrawerOpen(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
        {/* Top Govt Bar */}
        <div className="bg-slate-950 px-4 py-1 text-xs border-b border-slate-800 text-slate-400 flex justify-between items-center">
          <div className="flex items-center space-x-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="truncate">
              {t('national_layer', 'Digital India Land Records Modernization Programme (DILRMP) • 28 States & 8 UTs National Layer')}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 shrink-0">
            {/* 11 Indian Languages Dropdown Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center space-x-1.5 hover:text-sky-400 transition-colors text-slate-200 font-semibold bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded-lg text-xs cursor-pointer"
                title="Change Language across 11 Indian Languages"
              >
                <span>{currentLangInfo.flag}</span>
                <span>{currentLangInfo.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 py-1.5 divide-y divide-slate-800 max-h-80 overflow-y-auto"
                  onMouseLeave={() => setLangDropdownOpen(false)}
                >
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Select Regional Language (11)
                  </div>
                  <div className="py-1">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code as SupportedLanguage);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                          lang === l.code ? 'bg-sky-950/80 text-sky-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{l.flag}</span>
                          <span>{l.nativeName} ({l.name})</span>
                        </div>
                        {lang === l.code && <span className="text-sky-400">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Auth Status */}
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 px-2.5 py-0.5 rounded-lg border border-slate-800 text-slate-300">
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40'}
                  alt={user.full_name}
                  className="w-4 h-4 rounded-full object-cover"
                />
                <span className="text-[11px] font-bold text-white max-w-[120px] truncate">{user.full_name}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                  isAdmin ? 'bg-purple-950 text-purple-300 border border-purple-800' : isOfficial ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-sky-950 text-sky-400 border border-sky-800'
                }`}>
                  {isAdmin ? 'Admin' : isOfficial ? 'Official' : 'Citizen'}
                </span>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-rose-400 ml-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center space-x-1 text-sky-400 hover:text-sky-300 font-semibold"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isEn ? "Sign In / Register" : "लॉग इन / रजिस्टर"}</span>
              </Link>
            )}
          </div>
        </div>

        {/* Main Clean Navbar Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Top Left: Menu Button & Platform Logo */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* 🌟 Dedicated Top-Left Menu Trigger Button */}
            <button
              onClick={toggleMenuDrawer}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border cursor-pointer ${
                menuDrawerOpen
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500 shadow-lg shadow-sky-500/20'
                  : 'bg-slate-800/90 text-slate-100 border-slate-700 hover:bg-slate-750 hover:border-sky-500 shadow-sm'
              }`}
              title="Open All Features & Services Menu"
            >
              {menuDrawerOpen ? (
                <X className="w-4 h-4 text-rose-400" />
              ) : (
                <Menu className="w-4 h-4 text-sky-400" />
              )}
              <span className="font-extrabold tracking-wide">{isEn ? "Menu" : "मेनू"}</span>
              <span className="bg-sky-500/30 text-sky-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                11+
              </span>
            </button>

            {/* Platform Logo & Pan-India Badge (Cleaned - without redundant subtitle) */}
            <Link to="/" onClick={closeMenuDrawer} className="flex items-center space-x-2.5 group">
              <div className="p-2 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">BhoomiShield</span>
                <span className="text-[10px] uppercase font-bold bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/30 flex items-center space-x-1">
                  <Globe2 className="w-2.5 h-2.5" />
                  <span>Pan-India V3.0</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Right Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Quick Land Search Link */}
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all hidden md:flex items-center space-x-1.5 ${
                location.pathname === '/' || location.pathname === '/search'
                  ? 'bg-sky-600/30 text-sky-300 border border-sky-500/50'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-sky-400" />
              <span>{isEn ? "Land Search" : "भूमि खोज"}</span>
            </Link>

            {/* Quick Vault Link */}
            <Link
              to="/vault"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all hidden md:flex items-center space-x-1.5 ${
                location.pathname === '/vault'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
              }`}
            >
              <FolderLock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isEn ? "My Vault" : "मेरी वॉल्ट"}</span>
            </Link>

            {/* Account / Login Pill */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-sky-600/20"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isEn ? "Sign In" : "लॉग इन"}</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
                title="Switch Persona / Accounts"
              >
                <UserIcon className="w-3.5 h-3.5 text-sky-400" />
                <span>Switch</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 🌟 MEGA MENU DRAWER & FEATURE MODAL (SLIDES FROM LEFT) */}
      {menuDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-start animate-in fade-in duration-200">
          
          {/* Backdrop Click to Close */}
          <div className="fixed inset-0" onClick={closeMenuDrawer}></div>

          {/* Slide-over Content Panel */}
          <div className="relative w-full max-w-2xl bg-slate-900 border-r border-slate-800 shadow-2xl h-full flex flex-col z-10 overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-20">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <Grid className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight">
                    BhoomiShield Feature Directory & Portals
                  </h2>
                  <p className="text-xs text-slate-400">
                    Unified Pan-India Land Governance Services across 28 States & 8 UTs
                  </p>
                </div>
              </div>

              <button
                onClick={closeMenuDrawer}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Feature Categories */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* Category 1: Land Discovery & Due Diligence */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>1. Land Discovery, GPS Cadastral & Risk Due Diligence</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Link
                    to="/"
                    onClick={closeMenuDrawer}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-sky-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Search className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-bold text-white group-hover:text-sky-300">
                          Universal Land Search
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Query parcels by State, District, Khata/Khesra, or Ground GPS pin drop.
                    </p>
                  </Link>

                  <Link
                    to="/check-buy"
                    onClick={closeMenuDrawer}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-sky-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                          Check Before You Buy
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Multi-tier due diligence scanning title defects, court stays, and mortgages.
                    </p>
                  </Link>

                  <Link
                    to="/track-mutation"
                    onClick={closeMenuDrawer}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-sky-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white group-hover:text-amber-300">
                          Live Mutation Tracker
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Track Dakhil-Kharij SLA application progress and hearing dates.
                    </p>
                  </Link>

                  <Link
                    to="/valuation"
                    onClick={closeMenuDrawer}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-sky-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calculator className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-bold text-white group-hover:text-amber-300">
                          Stamp Duty & Valuation
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Calculate government circle rates, registration fees, and duty concessions.
                    </p>
                  </Link>

                  <Link
                    to="/verify"
                    onClick={closeMenuDrawer}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-sky-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileCheck className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-bold text-white group-hover:text-sky-300">
                          Report Verification
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Verify cryptographic SHA-256 digests and QR codes of generated PDF audit reports.
                    </p>
                  </Link>

                  <Link
                    to="/overview"
                    onClick={closeMenuDrawer}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-sky-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Globe2 className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                          National Portal Overview
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Explore platform vision, architecture, and multi-state DILRMP integration metrics.
                    </p>
                  </Link>
                </div>
              </div>

              {/* Category 2: Citizen Rights, Locker & Grievances */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  <FolderLock className="w-4 h-4 text-indigo-400" />
                  <span>2. Citizen Bhoomi Locker & Legal Redressal</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <Link
                    to="/vault"
                    onClick={closeMenuDrawer}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <FolderLock className="w-4 h-4 text-indigo-400" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-indigo-300 block mt-2">
                      My Bhoomi Vault
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Encrypted document locker with DigiLocker sync.
                    </p>
                  </Link>

                  <Link
                    to="/legal-advisor"
                    onClick={closeMenuDrawer}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <Scale className="w-4 h-4 text-emerald-400" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-emerald-300 block mt-2">
                      AI Legal Advisor
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Instant advice on land partition & dispute laws.
                    </p>
                  </Link>

                  <Link
                    to="/complaints"
                    onClick={closeMenuDrawer}
                    className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-rose-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400" />
                    </div>
                    <span className="text-xs font-bold text-white group-hover:text-rose-300 block mt-2">
                      Grievance Portal
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Lodge complaints to SDM & District Collector.
                    </p>
                  </Link>
                </div>
              </div>

              {/* Category 3: Authorized Government & Administrative Portals (Security Gate Protected) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span>3. Authorized Portals & Governance (Security Gate Protected)</span>
                  </div>
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.2 rounded-full font-mono uppercase font-bold">
                    Credentials Required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Revenue Official Workspace */}
                  <Link
                    to="/official"
                    onClick={closeMenuDrawer}
                    className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Landmark className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300">
                          Revenue Officer Workspace
                        </span>
                      </div>
                      <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700 uppercase">
                        Officer Gate
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Digital DSC signature sealing, citizen deed verification, and revenue court proceedings.
                    </p>
                  </Link>

                  {/* Central Administration & SQLite Studio */}
                  <Link
                    to="/admin"
                    onClick={closeMenuDrawer}
                    className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-purple-950/40 border border-slate-700 hover:border-purple-500 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-white group-hover:text-purple-300">
                          Central DB & User Admin
                        </span>
                      </div>
                      <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-purple-900/80 text-purple-300 border border-purple-700 uppercase">
                        Admin Gate
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Inspect SQLite tables, execute SQL queries, and manage user role provisioning.
                    </p>
                  </Link>
                </div>
              </div>

              {/* Single Sign-On Account Access */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {isAuthenticated && user ? `Logged In as ${user.full_name}` : 'Multi-Role Single Sign-On Gateway'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {isAuthenticated && user ? `Active Role: ${user.role} • ${user.department || 'Bhoomi User'}` : 'Switch between Citizen, Revenue Officer, or National Admin profiles'}
                    </span>
                  </div>
                </div>

                <Link
                  to="/login"
                  onClick={closeMenuDrawer}
                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors"
                >
                  {isAuthenticated ? 'Switch' : 'Sign In'}
                </Link>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 text-center text-[10px] text-slate-500">
              BhoomiShield National Land Governance Platform • DILRMP Compliant • 28 States & 8 UTs
            </div>

          </div>
        </div>
      )}
    </>
  );
};


