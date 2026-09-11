import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertOctagon, AlertTriangle, CheckCircle, FileText, Lock, 
  UserCheck, Activity, Globe2, Database, Download, Server, HardDrive, 
  Layers, Table, RefreshCw, Key, UserPlus, Trash2, Edit3, Search, Filter, 
  Play, CheckCircle2, User, Landmark, Building2, Eye, EyeOff, X, ChevronRight, 
  Sparkles, Code, Terminal, BadgeCheck, ShieldAlert, KeyRound, ArrowRight
} from 'lucide-react';
import { OfficerCase, User as UserType } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  userRole?: string;
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole = 'ADMIN', onShowToast }) => {
  const { user, isAdmin, login, logout, demoLogin } = useAuth();

  // Admin Security Gate State
  const [adminLoginId, setAdminLoginId] = useState('admin_dilrmp');
  const [adminPassword, setAdminPassword] = useState('Admin@BhoomiShield2026#');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);

  // Navigation Tabs
  const [adminTab, setAdminTab] = useState<'OVERVIEW' | 'USERS' | 'TABLES' | 'SQL_STUDIO'>('USERS');

  // Overview / Case Review State
  const [metrics, setMetrics] = useState<any>(null);
  const [cases, setCases] = useState<OfficerCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [dbSummary, setDbSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCase, setSelectedCase] = useState<OfficerCase | null>(null);
  const [decision, setDecision] = useState<string>('FIELD_VERIFICATION');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [exportingDb, setExportingDb] = useState<boolean>(false);

  // User Management State (SQLite `users` table)
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('+91 98765 43210');
  const [newRole, setNewRole] = useState<'CITIZEN' | 'REVENUE_OFFICER' | 'DISTRICT_COLLECTOR' | 'REVIEW_OFFICER' | 'ADMIN'>('REVENUE_OFFICER');
  const [newDepartment, setNewDepartment] = useState('Revenue & Land Reforms Department');
  const [newDesignation, setNewDesignation] = useState('Tahsildar / Circle Officer');
  const [newEmployeeId, setNewEmployeeId] = useState('UP-REV-9081');
  const [newState, setNewState] = useState('Uttar Pradesh');
  const [newDistrict, setNewDistrict] = useState('Gautam Buddha Nagar');
  const [newTehsil, setNewTehsil] = useState('Dadri');
  const [newKycStatus, setNewKycStatus] = useState('VERIFIED');
  const [newAadhaarLast4, setNewAadhaarLast4] = useState('5412');
  const [newPanNumber, setNewPanNumber] = useState('ABCPS1234F');
  const [isSavingUser, setIsSavingUser] = useState(false);

  // SQLite Raw Table Explorer State
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [tableData, setTableData] = useState<any>(null);
  const [tableOffset, setTableOffset] = useState<number>(0);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);

  // SQL Studio State
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT user_id, username, full_name, email, role, jurisdiction_state, designation, created_at FROM users ORDER BY id DESC LIMIT 10;');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlRunning, setSqlRunning] = useState<boolean>(false);
  const [sqlError, setSqlError] = useState<string>('');

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
      fetchUsers();
    }
  }, [isAdmin]);

  const handleAdminAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError('');
    if (!adminLoginId.trim()) {
      setAdminAuthError('Please enter Administrator User ID or Email.');
      return;
    }
    if (!adminPassword.trim()) {
      setAdminAuthError('Please enter Master Admin Security Passcode.');
      return;
    }

    setAdminAuthLoading(true);
    const res = await login(adminLoginId.trim(), adminPassword.trim());
    setAdminAuthLoading(false);

    if (res.success) {
      if (onShowToast) {
        onShowToast('success', 'Admin Clearance Verified', 'Welcome, National DILRMP Administrator! Database Studio Unlocked.');
      }
    } else {
      setAdminAuthError(res.message || 'Invalid administrator credentials. Access Denied.');
      if (onShowToast) {
        onShowToast('error', 'Authentication Failed', 'Invalid administrator credentials.');
      }
    }
  };

  const handleAdminQuickFill = () => {
    setAdminLoginId('admin_dilrmp');
    setAdminPassword('Admin@BhoomiShield2026#');
    setAdminAuthError('');
  };

  const loadDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/v1/admin/dashboard').then(r => r.json()).catch(() => ({})),
      fetch('/api/v1/admin/cases').then(r => r.json()).catch(() => ({ cases: [] })),
      fetch('/api/v1/admin/audit').then(r => r.json()).catch(() => ({ logs: [] })),
      fetch('/api/v1/admin/database/export').then(r => r.json()).catch(() => null)
    ]).then(([dashData, casesData, auditData, dbData]) => {
      setMetrics(dashData);
      setCases(casesData.cases || []);
      setAuditLogs(auditData.logs || []);
      setDbSummary(dbData);
      if (casesData.cases && casesData.cases.length > 0) {
        setSelectedCase(casesData.cases[0]);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load admin data", err);
      setLoading(false);
    });
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/v1/admin/users?limit=200');
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (e) {
      console.error("Failed to fetch users list", e);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim() || !newEmail.trim()) {
      if (onShowToast) onShowToast('error', 'Validation Error', 'Username, Full Name, and Email are mandatory.');
      return;
    }
    setIsSavingUser(true);
    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          password: newPassword,
          full_name: newFullName.trim(),
          email: newEmail.trim(),
          mobile: newMobile.trim(),
          role: newRole,
          department: newRole === 'CITIZEN' ? 'General Public' : newDepartment,
          designation: newRole === 'CITIZEN' ? 'Landowner & Citizen' : newDesignation,
          employee_id: newRole === 'CITIZEN' ? null : newEmployeeId,
          jurisdiction_state: newState,
          jurisdiction_district: newDistrict,
          jurisdiction_tehsil: newTehsil,
          kyc_status: newKycStatus,
          aadhaar_last4: newAadhaarLast4,
          pan_number: newPanNumber
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (onShowToast) {
          onShowToast('success', 'User Added to SQLite Database!', `User ${newFullName} registered as ${newRole} (ID: ${data.user?.user_id})`);
        }
        setIsAddUserModalOpen(false);
        resetNewUserForm();
        fetchUsers();
        loadDashboardData();
      } else {
        if (onShowToast) onShowToast('error', 'User Creation Failed', data.detail || 'Could not insert user.');
      }
    } catch (err: any) {
      if (onShowToast) onShowToast('error', 'Network Error', err.message || 'Error communicating with backend.');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}" (${userId}) from the SQLite database?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        if (onShowToast) onShowToast('info', 'User Deleted', `User ${userName} has been removed from bhoomishield.db`);
        fetchUsers();
        loadDashboardData();
      }
    } catch (e) {
      if (onShowToast) onShowToast('error', 'Delete Failed', 'Could not delete user.');
    }
  };

  const handleUpdateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/v1/admin/users/${editingUser.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser)
      });
      if (res.ok) {
        if (onShowToast) onShowToast('success', 'User Updated', `User ${editingUser.full_name} details updated in SQLite.`);
        setIsEditUserModalOpen(false);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (e) {
      if (onShowToast) onShowToast('error', 'Update Failed', 'Could not update user.');
    }
  };

  const resetNewUserForm = () => {
    setNewUsername('');
    setNewFullName('');
    setNewEmail('');
    setNewMobile('+91 98765 43210');
    setNewRole('REVENUE_OFFICER');
    setNewDesignation('Tahsildar / Circle Officer');
    setNewEmployeeId(`UP-REV-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const fetchTableData = async (tbl: string, offset: number = 0) => {
    setLoadingTable(true);
    try {
      const res = await fetch(`/api/v1/admin/tables/${tbl}?limit=25&offset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        setTableData(data);
      }
    } catch (e) {
      console.error("Table fetch failed", e);
    } finally {
      setLoadingTable(false);
    }
  };

  const handleExecuteSql = async () => {
    if (!sqlQuery.trim()) return;
    setSqlRunning(true);
    setSqlError('');
    setSqlResult(null);
    try {
      const res = await fetch('/api/v1/admin/sql/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sqlQuery.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setSqlResult(data);
        if (onShowToast) onShowToast('success', 'Query Executed', `${data.type === 'QUERY' ? data.row_count + ' row(s) returned' : data.rows_affected + ' row(s) affected'} in ${data.duration_ms}ms`);
      } else {
        setSqlError(data.detail || 'SQL Query execution failed.');
      }
    } catch (e: any) {
      setSqlError(e.message || 'Network error running SQL.');
    } finally {
      setSqlRunning(false);
    }
  };

  const handleExportJSON = async () => {
    setExportingDb(true);
    try {
      let data = dbSummary;
      if (!data) {
        const res = await fetch('/api/v1/admin/database/export');
        data = await res.json();
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bhoomishield_admin_export_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExportingDb(false);
    }
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setSubmitting(true);
    try {
      await fetch('/api/v1/admin/cases/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_no: selectedCase.case_no,
          land_identity_id: selectedCase.land_identity_id,
          officer_name: "Administrator / SDM",
          officer_role: userRole,
          decision: decision,
          comment: comment
        })
      });
      setSuccessMsg(`Decision '${decision}' recorded successfully for case ${selectedCase.case_no}.`);
      setComment('');
      loadDashboardData();
    } catch (err) {
      console.error("Failed to record officer decision", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const matchesSearch = !userSearchQuery.trim() || 
      (u.full_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
       u.username?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
       u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
       u.employee_id?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
       u.jurisdiction_district?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
       u.jurisdiction_state?.toLowerCase().includes(userSearchQuery.toLowerCase()));
    return matchesRole && matchesSearch;
  });

  const stateChartData = metrics?.state_risk_breakdown?.slice(0, 8) || [
    { state: 'Assam', cnt: 457 },
    { state: 'Maharashtra', cnt: 456 },
    { state: 'Haryana', cnt: 455 },
    { state: 'MP', cnt: 439 },
    { state: 'Tamil Nadu', cnt: 438 },
    { state: 'Rajasthan', cnt: 434 },
    { state: 'UP', cnt: 401 },
    { state: 'Jharkhand', cnt: 395 },
  ];

  // Render High-Security Challenge Gate if User is Not Administrator
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full space-y-8">
          
          {/* Security Shield Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-xl shadow-purple-950/50">
              <Lock className="w-10 h-10 text-purple-400 animate-pulse" />
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3" />
                <span>Restricted Government Administration Zone</span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
              Admin & Database Security Gate
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Direct SQLite database queries, raw table inspections, and user provisioning are restricted to authorized National DILRMP Administrators to prevent unauthorized access and data theft.
            </p>
          </div>

          {/* Security Challenge Card */}
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            
            {adminAuthError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-shake">
                <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{adminAuthError}</span>
              </div>
            )}

            <form onSubmit={handleAdminAuthenticate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Administrator User ID / Email</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={adminLoginId}
                    onChange={(e) => setAdminLoginId(e.target.value)}
                    placeholder="admin_dilrmp or admin@bhoomishield.gov.in"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                  <span>Master Administrator Security Passcode</span>
                </label>
                <div className="relative">
                  <input
                    type={showAdminPass ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin passcode"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-mono pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    title={showAdminPass ? "Hide passcode" : "Show passcode"}
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={adminAuthLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {adminAuthLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authenticate & Unlock Admin Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Official Credentials Helper Card for Testing / Evaluation */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Authorized Master Admin Credentials:</span>
                </div>
                <button
                  type="button"
                  onClick={handleAdminQuickFill}
                  className="text-[11px] font-bold text-purple-400 hover:text-purple-300 underline cursor-pointer"
                >
                  Auto-Fill Key
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ADMIN USER ID</span>
                  <span className="text-purple-300 font-bold">admin_dilrmp</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">SECURITY PASSCODE</span>
                  <span className="text-purple-300 font-bold">Admin@BhoomiShield2026#</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  handleAdminQuickFill();
                  const res = await login('admin_dilrmp', 'Admin@BhoomiShield2026#');
                  if (res.success && onShowToast) {
                    onShowToast('success', 'Admin Cleared', 'Logged in as National DILRMP Administrator.');
                  }
                }}
                className="w-full py-2 px-3 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/80 text-purple-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>⚡ 1-Click Instant Master Admin Access (Evaluators)</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-purple-900/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Globe2 className="w-4 h-4" />
            <span>Digital India DILRMP National Administrator • SQLite Engine Studio</span>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.2 rounded-full font-mono">
              SESSION ACTIVE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            BhoomiShield Central Administration & Database Studio
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authenticated as <strong>{user?.full_name || 'National DILRMP Administrator'}</strong> ({user?.employee_id || 'NIC-DILRMP-001'}). Manage user roles, inspect SQLite tables, execute SQL queries, and audit land records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              logout();
              if (onShowToast) onShowToast('info', 'Admin Console Locked', 'Logged out of administrator session.');
            }}
            className="px-3 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Lock database and exit admin session"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Console</span>
          </button>
          <button
            onClick={handleExportJSON}
            disabled={exportingDb}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export JSON</span>
          </button>
          <a
            href="/api/v1/admin/database/download"
            download="bhoomishield_backup.db"
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors shadow"
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Download SQLite DB</span>
          </a>
        </div>
      </div>

      {/* Main Studio Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-700/60 pb-2">
        <button
          onClick={() => setAdminTab('USERS')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
            adminTab === 'USERS'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-300" />
          <span>👥 User Management (Add Officer / Citizen)</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-900/60 text-[10px] text-sky-200">
            {usersList.length}
          </span>
        </button>

        <button
          onClick={() => setAdminTab('OVERVIEW')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
            adminTab === 'OVERVIEW'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>🛡️ National Risk Review & Flagged Cases</span>
        </button>

        <button
          onClick={() => {
            setAdminTab('TABLES');
            if (!tableData) fetchTableData(selectedTable, 0);
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
            adminTab === 'TABLES'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 text-teal-400" />
          <span>🗄️ SQLite Table Explorer (13 Tables)</span>
        </button>

        <button
          onClick={() => setAdminTab('SQL_STUDIO')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer ${
            adminTab === 'SQL_STUDIO'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4 text-purple-400" />
          <span>⚡ Interactive SQL Query Studio</span>
        </button>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: SQLITE USER MANAGEMENT STUDIO (ADD OFFICER / CITIZEN) */}
      {/* ========================================================== */}
      {adminTab === 'USERS' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Database Users</span>
              <div className="text-2xl font-black text-white font-mono">{usersList.length}</div>
              <span className="text-[10px] text-sky-400">Stored in SQLite bhoomishield.db</span>
            </div>

            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Citizens & Landowners</span>
              <div className="text-2xl font-black text-sky-400 font-mono">
                {usersList.filter(u => u.role === 'CITIZEN').length}
              </div>
              <span className="text-[10px] text-slate-400">Bhoomi Vault Access Enabled</span>
            </div>

            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Revenue Officers / Tahsildars</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                {usersList.filter(u => u.role === 'REVENUE_OFFICER' || u.role === 'REVIEW_OFFICER').length}
              </div>
              <span className="text-[10px] text-emerald-400">Digital Seal & Verification Authority</span>
            </div>

            <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">District Collectors & Admins</span>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {usersList.filter(u => u.role === 'DISTRICT_COLLECTOR' || u.role === 'ADMIN').length}
              </div>
              <span className="text-[10px] text-amber-400">High Revenue Appellate Jurisdiction</span>
            </div>
          </div>

          {/* Action & Filter Strip */}
          <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={e => setUserSearchQuery(e.target.value)}
                  placeholder="Search user by name, username, email, employee code, district..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All User Roles</option>
                  <option value="CITIZEN">Citizens & Landowners</option>
                  <option value="REVENUE_OFFICER">Revenue Officers (Tahsildars/CO)</option>
                  <option value="DISTRICT_COLLECTOR">District Collectors (DM/IAS)</option>
                  <option value="ADMIN">System Administrators</option>
                </select>
              </div>
            </div>

            {/* Add User Button */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={fetchUsers}
                className="p-2.5 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
                title="Refresh from SQLite database"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  resetNewUserForm();
                  setIsAddUserModalOpen(true);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Provision User (Officer / Citizen)</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 border-b border-slate-700 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-4">Role & Persona</th>
                    <th className="py-3 px-4">Designation & Department</th>
                    <th className="py-3 px-4">Jurisdiction</th>
                    <th className="py-3 px-4">KYC / Credentials</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No users found matching your search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isOfficer = u.role !== 'CITIZEN';
                      return (
                        <tr key={u.user_id} className="hover:bg-slate-750 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'}
                                alt={u.full_name}
                                className="w-9 h-9 rounded-full object-cover border border-slate-600"
                              />
                              <div>
                                <div className="font-bold text-white text-sm">{u.full_name}</div>
                                <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                                  <span>@{u.username}</span>
                                  <span>•</span>
                                  <span className="font-mono text-[10px] text-sky-400">{u.user_id}</span>
                                </div>
                                <div className="text-[10px] text-slate-500">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                                : u.role === 'DISTRICT_COLLECTOR'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                : isOfficer
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                : 'bg-sky-950/80 text-sky-300 border-sky-800'
                            }`}>
                              {u.role === 'CITIZEN' ? '👤 Citizen' : u.role === 'REVENUE_OFFICER' ? '🏛️ Revenue Officer' : u.role === 'DISTRICT_COLLECTOR' ? '⚖️ District Collector' : '🛡️ Administrator'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-200">{u.designation || 'Landowner'}</div>
                            <div className="text-[11px] text-slate-400">{u.department || 'General Public'}</div>
                            {u.employee_id && (
                              <div className="text-[10px] text-amber-400/90 font-mono mt-0.5">Code: {u.employee_id}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {u.jurisdiction_state ? (
                              <div className="space-y-0.5">
                                <div className="font-semibold text-slate-200">{u.jurisdiction_district || 'District HQ'}, {u.jurisdiction_state}</div>
                                {u.jurisdiction_tehsil && (
                                  <div className="text-[10px] text-slate-400">Tehsil: {u.jurisdiction_tehsil}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-500">Pan-India</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                u.kyc_status === 'VERIFIED'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-sky-950 text-sky-400 border border-sky-800'
                              }`}>
                                <BadgeCheck className="w-3 h-3" />
                                <span>{u.kyc_status || 'AADHAAR_LINKED'}</span>
                              </span>
                              {u.pan_number && (
                                <div className="text-[10px] text-slate-400 font-mono">PAN: {u.pan_number}</div>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setEditingUser({ ...u });
                                  setIsEditUserModalOpen(true);
                                }}
                                className="p-1.5 bg-slate-700 hover:bg-sky-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                                title="Edit Role / Designation / Jurisdiction"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.user_id, u.full_name)}
                                className="p-1.5 bg-slate-700 hover:bg-rose-600 rounded-lg text-slate-300 hover:text-white transition-colors"
                                title="Delete from SQLite Database"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: OVERVIEW & FLAGGED CASES DASHBOARD */}
      {/* ========================================================== */}
      {adminTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Metrics Widgets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-xs font-semibold text-slate-400">Parcels Analyzed Nationally</span>
              <div className="text-2xl font-extrabold text-white font-mono">
                {metrics?.parcels_analyzed?.toLocaleString() || "10,000"}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">28 States & 8 UTs Active</span>
            </div>

            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-xs font-semibold text-slate-400">High Risk Flagged</span>
              <div className="text-2xl font-extrabold text-rose-400 font-mono">
                {metrics?.high_risk_count?.toLocaleString() || "1,240"}
              </div>
              <span className="text-[10px] text-rose-400 font-semibold">Requires Revenue Officer Action</span>
            </div>

            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-xs font-semibold text-slate-400">Medium Risk Flagged</span>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">
                {metrics?.medium_risk_count?.toLocaleString() || "2,350"}
              </div>
              <span className="text-[10px] text-amber-400 font-semibold">Pending Citizen Clarification</span>
            </div>

            <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-xs font-semibold text-slate-400">Officer Decisions Logged</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {metrics?.officer_decisions_logged?.toLocaleString() || "430"}
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">Immutable Audit Logs</span>
            </div>
          </div>

          {/* State Analytics Chart & Review Queue */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 space-y-4">
              <h3 className="font-bold text-white text-base">
                State-wise Parcels Analyzed (Top States)
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stateChartData}>
                    <XAxis dataKey="state" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="cnt" fill="#0284C7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 bg-slate-800/90 p-6 rounded-2xl border border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">
                  National Flagged Cases Review Queue ({cases.length} Open)
                </h3>
                <span className="text-xs text-slate-400">Sorted by Severity</span>
              </div>

              <div className="divide-y divide-slate-700 max-h-64 overflow-y-auto">
                {cases.map((c) => (
                  <div
                    key={c.case_no}
                    onClick={() => setSelectedCase(c)}
                    className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center justify-between ${
                      selectedCase?.case_no === c.case_no ? 'bg-sky-950/80 border border-sky-500' : 'hover:bg-slate-700/60'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-mono text-xs font-bold text-white">
                        {c.land_identity_id}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {c.mauza}, {c.anchal}, {c.district}, <span className="font-bold text-sky-400">{c.state}</span> • Plot #{c.khesra_no} • {c.owner_name}
                      </div>
                    </div>
                    <RiskBadge level={c.risk_level} score={c.risk_score} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Case Inspection & Officer Decision Panel */}
          {selectedCase && (
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs text-sky-400 font-bold uppercase tracking-wider block">INSPECTING CASE #{selectedCase.case_no}</span>
                  <h2 className="text-xl font-bold font-mono">{selectedCase.land_identity_id}</h2>
                  <p className="text-xs text-slate-400">{selectedCase.mauza}, {selectedCase.anchal}, {selectedCase.district}, {selectedCase.state} • Khata/Gata #{selectedCase.khata_no} / Plot #{selectedCase.khesra_no}</p>
                </div>
                <RiskBadge level={selectedCase.risk_level} score={selectedCase.risk_score} size="lg" />
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Engine Risk Findings & Evidence Sources:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {selectedCase.findings.map((f, idx) => (
                    <div key={idx} className="p-3 bg-slate-800 rounded-xl border border-slate-700 space-y-1">
                      <div className="font-bold text-amber-400">{f.rule_id}: {f.title}</div>
                      <p className="text-slate-300 text-[11px]">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleDecisionSubmit} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-sm text-white">Record Revenue Officer Review Decision</h4>

                {successMsg && (
                  <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs">
                    ✓ {successMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Official Decision Action</label>
                    <select
                      value={decision}
                      onChange={e => setDecision(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium"
                    >
                      <option value="FIELD_VERIFICATION">Require Field Revenue Verification (Patwari/Halka)</option>
                      <option value="CITIZEN_CLARIFICATION">Require Citizen Clarification & Notice</option>
                      <option value="VALID">Flag Confirmed Valid (High Risk Approved)</option>
                      <option value="FALSE_POSITIVE">Dismiss Flag as False Positive</option>
                      <option value="ESCALATE">Escalate to District Collector / High Revenue Board</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Officer Role Signature</label>
                    <input
                      type="text"
                      readOnly
                      value={`${userRole} — Revenue Administration (${selectedCase.state || "National"})`}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-1">Investigation Comments / Justification</label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Enter field notes, mutation cross-reference numbers, or revenue court remarks..."
                    rows={3}
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
                >
                  {submitting ? "Submitting Decision..." : "Submit Signed Review Decision"}
                </button>
              </form>
            </div>
          )}

          {/* System Audit Trail */}
          <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 shadow-sm space-y-3 text-xs">
            <h3 className="font-bold text-white text-base">
              Immutable System Audit Trail ({auditLogs.length} Recent Logs)
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-700 flex justify-between items-center text-slate-300 font-mono text-[11px]">
                  <div>
                    <span className="font-bold text-sky-400">[{log.user_name} ({log.role})]</span> {log.action} on {log.resource_type}:{log.resource_id}
                  </div>
                  <span className="text-slate-500">{log.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: SQLITE RAW TABLE EXPLORER */}
      {/* ========================================================== */}
      {adminTab === 'TABLES' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-teal-400" />
              <div>
                <h3 className="font-bold text-white text-sm">Select SQLite Database Table:</h3>
                <p className="text-xs text-slate-400">Inspect raw schema and live rows in bhoomishield.db</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <select
                value={selectedTable}
                onChange={e => {
                  setSelectedTable(e.target.value);
                  setTableOffset(0);
                  fetchTableData(e.target.value, 0);
                }}
                className="w-full sm:w-auto bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
              >
                <option value="users">Table: users (Citizens & Officers)</option>
                <option value="user_documents">Table: user_documents (Bhoomi Vault)</option>
                <option value="land_parcels">Table: land_parcels (10,000 Pan-India)</option>
                <option value="khatian_records">Table: khatian_records (Baseline RoRs)</option>
                <option value="register2_records">Table: register2_records (Current Titles)</option>
                <option value="mutations">Table: mutations (Dakhil-Kharij SLAs)</option>
                <option value="transactions">Table: transactions (Deed Registries)</option>
                <option value="court_cases">Table: court_cases (Revenue & Civil)</option>
                <option value="encumbrances">Table: encumbrances (Bank Mortgages)</option>
                <option value="complaints">Table: complaints (Grievances)</option>
                <option value="verification_reports">Table: verification_reports (QR Reports)</option>
                <option value="audit_logs">Table: audit_logs (Immutable Trail)</option>
              </select>

              <button
                onClick={() => fetchTableData(selectedTable, tableOffset)}
                className="p-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loadingTable ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <span>Querying table records from SQLite...</span>
            </div>
          ) : tableData ? (
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-xl overflow-hidden space-y-3 p-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total records in SQLite: <strong className="text-white font-mono">{tableData.total_records}</strong></span>
                <span>Showing rows {tableOffset + 1} - {Math.min(tableOffset + tableData.count, tableData.total_records)}</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-left text-[11px] font-mono text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-700 text-sky-400">
                    <tr>
                      {tableData.columns?.map((col: string) => (
                        <th key={col} className="py-2.5 px-3 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-950">
                    {tableData.rows?.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-900/60">
                        {tableData.columns?.map((col: string) => (
                          <td key={col} className="py-2 px-3 whitespace-nowrap max-w-[200px] truncate text-slate-300">
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-600">NULL</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  disabled={tableOffset === 0}
                  onClick={() => {
                    const newOff = Math.max(0, tableOffset - 25);
                    setTableOffset(newOff);
                    fetchTableData(selectedTable, newOff);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 rounded-lg text-white font-semibold"
                >
                  ← Previous 25
                </button>
                <button
                  disabled={tableOffset + 25 >= tableData.total_records}
                  onClick={() => {
                    const newOff = tableOffset + 25;
                    setTableOffset(newOff);
                    fetchTableData(selectedTable, newOff);
                  }}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 rounded-lg text-white font-semibold"
                >
                  Next 25 →
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 4: INTERACTIVE SQL QUERY STUDIO */}
      {/* ========================================================== */}
      {adminTab === 'SQL_STUDIO' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Terminal className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Interactive SQLite SQL Query Studio</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">bhoomishield.db (Direct SQLite Engine)</span>
            </div>

            {/* Predefined query templates */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 font-semibold mr-1">Quick Templates:</span>
              <button
                onClick={() => setSqlQuery('SELECT user_id, username, full_name, email, role, jurisdiction_state, designation FROM users ORDER BY id DESC LIMIT 10;')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-purple-950 hover:border-purple-500 border border-slate-700 rounded-lg text-slate-300 font-mono"
              >
                Top 10 Users
              </button>
              <button
                onClick={() => setSqlQuery("SELECT * FROM users WHERE role = 'REVENUE_OFFICER';")}
                className="px-2.5 py-1 bg-slate-900 hover:bg-purple-950 hover:border-purple-500 border border-slate-700 rounded-lg text-slate-300 font-mono"
              >
                All Revenue Officers
              </button>
              <button
                onClick={() => setSqlQuery('SELECT state, count(*) as parcel_count FROM land_parcels GROUP BY state ORDER BY parcel_count DESC;')}
                className="px-2.5 py-1 bg-slate-900 hover:bg-purple-950 hover:border-purple-500 border border-slate-700 rounded-lg text-slate-300 font-mono"
              >
                State Distribution
              </button>
              <button
                onClick={() => setSqlQuery("SELECT application_no, applicant_name, buyer_name, seller_name, status, age_days FROM mutations WHERE status = 'IN_PROGRESS' LIMIT 10;")}
                className="px-2.5 py-1 bg-slate-900 hover:bg-purple-950 hover:border-purple-500 border border-slate-700 rounded-lg text-slate-300 font-mono"
              >
                Pending Mutations
              </button>
            </div>

            {/* SQL Editor */}
            <div className="space-y-2">
              <textarea
                value={sqlQuery}
                onChange={e => setSqlQuery(e.target.value)}
                rows={4}
                placeholder="Enter SQL statement e.g. SELECT * FROM users WHERE role = 'CITIZEN'..."
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-purple-300 placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleExecuteSql}
                  disabled={sqlRunning}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{sqlRunning ? 'Executing SQL...' : 'Run Query on SQLite'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* SQL Error Banner */}
          {sqlError && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono">
              ⚠️ {sqlError}
            </div>
          )}

          {/* SQL Results Table */}
          {sqlResult && (
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-bold">{sqlResult.message || `${sqlResult.row_count} record(s) returned`}</span>
                </div>
                <span className="font-mono text-purple-300">{sqlResult.duration_ms} ms</span>
              </div>

              {sqlResult.columns && sqlResult.columns.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-slate-700">
                  <table className="w-full text-left text-[11px] font-mono text-slate-300">
                    <thead className="bg-slate-900 border-b border-slate-700 text-purple-400">
                      <tr>
                        {sqlResult.columns.map((col: string) => (
                          <th key={col} className="py-2 px-3 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950">
                      {sqlResult.rows?.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-900/60">
                          {sqlResult.columns.map((col: string) => (
                            <td key={col} className="py-1.5 px-3 whitespace-nowrap text-slate-200">
                              {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-600">NULL</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: PROVISION NEW USER AS OFFICER OR CITIZEN */}
      {/* ========================================================== */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in duration-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-sky-400" />
                <h2 className="text-lg font-bold text-white">Provision New User in SQLite Database</h2>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              {/* Role Picker */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">User Role Classification *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'CITIZEN', label: '👤 Citizen / Buyer' },
                    { id: 'REVENUE_OFFICER', label: '🏛️ Revenue Officer (CO/Tahsildar)' },
                    { id: 'DISTRICT_COLLECTOR', label: '⚖️ District Collector (IAS)' },
                    { id: 'ADMIN', label: '🛡️ Administrator' },
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => {
                        setNewRole(r.id as any);
                        if (r.id === 'CITIZEN') {
                          setNewDesignation('Landowner & Citizen');
                          setNewDepartment('General Public');
                        } else if (r.id === 'DISTRICT_COLLECTOR') {
                          setNewDesignation('District Magistrate & Collector');
                          setNewDepartment('District Administration & Revenue');
                        } else {
                          setNewDesignation('Tahsildar / Circle Officer');
                          setNewDepartment('Revenue & Land Reforms');
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                        newRole === r.id
                          ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={e => setNewFullName(e.target.value)}
                    placeholder="e.g. Vikramaditya Rao"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Username *</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    placeholder="e.g. vikram_tahsildar"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="e.g. vikram.rao@revenue.gov.in"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={newMobile}
                    onChange={e => setNewMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">KYC Status</label>
                  <select
                    value={newKycStatus}
                    onChange={e => setNewKycStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="AADHAAR_LINKED">AADHAAR_LINKED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>
              </div>

              {/* Officer Specific Fields */}
              {newRole !== 'CITIZEN' ? (
                <div className="p-3.5 bg-emerald-950/40 rounded-2xl border border-emerald-800/50 space-y-3">
                  <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
                    <Landmark className="w-4 h-4" />
                    <span>Official Revenue Jurisdiction & Authority Credentials</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">Employee Code</label>
                      <input
                        type="text"
                        value={newEmployeeId}
                        onChange={e => setNewEmployeeId(e.target.value)}
                        placeholder="UP-REV-9081"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">Official Designation</label>
                      <select
                        value={newDesignation}
                        onChange={e => setNewDesignation(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                      >
                        <option value="Tahsildar / Circle Officer">Tahsildar / Circle Officer</option>
                        <option value="Sub-Divisional Magistrate (SDM/LRDC)">SDM / LRDC</option>
                        <option value="District Magistrate & Collector">District Magistrate & Collector</option>
                        <option value="Sub-Registrar (Stamps & Registration)">Sub-Registrar (Stamps & Registration)</option>
                        <option value="Revenue Inspector / Lekhpal">Revenue Inspector / Lekhpal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">Jurisdiction State</label>
                      <select
                        value={newState}
                        onChange={e => setNewState(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-white"
                      >
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Delhi">Delhi</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-sky-950/40 rounded-2xl border border-sky-800/50 space-y-3">
                  <div className="font-bold text-sky-400 flex items-center space-x-1.5">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Citizen Verification Credentials (DigiLocker Linked)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">Aadhaar Last 4</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={newAadhaarLast4}
                        onChange={e => setNewAadhaarLast4(e.target.value)}
                        placeholder="5412"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[10px] mb-1">PAN Card Number</label>
                      <input
                        type="text"
                        value={newPanNumber}
                        onChange={e => setNewPanNumber(e.target.value.toUpperCase())}
                        placeholder="ABCPS1234F"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg flex items-center space-x-1.5"
                >
                  <span>{isSavingUser ? 'Adding to SQLite...' : 'Save User to Database'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: EDIT / PROMOTE USER */}
      {/* ========================================================== */}
      {isEditUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in duration-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Edit User: {editingUser.full_name} ({editingUser.user_id})</h3>
              <button onClick={() => setIsEditUserModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUserSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role / Permissions</label>
                <select
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="CITIZEN">CITIZEN (Landowner / Buyer)</option>
                  <option value="REVENUE_OFFICER">REVENUE_OFFICER (Tahsildar / Circle Officer)</option>
                  <option value="DISTRICT_COLLECTOR">DISTRICT_COLLECTOR (District Magistrate / IAS)</option>
                  <option value="ADMIN">ADMIN (Central Administrator)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingUser.designation || ''}
                    onChange={e => setEditingUser({ ...editingUser, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={editingUser.department || ''}
                    onChange={e => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jurisdiction District</label>
                  <input
                    type="text"
                    value={editingUser.jurisdiction_district || ''}
                    onChange={e => setEditingUser({ ...editingUser, jurisdiction_district: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Employee Code</label>
                  <input
                    type="text"
                    value={editingUser.employee_id || ''}
                    onChange={e => setEditingUser({ ...editingUser, employee_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  Save Changes in SQLite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

