import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SupportedLanguage } from '../i18n/translations';
import { 
  ShieldCheck, Search, Lock, Languages, UserCheck, Scale, 
  ShieldAlert, Menu, X, Globe2, FolderLock, Landmark, 
  LogIn, LogOut, User as UserIcon, ChevronDown, Calculator, Database 
} from 'lucide-react';

interface NavbarProps {
  lang?: string;
  setLang?: (l: any) => void;
  userRole?: string;
  setUserRole?: (role: string) => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { user, isAuthenticated, isOfficial, logout } = useAuth();
  const { lang, setLang, t, currentLangInfo, languages } = useLanguage();
  const isEn = lang === 'en';

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md border-b border-slate-800">
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
              className="flex items-center space-x-1.5 hover:text-sky-400 transition-colors text-slate-200 font-semibold bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded-lg text-xs"
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

          {/* Quick Auth Info or Sign In */}
          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
              <img
                src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40'}
                alt={user.full_name}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="text-[11px] font-bold text-white max-w-[120px] truncate">{user.full_name}</span>
              <span className={`text-[9px] font-bold px-1 rounded uppercase ${
                isOfficial ? 'bg-emerald-950 text-emerald-400' : 'bg-sky-950 text-sky-400'
              }`}>
                {isOfficial ? 'Official' : 'Citizen'}
              </span>
              <button
                onClick={logout}
                title="Sign Out"
                className="text-slate-400 hover:text-rose-400 ml-1"
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

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-3 group">
          <div className="p-2 bg-gradient-to-tr from-sky-600 to-indigo-600 rounded-lg shadow-lg group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl tracking-tight text-white">BhoomiShield</span>
              <span className="text-[10px] uppercase font-bold bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/30 flex items-center space-x-1">
                <Globe2 className="w-2.5 h-2.5" />
                <span>{isEn ? "Pan-India National V3.0" : "अखिल भारतीय V3.0"}</span>
              </span>
            </div>
            <span className="text-xs text-slate-400 block -mt-0.5">
              {isEn ? "All India Real-time Land Records & Legal Risk AI" : "अखिल भारतीय रियल-टाइम भूमि रिकॉर्ड एवं एआई कानूनी सलाहकार"}
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/search"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              location.pathname === '/search' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>{isEn ? "Search Land" : "भूमि खोजें"}</span>
          </Link>

          {/* User Section - Bhoomi Vault */}
          <Link
            to="/vault"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              location.pathname === '/vault' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FolderLock className="w-4 h-4 text-indigo-400" />
            <span>{isEn ? "My Bhoomi Vault" : "मेरी भूमि वॉल्ट"}</span>
          </Link>

          {/* Official Workspace Link */}
          {isOfficial && (
            <Link
              to="/official"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                location.pathname === '/official' ? 'bg-emerald-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? "Official Desk" : "राजस्व डेस्क"}</span>
            </Link>
          )}

          <Link
            to="/legal-advisor"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              location.pathname === '/legal-advisor' ? 'bg-emerald-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>{isEn ? "AI Legal Advisor" : "एआई कानूनी सलाहकार"}</span>
          </Link>

          <Link
            to="/complaints"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              location.pathname === '/complaints' ? 'bg-rose-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>{isEn ? "Grievance" : "शिकायत दर्ज करें"}</span>
          </Link>

          <Link
            to="/valuation"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              location.pathname === '/valuation' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>{isEn ? "Valuation & Duty" : "मूल्यांकन व स्टाम्प"}</span>
          </Link>

          <Link
            to="/admin"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              location.pathname === '/admin' ? 'bg-purple-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-purple-400" />
            <span>{isEn ? "DB & Admin" : "डेटाबेस व एडमिन"}</span>
          </Link>

          {/* Auth Button */}
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="ml-2 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold flex items-center space-x-1.5 shadow-md shadow-sky-600/20"
            >
              <LogIn className="w-4 h-4" />
              <span>{isEn ? "Login" : "लॉग इन"}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="ml-2 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1"
              title="Switch Persona / Accounts"
            >
              <UserIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Switch</span>
            </Link>
          )}
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex items-center md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-t border-slate-800 px-4 pt-2 pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-white">{user.full_name}</span>
                <span className="text-[10px] text-sky-400 font-bold">({user.role})</span>
              </div>
            ) : (
              <Link to="/login" onClick={closeMobileMenu} className="text-sky-400 font-bold">
                Sign In to Bhoomi Vault →
              </Link>
            )}
          </div>

          <Link
            to="/search"
            onClick={closeMobileMenu}
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 ${
              location.pathname === '/search' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4 text-sky-400" />
            <span>{isEn ? "Search Land Records" : "भूमि खोजें"}</span>
          </Link>

          <Link
            to="/vault"
            onClick={closeMobileMenu}
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 ${
              location.pathname === '/vault' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <FolderLock className="w-4 h-4 text-indigo-400" />
            <span>{isEn ? "My Bhoomi Vault & Documents" : "मेरी भूमि वॉल्ट एवं दस्तावेज"}</span>
          </Link>

          {isOfficial && (
            <Link
              to="/official"
              onClick={closeMobileMenu}
              className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 ${
                location.pathname === '/official' ? 'bg-emerald-700 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Landmark className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? "Revenue Official Desk" : "राजस्व अधिकारी डेस्क"}</span>
            </Link>
          )}

          <Link
            to="/legal-advisor"
            onClick={closeMobileMenu}
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 ${
              location.pathname === '/legal-advisor' ? 'bg-emerald-700 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>{isEn ? "AI Legal Advisor" : "एआई कानूनी सलाहकार"}</span>
          </Link>

          <Link
            to="/complaints"
            onClick={closeMobileMenu}
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 ${
              location.pathname === '/complaints' ? 'bg-rose-700 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>{isEn ? "File Grievance Complaint" : "शिकायत दर्ज करें"}</span>
          </Link>

          <Link
            to="/valuation"
            onClick={closeMobileMenu}
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 ${
              location.pathname === '/valuation' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>{isEn ? "Land Valuation & Stamp Duty" : "भूमि मूल्यांकन एवं स्टाम्प शुल्क"}</span>
          </Link>

          <Link
            to="/admin"
            onClick={closeMobileMenu}
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 ${
              location.pathname === '/admin' ? 'bg-purple-700 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-purple-400" />
            <span>{isEn ? "SQLite DB & User Admin" : "डेटाबेस व यूजर एडमिन"}</span>
          </Link>

          <Link
            to="/login"
            onClick={closeMobileMenu}
            className="block px-3 py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-sky-400 flex items-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isAuthenticated ? 'Switch Account / Login' : 'Login / Register'}</span>
          </Link>
        </div>
      )}
    </header>
  );
};

