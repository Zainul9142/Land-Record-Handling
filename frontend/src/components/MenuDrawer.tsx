import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Globe, Search, ShieldCheck, Activity, Calculator, FileText, Briefcase, Scale, ShieldAlert, Building2, Database, UserCheck, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  setUserRole: (role: string) => void;
  onOpenAuthModal: () => void;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({ isOpen, onClose, userRole, setUserRole, onOpenAuthModal }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  if (!isOpen) return null;

  const handleLinkClick = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleAuthGateClick = () => {
    onClose();
    onOpenAuthModal();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex">
      {/* Dimmed Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Slide-Over Drawer Panel */}
      <div className="relative w-80 max-w-full bg-slate-900 text-white shadow-2xl flex flex-col h-full border-r border-slate-800 z-10 animate-slide-up">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-sky-600 rounded-lg">
              <Globe className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <span className="font-extrabold text-sm uppercase tracking-wider text-sky-400">
              FEATURES & SERVICES
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
          {/* Section 1: National Layer */}
          <div className="space-y-2">
            <h3 className="font-bold text-[11px] text-sky-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              1. NATIONAL LAYER & LAND DISCOVERY
            </h3>

            <div className="space-y-1.5">
              <button
                onClick={() => handleLinkClick('/')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between text-slate-200 hover:text-white font-medium group transition-all hover:translate-x-1"
              >
                <div className="flex items-center space-x-2.5">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>National Portal Overview</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleLinkClick('/search')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between text-slate-200 hover:text-white font-medium group transition-all hover:translate-x-1"
              >
                <div className="flex items-center space-x-2.5">
                  <Search className="w-4 h-4 text-sky-400" />
                  <span>Universal Land Search</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleLinkClick('/check-buy')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between text-slate-200 hover:text-white font-medium group transition-all hover:translate-x-1"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Check Before You Buy</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleLinkClick('/track-mutation')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between text-slate-200 hover:text-white font-medium group transition-all hover:translate-x-1"
              >
                <div className="flex items-center space-x-2.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Live Mutation Tracker</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleLinkClick('/stamp-duty')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between text-slate-200 hover:text-white font-medium group transition-all hover:translate-x-1"
              >
                <div className="flex items-center space-x-2.5">
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  <span>Stamp Duty & Valuation</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleLinkClick('/verify/BS-2026-1001')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between text-slate-200 hover:text-white font-medium group transition-all hover:translate-x-1"
              >
                <div className="flex items-center space-x-2.5">
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Report Verification</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Section 2: Citizen Locker & Legal */}
          <div className="space-y-2">
            <h3 className="font-bold text-[11px] text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-1">
              2. CITIZEN LOCKER & LEGAL REDRESSAL
            </h3>

            <div className="space-y-1.5">
              <button
                onClick={() => handleLinkClick('/vault')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between text-slate-200 hover:text-white font-medium group transition-all hover:translate-x-1"
              >
                <div className="flex items-center space-x-2.5">
                  <Briefcase className="w-4 h-4 text-sky-400" />
                  <span>My Bhoomi Vault</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleLinkClick('/legal-advisor')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between text-slate-200 hover:text-white font-medium group transition-all hover:translate-x-1"
              >
                <div className="flex items-center space-x-2.5">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>AI Legal Advisor</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleLinkClick('/complaints')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between text-slate-200 hover:text-white font-medium group transition-all hover:translate-x-1"
              >
                <div className="flex items-center space-x-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Grievance Portal</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Section 3: Protected Portals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <h3 className="font-bold text-[11px] text-amber-400 uppercase tracking-wider">
                3. AUTHORIZED PORTALS (PROTECTED)
              </h3>
              <span className="text-[9px] bg-amber-950 text-amber-400 px-1.5 py-0.2 rounded border border-amber-800">
                CREDENTIALS
              </span>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={handleAuthGateClick}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between text-slate-200 hover:text-white font-medium group transition-all hover:translate-x-1"
              >
                <div className="flex items-center space-x-2.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Revenue Officer Workspace</span>
                </div>
                <span className="text-[9px] font-bold bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                  OFFICER GATE
                </span>
              </button>

              <button
                onClick={handleAuthGateClick}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between text-slate-200 hover:text-white font-medium group transition-all hover:translate-x-1"
              >
                <div className="flex items-center space-x-2.5">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>Central DB & Admin Panel</span>
                </div>
                <span className="text-[9px] font-bold bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-800">
                  ADMIN GATE
                </span>
              </button>

              <button
                onClick={handleAuthGateClick}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-between text-slate-200 hover:text-white font-medium group transition-all hover:translate-x-1"
              >
                <div className="flex items-center space-x-2.5">
                  <UserCheck className="w-4 h-4 text-sky-400" />
                  <span>Single Sign-On Gateway</span>
                </div>
                <span className="text-[9px] font-bold bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800">
                  SIGN IN / SWITCH
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>VISUAL THEME</span>
          <span className="font-bold text-sky-400">{theme === 'dark' ? 'Dark Midnight' : 'Light Mode'}</span>
        </div>
      </div>
    </div>
  );
};
