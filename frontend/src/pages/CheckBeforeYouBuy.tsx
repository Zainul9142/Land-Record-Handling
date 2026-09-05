import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Search, CheckCircle, AlertTriangle, ArrowRight, Globe2 } from 'lucide-react';
import { StateMetadata } from '../types';

export const CheckBeforeYouBuy: React.FC = () => {
  const navigate = useNavigate();
  const [statesList, setStatesList] = useState<string[]>([]);
  const [stateMetadata, setStateMetadata] = useState<Record<string, StateMetadata>>({});

  const [state, setState] = useState('Jharkhand');
  const [district, setDistrict] = useState('Bokaro');
  const [anchal, setAnchal] = useState('Chas');
  const [mauza, setMauza] = useState('Kura');
  const [khata, setKhata] = useState('125');
  const [khesra, setKhesra] = useState('450/2');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/v1/land/locations')
      .then(res => res.json())
      .then(data => {
        if (data.states) setStatesList(data.states);
        if (data.state_metadata) setStateMetadata(data.state_metadata);
      })
      .catch(err => console.error("Error loading location metadata", err));
  }, []);

  const currentStateMeta = stateMetadata[state] || {
    portal: `${state} Official Land Record Portal`,
    subdistrict_name: 'Tehsil / Anchal / Taluk',
    primary_no_name: 'Khata / Gata / Survey No',
    plot_no_name: 'Khesra / Khasra / Plot No',
    record_type: 'Record of Rights (ROR)',
    districts: {}
  };

  const districtOptions = currentStateMeta.districts ? Object.keys(currentStateMeta.districts) : [];

  const handleStateChange = (newState: string) => {
    setState(newState);
    const meta = stateMetadata[newState];
    if (meta && meta.districts) {
      const firstDist = Object.keys(meta.districts)[0] || '';
      setDistrict(firstDist);
      if (firstDist && meta.districts[firstDist]) {
        const firstSub = Object.keys(meta.districts[firstDist])[0] || '';
        setAnchal(firstSub);
        const firstVil = meta.districts[firstDist][firstSub]?.[0] || '';
        setMauza(firstVil);
      }
    }
  };

  const handleRunCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const query = `state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}&subdistrict=${encodeURIComponent(anchal)}&village=${encodeURIComponent(mauza)}&primary_no=${encodeURIComponent(khata)}&plot_no=${encodeURIComponent(khesra)}`;
    fetch(`/api/v1/land/search?${query}`)
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.results && data.results.length > 0) {
          navigate(`/land/${data.results[0].land_identity_id}`);
        } else {
          alert(`No matching land parcel found in ${state} (${district}). Please verify the Plot / Khata number.`);
        }
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 text-xs font-semibold">
          <Globe2 className="w-4 h-4 text-amber-500" />
          <span>Pan-India Buyer Due-Diligence & Title Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          "Check Before You Buy" Land Due-Diligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Verify land title consistency, mutation SLA status, unmutated deeds, active litigation stay orders, and bank mortgage charges across any State in India before signing an agreement.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <form onSubmit={handleRunCheck} className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Step 1: Enter Property Geographic & Identification Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State / UT (राज्य)</label>
              <select 
                value={state} 
                onChange={e => handleStateChange(e.target.value)} 
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg font-medium"
              >
                {statesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">District (ज़िला)</label>
              <select 
                value={district} 
                onChange={e => setDistrict(e.target.value)} 
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg font-medium"
              >
                {districtOptions.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {currentStateMeta.subdistrict_name || "Tehsil / Anchal"}
              </label>
              <input type="text" value={anchal} onChange={e => setAnchal(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Village / Mauza (गाँव/मौजा)</label>
              <input type="text" value={mauza} onChange={e => setMauza(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {currentStateMeta.primary_no_name || "Khata / Gata / Survey No"}
              </label>
              <input type="text" value={khata} onChange={e => setKhata(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg" />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {currentStateMeta.plot_no_name || "Khesra / Khasra / Plot No"}
              </label>
              <input type="text" value={khesra} onChange={e => setKhesra(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{loading ? `Scanning ${state} Land Record Stream...` : "Run Multi-Record Risk Inspection"}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-2">
          <div className="font-semibold text-slate-700 dark:text-slate-300">Automated Cross-Layer Checks Conducted Across India:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center space-x-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-500" /><span>RoR / 7-12 / Khatian vs Tenant Roll Name Mismatch</span></div>
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
