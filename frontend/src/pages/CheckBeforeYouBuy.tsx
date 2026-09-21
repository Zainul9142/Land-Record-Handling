import React, { useState } from 'react';
import { ShieldCheck, Search, AlertTriangle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CheckBeforeYouBuy: React.FC = () => {
  const navigate = useNavigate();
  const [khataNo, setKhataNo] = useState<string>('125');
  const [khesraNo, setKhesraNo] = useState<string>('450/2');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/land/JH-BOK-CHA-KURA-K125-K450-2`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 transition-colors duration-300">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-500 animate-bounce" />
          <span>Buyer Due-Diligence & Anti-Fraud Shield</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Check Land Parcel Before You Buy
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Run automated multi-source consistency checks before paying advance money or signing sale deeds.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 transition-colors">
        <form onSubmit={handleVerify} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Khata No (खाता सं.)</label>
              <input
                type="text"
                value={khataNo}
                onChange={e => setKhataNo(e.target.value)}
                placeholder="e.g. 125"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Khesra No (खेसरा सं.)</label>
              <input
                type="text"
                value={khesraNo}
                onChange={e => setKhesraNo(e.target.value)}
                placeholder="e.g. 450/2"
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-2 hover:scale-105"
          >
            <Search className="w-4 h-4" />
            <span>Run Buyer Due-Diligence Audit</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Automated Checks Included:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Khatian Owner vs Tenant Match (R001)</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Active Revenue Court Disputes (R007)</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Bank Mortgage Charges (R008)</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2 text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Tribal Land Transfer Laws (CNT/SPT)</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: 3D SPATIAL TERRAIN INSPECTOR */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in">
          <LandMap3D
            district={district}
            anchal={anchal}
            mauza={mauza}
            khata={khata}
            khesra={khesra}
            areaAcre={areaAcre}
          />

          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
            >
              Back to Details
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Proceed to 10-Point Legal Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: 10-POINT STATUTORY LEGAL CHECKLIST */}
      {step === 3 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Scale className="w-5 h-5 text-purple-500" />
                <span>Step 3: Buyer's 10-Point Statutory Legal Due-Diligence Checklist</span>
              </h2>
              <p className="text-xs text-slate-500">
                Click items to toggle verification status based on your legal search findings.
              </p>
            </div>
            <div className="px-3 py-1 bg-sky-500/10 text-sky-500 border border-sky-500/30 rounded-xl text-xs font-bold font-mono">
              {totalPassed}/10 Verifications Passed
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {checklistItems.map((item, idx) => (
              <div
                key={item.key}
                onClick={() => toggleChecklistItem(item.key)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 select-none ${
                  checklist[item.key]
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-900 dark:text-white'
                    : 'bg-rose-500/10 border-rose-500/40 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  {checklist[item.key] ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-xs flex items-center space-x-2">
                    <span>{idx + 1}. {item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
            >
              Back to 3D Map
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>View Scorecard & Risk Verdict</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DUE DILIGENCE SCORECARD & VERDICT */}
      {step === 4 && (
        <div className="space-y-6 animate-in fade-in">
          <div className={`p-8 rounded-3xl text-white border shadow-2xl space-y-6 ${
            buyerRiskScore < 25 
              ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border-emerald-500/40' 
              : buyerRiskScore < 50
              ? 'bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 border-amber-500/40'
              : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-900 border-rose-500/40'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  Automated Due Diligence Scorecard
                </span>
                <h2 className="text-2xl font-black">
                  {buyerRiskScore < 25 ? '✅ TITLE FIT FOR ACQUISITION' : buyerRiskScore < 50 ? '⚠️ CONDITIONAL APPROVAL REQUIRED' : '🛑 HIGH LEGAL RISK — DO NOT SIGN'}
                </h2>
                <p className="text-xs text-slate-300">
                  Assessed against DILRMP multi-record consistency rules & statutory land reform acts.
                </p>
              </div>

              <div className="text-right bg-slate-950/80 p-4 rounded-2xl border border-white/10 shrink-0">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Computed Title Risk Score</span>
                <span className={`text-3xl font-black font-mono ${
                  buyerRiskScore < 25 ? 'text-emerald-400' : buyerRiskScore < 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {buyerRiskScore}/100
                </span>
              </div>
            </div>

            {/* Benchmark Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Government Circle Value</span>
                <div className="text-base font-bold text-sky-400">₹{estimatedCircleRateLakh} Lakhs</div>
                <div className="text-[10px] text-slate-400">Official registry base assessment</div>
              </div>
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Declared Asking Price</span>
                <div className="text-base font-bold text-white">₹{declaredPriceLakh} Lakhs</div>
                <div className="text-[10px] text-slate-400">
                  {declaredPriceLakh < parseFloat(estimatedCircleRateLakh) ? '⚠️ Under-valuation warning' : 'Fair market alignment'}
                </div>
              </div>
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Verification Checklist Status</span>
                <div className="text-base font-bold text-emerald-400">{totalPassed}/10 Compliant</div>
                <div className="text-[10px] text-slate-400">{10 - totalPassed} items pending clearance</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Modify Checklist
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => navigate(`/land/${getTargetLandIdentityId()}`)}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>Open Full Land Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
