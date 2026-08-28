import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Search, Lock, Languages, UserCheck, Scale, ShieldAlert, Menu, X } from 'lucide-react';

interface NavbarProps {
  lang: 'en' | 'hi';
  setLang: (l: 'en' | 'hi') => void;
  userRole: string;
  setUserRole: (role: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, setLang, userRole, setUserRole }) => {
  const location = useLocation();
  const isEn = lang === 'en';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Govt Bar */}
      <div className="bg-slate-950 px-4 py-1 text-xs border-b border-slate-800 text-slate-400 flex justify-between items-center">
        <div className="flex items-center space-x-2 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span className="truncate">{isEn ? "Government of Jharkhand • Revenue & Land Reforms Dept Layer" : "झारखंड सरकार • राजस्व एवं भूमि सुधार विभाग"}</span>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setLang(isEn ? 'hi' : 'en')}
            className="flex items-center space-x-1 hover:text-sky-400 transition-colors text-slate-300 font-medium"
          >
            <Languages className="w-3.5 h-3.5 text-sky-400" />
            <span>{isEn ? "हिंदी (Hindi)" : "English"}</span>
          </button>

          <div className="hidden sm:flex items-center space-x-1 text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="CITIZEN">Citizen / Buyer</option>
              <option value="REVENUE_OFFICER">Circle Officer (CO Chas)</option>
              <option value="REVIEW_OFFICER">LRDC Review Officer</option>
              <option value="BANK_USER">Bank Institution User</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>
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
              <span className="text-[10px] uppercase font-bold bg-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/30">
                {isEn ? "Jharkhand V2.0" : "झारखंड V2.0"}
              </span>
            </div>
            <span className="text-xs text-slate-400 block -mt-0.5">
              {isEn ? "Real-time Land Record & Legal AI Intelligence" : "रियल-टाइम भूमि रिकॉर्ड एवं एआई कानूनी सलाहकार"}
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
            <span>{isEn ? "File Complaint" : "शिकायत दर्ज करें"}</span>
          </Link>

          <Link
            to="/check-buy"
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 ${
              location.pathname === '/check-buy' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{isEn ? "Check Before Buy" : "खरीदने से पहले जांचें"}</span>
          </Link>

          {(userRole === 'REVENUE_OFFICER' || userRole === 'REVIEW_OFFICER' || userRole === 'ADMIN') && (
            <Link
              to="/admin"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-500/40`}
            >
              <Lock className="w-4 h-4 text-emerald-300" />
              <span>{isEn ? "Official Dashboard" : "अधिकारी डैशबोर्ड"}</span>
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
            <span className="font-semibold text-slate-400">User Role:</span>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
            >
              <option value="CITIZEN">Citizen / Buyer</option>
              <option value="REVENUE_OFFICER">Circle Officer (CO Chas)</option>
              <option value="REVIEW_OFFICER">LRDC Review Officer</option>
              <option value="BANK_USER">Bank Institution User</option>
              <option value="ADMIN">System Administrator</option>
            </select>
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
            to="/check-buy"
            onClick={closeMobileMenu}
            className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 ${
              location.pathname === '/check-buy' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{isEn ? "Check Before Buy" : "खरीदने से पहले जांचें"}</span>
          </Link>

          {(userRole === 'REVENUE_OFFICER' || userRole === 'REVIEW_OFFICER' || userRole === 'ADMIN') && (
            <Link
              to="/admin"
              onClick={closeMobileMenu}
              className={`block px-3 py-2.5 rounded-xl text-sm font-medium bg-emerald-800 text-white flex items-center space-x-2`}
            >
              <Lock className="w-4 h-4 text-emerald-300" />
              <span>{isEn ? "Official Review Dashboard" : "अधिकारी डैशबोर्ड"}</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
