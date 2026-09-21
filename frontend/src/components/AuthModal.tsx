import React, { useState } from 'react';
import { X, Lock, ShieldCheck, UserCheck, Key, CheckCircle2, ArrowRight, Building2, Database } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  setUserRole: (role: string) => void;
  onSuccessNavigate?: (path: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, userRole, setUserRole, onSuccessNavigate }) => {
  const [selectedRole, setSelectedRole] = useState<string>(userRole || 'REVENUE_OFFICER');
  const [username, setUsername] = useState<string>('co_chas_bokaro');
  const [password, setPassword] = useState<string>('••••••••');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRoleSelect = (role: string, defaultUser: string) => {
    setSelectedRole(role);
    setUsername(defaultUser);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setUserRole(selectedRole);
      setLoading(false);
      setSuccessMsg(`Authenticated successfully as ${selectedRole}`);
      
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
        if (selectedRole === 'REVENUE_OFFICER' || selectedRole === 'REVIEW_OFFICER' || selectedRole === 'ADMIN') {
          if (onSuccessNavigate) onSuccessNavigate('/admin');
        }
      }, 700);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 z-10 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-xl shadow">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight">Single Sign-On & Authorized Gateway</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Select role & authenticate for protected portals</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Role Options */}
        <div className="space-y-2 text-xs">
          <label className="block font-bold text-slate-700 dark:text-slate-300">Choose Workspace Access Role:</label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleRoleSelect('REVENUE_OFFICER', 'co_chas_bokaro')}
              className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                selectedRole === 'REVENUE_OFFICER'
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold">Circle Officer (CO)</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Chas Anchal, Bokaro</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('REVIEW_OFFICER', 'lrdc_bokaro')}
              className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                selectedRole === 'REVIEW_OFFICER'
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500/50'
              }`}
            >
              <Database className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold">LRDC Review Officer</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">District Appeal Bench</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('BANK_USER', 'sbi_bank_nodal')}
              className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                selectedRole === 'BANK_USER'
                  ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 font-bold shadow'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-500/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold">Bank Nodal Officer</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">CERSAI & Mortgage Charge</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('CITIZEN', 'ramesh_sharma')}
              className={`p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                selectedRole === 'CITIZEN'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500/50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold">Citizen / Buyer</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Ramesh Sharma</span>
              </div>
            </button>
          </div>
        </div>

        {/* Login Credentials Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Government ID / Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Security Token / Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            <span>{loading ? "Authenticating SSO Credentials..." : `Sign In as ${selectedRole}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
