import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertOctagon, AlertTriangle, CheckCircle, FileText, Lock, UserCheck, Activity, Globe2 } from 'lucide-react';
import { OfficerCase } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AdminDashboardProps {
  userRole: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ userRole }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [cases, setCases] = useState<OfficerCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCase, setSelectedCase] = useState<OfficerCase | null>(null);

  const [decision, setDecision] = useState<string>('FIELD_VERIFICATION');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/v1/admin/dashboard').then(r => r.json()),
      fetch('/api/v1/admin/cases').then(r => r.json()),
      fetch('/api/v1/admin/audit').then(r => r.json())
    ]).then(([dashData, casesData, auditData]) => {
      setMetrics(dashData);
      setCases(casesData.cases || []);
      setAuditLogs(auditData.logs || []);
      if (casesData.cases && casesData.cases.length > 0) {
        setSelectedCase(casesData.cases[0]);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Failed to load admin data", err);
      setLoading(false);
    });
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/admin/cases/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_no: selectedCase.case_no,
          land_identity_id: selectedCase.land_identity_id,
          officer_name: userRole === 'REVENUE_OFFICER' ? "Tahsildar / Circle Officer" : "SDM / Sub-Collector / LRDC",
          officer_role: userRole,
          decision: decision,
          comment: comment
        })
      });
      const resData = await res.json();
      setSuccessMsg(`Decision '${decision}' recorded successfully for case ${selectedCase.case_no}.`);
      setComment('');
      loadDashboardData();
    } catch (err) {
      console.error("Failed to record officer decision", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Loading Pan-India National Revenue Review & Analytics Dashboard...</p>
      </div>
    );
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Globe2 className="w-4 h-4" />
            <span>Digital India DILRMP National Officer & Admin Layer</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Pan-India Land Risk Review & National Analytics Portal</h1>
          <p className="text-xs text-slate-400">
            Monitoring state-wise and district-wise land risk alerts, inspecting multi-record evidence, and logging administrative review overrides.
          </p>
        </div>

        <div className="bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700 text-xs flex items-center space-x-3">
          <UserCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-slate-400 block text-[10px]">Active Session Role:</span>
            <span className="font-bold text-white uppercase">{userRole}</span>
          </div>
        </div>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Parcels Analyzed Nationally</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {metrics?.parcels_analyzed?.toLocaleString() || "10,000"}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">28 States & 8 UTs Active</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">High Risk Flagged</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
            {metrics?.high_risk_count?.toLocaleString() || "1,240"}
          </div>
          <span className="text-[10px] text-rose-500 font-semibold">Requires Revenue Officer Action</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Medium Risk Flagged</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {metrics?.medium_risk_count?.toLocaleString() || "2,350"}
          </div>
          <span className="text-[10px] text-amber-500 font-semibold">Pending Citizen Clarification</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500">Officer Decisions Logged</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {metrics?.officer_decisions_logged?.toLocaleString() || "430"}
          </div>
          <span className="text-[10px] text-emerald-500 font-semibold">Immutable Audit Logs</span>
        </div>
      </div>

      {/* State Analytics Chart & Review Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State-wise Distribution Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            State-wise Parcels Analyzed (Top States)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateChartData}>
                <XAxis dataKey="state" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="cnt" fill="#0284C7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Flagged Cases List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              National Flagged Cases Review Queue ({cases.length} Open)
            </h3>
            <span className="text-xs text-slate-500">Sorted by Severity</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
            {cases.map((c) => (
              <div
                key={c.case_no}
                onClick={() => setSelectedCase(c)}
                className={`p-3 rounded-xl cursor-pointer transition-colors flex items-center justify-between ${
                  selectedCase?.case_no === c.case_no ? 'bg-sky-50 dark:bg-sky-950/50 border border-sky-300 dark:border-sky-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {c.land_identity_id}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {c.mauza}, {c.anchal}, {c.district}, <span className="font-bold text-sky-600 dark:text-sky-400">{c.state}</span> • Plot #{c.khesra_no} • {c.owner_name}
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

          {/* Evidence Sources Breakdown */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-400 tracking-wider">Engine Risk Findings & Evidence Sources:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {selectedCase.findings.map((f, idx) => (
                <div key={idx} className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 space-y-1">
                  <div className="font-bold text-amber-400">{f.rule_id}: {f.title}</div>
                  <p className="text-slate-300 text-[11px]">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Form */}
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
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">
          Immutable System Audit Trail ({auditLogs.length} Recent Logs)
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-700 dark:text-slate-300 font-mono text-[11px]">
              <div>
                <span className="font-bold text-sky-600 dark:text-sky-400">[{log.user_name} ({log.role})]</span> {log.action} on {log.resource_type}:{log.resource_id}
              </div>
              <span className="text-slate-400">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
