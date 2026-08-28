import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, QrCode, ShieldCheck, MapPin, Download } from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';

export const ReportVerificationPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!reportId) return;
    setLoading(true);

    fetch(`/api/v1/reports/verify/${encodeURIComponent(reportId)}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Report verification failed", err);
        setLoading(false);
      });
  }, [reportId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500 font-medium">Verifying report cryptographic hash against BhoomiShield ledger...</p>
      </div>
    );
  }

  if (!data || !data.verified) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <XCircle className="w-16 h-16 text-rose-500 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Report Integrity Failed</h1>
        <p className="text-xs text-slate-500">
          Report ID '{reportId}' was not issued by BhoomiShield or has expired/been revoked.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      {/* Verification Card Header */}
      <div className="bg-emerald-900 text-white p-8 rounded-3xl shadow-xl space-y-4 text-center border border-emerald-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl"></div>

        <div className="w-16 h-16 bg-white text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-950 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AUTHENTIC REPORT VERIFIED</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Report ID #{data.report_id}</h1>
          <p className="text-xs text-emerald-200">
            Issued on {data.generated_at} • Data Snapshot Verified
          </p>
        </div>
      </div>

      {/* Verified Record Details Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <span className="text-[11px] text-slate-400 block uppercase font-bold">Verified Land Identity ID</span>
            <Link to={`/land/${data.land_identity_id}`} className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline">
              {data.land_identity_id}
            </Link>
          </div>
          <RiskBadge level={data.risk_level} score={data.risk_score} size="md" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px]">District</span>
            <span className="font-bold text-slate-900 dark:text-white">{data.district}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Anchal</span>
            <span className="font-bold text-slate-900 dark:text-white">{data.anchal}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Mauza</span>
            <span className="font-bold text-slate-900 dark:text-white">{data.mauza}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Khata No</span>
            <span className="font-bold text-slate-900 dark:text-white">#{data.khata_no}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Khesra No</span>
            <span className="font-bold text-slate-900 dark:text-white">#{data.khesra_no}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px]">Area</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{data.area_acre} Acres</span>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl text-xs space-y-2 font-mono">
          <div className="text-slate-400 uppercase text-[10px] font-bold">Cryptographic Report Signature:</div>
          <div className="break-all text-sky-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            SHA-256: {data.report_hash}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-2">
          <Link to={`/land/${data.land_identity_id}`} className="text-sky-600 dark:text-sky-400 font-semibold hover:underline">
            View Live Land Profile →
          </Link>
          <a
            href={`/api/v1/reports/download/${data.report_id}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-sky-600 text-white font-bold rounded-lg shadow hover:bg-sky-500 flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Certified PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
};
