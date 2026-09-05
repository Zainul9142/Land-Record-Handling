import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, User, Lock, KeyRound, Building2, Landmark, 
  BadgeCheck, CheckCircle2, ArrowRight, UserCheck, AlertCircle, 
  Fingerprint, Sparkles, MapPin, Briefcase, FileText
} from 'lucide-react';

interface AuthPageProps {
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onShowToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, demoLogin, demoUsers, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<'CITIZEN' | 'OFFICIAL'>('CITIZEN');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('Revenue & Land Reforms');
  const [designation, setDesignation] = useState('Tahsildar / Circle Officer');
  const [state, setState] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('Gautam Buddha Nagar');
  const [tehsil, setTehsil] = useState('Dadri');
  const [aadhaarLast4, setAadhaarLast4] = useState('5412');
  const [panNumber, setPanNumber] = useState('ABCPS1234F');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleDemoSelect = async (demoUserId: string) => {
    setErrorMsg('');
    const success = await demoLogin(demoUserId);
    if (success) {
      const selected = demoUsers.find(u => u.user_id === demoUserId);
      if (onShowToast) {
        onShowToast('success', 'Logged in successfully', `Active persona: ${selected?.full_name} (${selected?.role})`);
      }
      if (selected?.role === 'CITIZEN') {
        navigate('/vault');
      } else {
        navigate('/official');
      }
    } else {
      setErrorMsg('Failed to login with demo account.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegisterMode) {
      if (!username || !fullName || !email || !password) {
        setErrorMsg('Please fill all mandatory fields.');
        return;
      }
      const regData = {
        username,
        password,
        full_name: fullName,
        email,
        mobile: mobile || '+91 98765 00000',
        role: activeTab === 'CITIZEN' ? 'CITIZEN' : 'REVENUE_OFFICER',
        department: activeTab === 'CITIZEN' ? 'General Public' : department,
        designation: activeTab === 'CITIZEN' ? 'Landowner & Citizen' : designation,
        employee_id: activeTab === 'CITIZEN' ? null : employeeId,
        jurisdiction_state: state,
        jurisdiction_district: district,
        jurisdiction_tehsil: tehsil,
        aadhaar_last4: aadhaarLast4,
        pan_number: panNumber
      };

      const result = await register(regData);
      if (result.success) {
        if (onShowToast) onShowToast('success', 'Registration Successful', result.message);
        navigate(activeTab === 'CITIZEN' ? '/vault' : '/official');
      } else {
        setErrorMsg(result.message);
      }
    } else {
      if (!username) {
        setErrorMsg('Please enter your username or registered email.');
        return;
      }
      const result = await login(username, password);
      if (result.success) {
        if (onShowToast) onShowToast('success', 'Welcome Back', result.message);
        navigate(activeTab === 'CITIZEN' ? '/vault' : '/official');
      } else {
        setErrorMsg(result.message);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>National DILRMP Single Sign-On Gateway</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            BhoomiShield Secure Access Portal
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Access your encrypted land document locker, track property mutation rights, or sign official revenue orders across all 28 Indian States & 8 UTs.
          </p>
        </div>

        {/* Fast One-Click Demo Personas Strip */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>⚡ One-Click Instant Demo Login (Zero Setup Required)</span>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700">
              Click any profile to test live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {demoUsers.map((demo) => {
              const isOfficer = demo.role !== 'CITIZEN';
              return (
                <button
                  key={demo.user_id}
                  onClick={() => handleDemoSelect(demo.user_id)}
                  className="flex items-center space-x-3 p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-700/80 border border-slate-700 hover:border-sky-500 transition-all text-left group"
                >
                  <img
                    src={demo.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                    alt={demo.full_name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-600 group-hover:border-sky-400"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate group-hover:text-sky-300">
                        {demo.full_name}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        isOfficer ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' : 'bg-sky-950/80 text-sky-400 border border-sky-800/50'
                      }`}>
                        {isOfficer ? 'Official' : 'Citizen'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {demo.designation || demo.role}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate flex items-center space-x-1">
                      <MapPin className="w-2.5 h-2.5 inline text-slate-400" />
                      <span>{demo.jurisdiction_district}, {demo.jurisdiction_state}</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Portal Card */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Dual Tab Switcher */}
          <div className="grid grid-cols-2 border-b border-slate-700 text-center font-semibold text-sm">
            <button
              onClick={() => { setActiveTab('CITIZEN'); setIsRegisterMode(false); setErrorMsg(''); }}
              className={`py-4 px-6 flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'CITIZEN'
                  ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-500 shadow-inner'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Citizen & Landowner Locker</span>
            </button>
            <button
              onClick={() => { setActiveTab('OFFICIAL'); setIsRegisterMode(false); setErrorMsg(''); }}
              className={`py-4 px-6 flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'OFFICIAL'
                  ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500 shadow-inner'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>Revenue Official & Authority Desk</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Tab Subtitle */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  {activeTab === 'CITIZEN' ? (
                    <>
                      <FileText className="w-5 h-5 text-sky-400" />
                      <span>Citizen Bhoomi Vault Access</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      <span>Govt. Land Revenue Officer Workspace</span>
                    </>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeTab === 'CITIZEN'
                    ? 'Store, view and cryptographically verify your land records, sale deeds & tax receipts.'
                    : 'Authorized desk for Lekhpals, Tehsildars, Sub-Registrars, and District Collectors.'}
                </p>
              </div>

              {/* Register / Sign In toggle */}
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline px-3 py-1.5 rounded-lg bg-sky-950/40 border border-sky-800/40"
              >
                {isRegisterMode ? 'Already have account? Sign In' : '+ Create New Account'}
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegisterMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar Sharma"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Mobile Number (Aadhaar linked) *
                    </label>
                    <input
                      type="text"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {activeTab === 'CITIZEN' ? 'Username or Email ID *' : 'Official Govt Email / Employee Code *'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={activeTab === 'CITIZEN' ? 'ramesh.sharma or email' : 'rajesh.verma@rev.up.gov.in'}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                      required
                    />
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>
              </div>

              {isRegisterMode && (
                <>
                  {activeTab === 'CITIZEN' ? (
                    <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-700/80 space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400">
                        <Fingerprint className="w-4 h-4 text-sky-400" />
                        <span>DigiLocker & Citizen KYC Linkage (Optional Simulation)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Aadhaar (Last 4 Digits)</label>
                          <input
                            type="text"
                            maxLength={4}
                            value={aadhaarLast4}
                            onChange={(e) => setAadhaarLast4(e.target.value)}
                            placeholder="5412"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">PAN Card Number</label>
                          <input
                            type="text"
                            value={panNumber}
                            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                            placeholder="ABCPS1234F"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-3">
                      <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                        <span>Official Revenue Authority Designation & Jurisdiction</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Employee Code</label>
                          <input
                            type="text"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            placeholder="UP-REV-8492"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Designation</label>
                          <select
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                          >
                            <option value="Tahsildar / Circle Executive">Tahsildar / Circle Executive</option>
                            <option value="Sub-Registrar (Stamps & Registration)">Sub-Registrar (Stamps & Registration)</option>
                            <option value="Sub-Divisional Magistrate (SDM/LRDC)">SDM / LRDC</option>
                            <option value="District Magistrate & Collector">District Magistrate & Collector</option>
                            <option value="Revenue Inspector / Lekhpal">Revenue Inspector / Lekhpal</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Jurisdiction State</label>
                          <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                          >
                            <option value="Uttar Pradesh">Uttar Pradesh</option>
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Jharkhand">Jharkhand</option>
                            <option value="Delhi">Delhi</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
                  activeTab === 'CITIZEN'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-sky-600/20'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20'
                }`}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{isRegisterMode ? 'Complete Registration & Open Locker' : `Sign In to ${activeTab === 'CITIZEN' ? 'Citizen Bhoomi Vault' : 'Revenue Desk'}`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Security Footer */}
            <div className="pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>SHA-256 Tamper-Proof Document Storage Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>DILRMP Compliant</span>
                <span>•</span>
                <span>DigiLocker Integration Ready</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
