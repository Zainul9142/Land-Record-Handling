import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Download, Bot, MapPin, AlertCircle, FileText, CheckCircle2, QrCode, ArrowLeft, Box, Scale, ShieldAlert, Copy, Check, Globe2 } from 'lucide-react';
import { LandProfileResponse } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { StatusIndicator } from '../components/StatusIndicator';
import { LandMap } from '../components/LandMap';
import { LandMap3D } from '../components/LandMap3D';
import { AIAssistant } from '../components/AIAssistant';

interface LandProfilePageProps {
  lang: 'en' | 'hi';
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const LandProfilePage: React.FC<LandProfilePageProps> = ({ lang, onShowToast }) => {
  const { landIdentityId } = useParams<{ landIdentityId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<LandProfileResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'findings' | 'records' | 'map' | 'map3d' | 'ai'>('findings');
  const [copied, setCopied] = useState<boolean>(false);

  const [generatingReport, setGeneratingReport] = useState<boolean>(false);
  const [generatedReport, setGeneratedReport] = useState<{ report_id: string; download_url: string; verify_url: string; report_hash: string } | null>(null);

  useEffect(() => {
    if (!landIdentityId) return;
    setLoading(true);

    fetch(`/api/v1/land/${encodeURIComponent(landIdentityId)}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading land profile", err);
        setLoading(false);
      });
  }, [landIdentityId]);

  const handleGenerateReport = async () => {
    if (!landIdentityId) return;
    setGeneratingReport(true);

    try {
      const res = await fetch('/api/v1/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ land_identity_id: landIdentityId })
      });
      const repData = await res.json();
      setGeneratedReport(repData);
      if (onShowToast) {
        onShowToast('success', 'Verification Report Generated!', `Report ID #${repData.report_id} signed with QR verification.`);
      }
    } catch (err) {
      console.error("Report generation failed", err);
      if (onShowToast) {
        onShowToast('error', 'Report Generation Failed', 'An error occurred while generating PDF report.');
      }
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleCopyLandId = () => {
    if (landIdentityId) {
      navigator.clipboard.writeText(landIdentityId);
      setCopied(true);
      if (onShowToast) {
        onShowToast('success', 'Land Identity ID Copied!', landIdentityId);
      }
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 font-medium">Retrieving multi-source land records from national DILRMP engine...</p>
      </div>
    );
  }

  if (!data || !data.parcel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Land Parcel Not Found</h2>
        <p className="text-xs text-slate-500">No record matches Land Identity ID: {landIdentityId}</p>
        <Link to="/search" className="inline-block px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold">
          Return to Universal Search
        </Link>
      </div>
    );
  }

  const { parcel, records, risk_analysis, ai_explanation } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Link to="/search" className="inline-flex items-center space-x-1 text-xs text-sky-600 dark:text-sky-400 hover:underline mb-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Search</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight flex items-center space-x-2">
              <span>{parcel.land_identity_id}</span>
              <button
                onClick={handleCopyLandId}
                className="p-1 text-slate-400 hover:text-sky-500 transition-colors"
                title="Copy Land Identity ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </h1>
            <RiskBadge level={risk_analysis.risk_level} score={risk_analysis.risk_score} size="md" />
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <Link
            to={`/legal-advisor?land_id=${encodeURIComponent(parcel.land_identity_id)}`}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center space-x-1.5"
          >
            <Scale className="w-4 h-4" />
            <span>AI Legal Advice</span>
          </Link>

          <Link
            to={`/complaints?land_id=${encodeURIComponent(parcel.land_identity_id)}`}
            className="px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center space-x-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>File Complaint</span>
          </Link>

          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center space-x-1.5 shrink-0 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{generatingReport ? "Generating PDF..." : "Generate Verification Report"}</span>
          </button>
        </div>
      </div>

      {/* Generated Report Banner */}
      {generatedReport && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 p-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs animate-in fade-in duration-300">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                Land Verification Report Issued #{generatedReport.report_id}
              </div>
              <p className="text-emerald-700 dark:text-emerald-400">
                Tamper-proof report generated with embedded QR Code verification. Hash: <span className="font-mono text-[10px]">{generatedReport.report_hash.slice(0, 16)}...</span>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <a
              href={generatedReport.download_url}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow"
            >
              Download PDF
            </a>
            <Link
              to={generatedReport.verify_url}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 font-semibold rounded-lg border border-emerald-300 dark:border-emerald-700 flex items-center space-x-1"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Verify QR</span>
            </Link>
          </div>
        </div>
      )}

      {/* Parcel Overview & Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-sky-600" />
              <span>Unified Land Profile Specifications</span>
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                {parcel.state || "National DILRMP"}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {parcel.land_type}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">State (राज्य)</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm truncate block">{parcel.state}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">District (ज़िला)</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{parcel.district}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Sub-district / Tehsil</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{parcel.anchal}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Village / Mauza</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{parcel.mauza}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Khata / Gata / Survey No</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">#{parcel.khata_no}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Plot / Khasra / Hissa No</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">#{parcel.khesra_no}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Recorded Base Owner</span>
              <span className="font-semibold text-slate-900 dark:text-white text-xs truncate block">
                {records.khatian?.owner_name || "N/A"}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Current Tenant / 7-12</span>
              <span className="font-semibold text-slate-900 dark:text-white text-xs truncate block">
                {records.register2?.current_owner_name || "N/A"}
              </span>
            </div>
          </div>
        </div>

        <StatusIndicator summary={risk_analysis.status_summary} />
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('findings')}
            className={`py-3 px-1 border-b-2 font-bold text-xs flex items-center space-x-2 transition-colors shrink-0 ${
              activeTab === 'findings'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Risk Findings ({risk_analysis.findings_count})</span>
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`py-3 px-1 border-b-2 font-bold text-xs flex items-center space-x-2 transition-colors shrink-0 ${
              activeTab === 'records'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Multi-Record Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`py-3 px-1 border-b-2 font-bold text-xs flex items-center space-x-2 transition-colors shrink-0 ${
              activeTab === 'map'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>2D Cadastral Map</span>
          </button>

          <button
            onClick={() => setActiveTab('map3d')}
            className={`py-3 px-1 border-b-2 font-bold text-xs flex items-center space-x-2 transition-colors shrink-0 ${
              activeTab === 'map3d'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Box className="w-4 h-4 text-indigo-500" />
            <span>3D Land Parcel & Terrain</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-1 border-b-2 font-bold text-xs flex items-center space-x-2 transition-colors shrink-0 ${
              activeTab === 'ai'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-500" />
            <span>AI Assistant & Q&A</span>
          </button>
        </nav>
      </div>

      {/* Tab 1: Risk Findings & Explainable AI */}
      {activeTab === 'findings' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <Bot className="w-4 h-4" />
              <span>BhoomiShield Explainable AI Synthesis</span>
            </div>
            <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {ai_explanation}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Detailed Evidence Rules Engine Findings
            </h3>

            {risk_analysis.findings.length === 0 ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center text-xs text-emerald-700 dark:text-emerald-400">
                ✓ No record inconsistencies detected. All cross-layer checks passed.
              </div>
            ) : (
              risk_analysis.findings.map((f, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border shadow-sm space-y-3 ${
                    f.severity === 'HIGH'
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-current">
                        {f.rule_id}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {f.title}
                      </h4>
                    </div>
                    <RiskBadge level={f.severity} showScore={false} size="sm" />
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {f.description}
                  </p>

                  {f.evidence && (
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
                      <span className="text-slate-400 uppercase font-bold block text-[10px]">Evidence Snapshot:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                        {Object.entries(f.evidence).map(([k, v]) => (
                          <div key={k}>
                            <span className="text-slate-400">{k}:</span> {String(v)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Multi-Record Comparison */}
      {activeTab === 'records' && (
        <div className="space-y-6 text-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
              Primary Record Comparison (Baseline ROR vs Current Mutation Roll)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <th className="p-3">Attribute</th>
                    <th className="p-3">Base Record of Rights (Khatian / Khatauni)</th>
                    <th className="p-3">Current Tenant Register (Register-II / 7-12)</th>
                    <th className="p-3">Match Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="p-3 font-semibold">Recorded Owner / Tenant</td>
                    <td className="p-3">{records.khatian?.owner_name || "N/A"}</td>
                    <td className="p-3">{records.register2?.current_owner_name || "N/A"}</td>
                    <td className="p-3">
                      {records.khatian?.owner_name === records.register2?.current_owner_name ? (
                        <span className="text-emerald-600 font-bold">✓ EXACT MATCH</span>
                      ) : (
                        <span className="text-rose-600 font-bold">⚠️ MISMATCH DETECTED</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Recorded Area</td>
                    <td className="p-3">{records.khatian?.recorded_area_acre} Acres</td>
                    <td className="p-3">{records.register2?.recorded_area_acre} Acres</td>
                    <td className="p-3">
                      {records.khatian?.recorded_area_acre === records.register2?.recorded_area_acre ? (
                        <span className="text-emerald-600 font-bold">✓ MATCH</span>
                      ) : (
                        <span className="text-amber-600 font-bold">⚠️ VARIANCE</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 2D Map */}
      {activeTab === 'map' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Cadastral Parcel Polygon View ({parcel.state})
          </h3>
          <LandMap
            polygonJson={parcel.polygon_json}
            district={parcel.district}
            anchal={parcel.anchal}
            mauza={parcel.mauza}
            khata={parcel.khata_no}
            khesra={parcel.khesra_no}
          />
        </div>
      )}

      {/* Tab 4: 3D Map */}
      {activeTab === 'map3d' && (
        <LandMap3D
          polygonJson={parcel.polygon_json}
          district={parcel.district}
          anchal={parcel.anchal}
          mauza={parcel.mauza}
          khata={parcel.khata_no}
          khesra={parcel.khesra_no}
          areaAcre={parcel.area_acre}
        />
      )}

      {/* Tab 5: AI Assistant */}
      {activeTab === 'ai' && (
        <AIAssistant landIdentityId={parcel.land_identity_id} initialExplanation={ai_explanation} />
      )}
    </div>
  );
};
