import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export const CheckBeforeYouBuy: React.FC = () => {
  const navigate = useNavigate();
  const [district, setDistrict] = useState('Bokaro');
  const [anchal, setAnchal] = useState('Chas');
  const [mauza, setMauza] = useState('Kura');
  const [khata, setKhata] = useState('125');
  const [khesra, setKhesra] = useState('450/2');

  const handleRunCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const query = `district=${district}&anchal=${anchal}&mauza=${mauza}&khata=${khata}&khesra=${khesra}`;
    fetch(`/api/v1/land/search?${query}`)
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          navigate(`/land/${data.results[0].land_identity_id}`);
        } else {
          alert("No land parcel found for given details. Please check Khata / Khesra number.");
        }
      });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          <span>BhoomiShield Buyer Protection Tool</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          "Check Before You Buy" Land Due-Diligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Verify land title consistency, mutation SLA status, unmutated deeds, active litigation stay orders, and bank charges before signing any land agreement.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <form onSubmit={handleRunCheck} className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Step 1: Enter Property Identifier Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">District</label>
              <select value={district} onChange={e => setDistrict(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg">
                <option value="Bokaro">Bokaro</option>
                <option value="Ranchi">Ranchi</option>
                <option value="Dhanbad">Dhanbad</option>
                <option value="East Singhbhum">East Singhbhum</option>
                <option value="Hazaribagh">Hazaribagh</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Anchal</label>
              <input type="text" value={anchal} onChange={e => setAnchal(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mauza</label>
              <input type="text" value={mauza} onChange={e => setMauza(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Khata No</label>
              <input type="text" value={khata} onChange={e => setKhata(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg" />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Khesra No (Plot Number)</label>
              <input type="text" value={khesra} onChange={e => setKhesra(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Run Multi-Record Risk Inspection</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-2">
          <div className="font-semibold text-slate-700 dark:text-slate-300">Automated Checks Conducted:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center space-x-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /><span>Khatian vs Register-II Tenant Mismatch</span></div>
            <div className="flex items-center space-x-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /><span>Recorded Plot Area Discrepancy</span></div>
            <div className="flex items-center space-x-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /><span>Overdue Mutation SLA Backlog</span></div>
            <div className="flex items-center space-x-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /><span>Unmutated Registration Deed History</span></div>
            <div className="flex items-center space-x-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /><span>Revenue & Civil Court Stay Orders</span></div>
            <div className="flex items-center space-x-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /><span>Bank Mortgage Hypothecation Charges</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
