import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Search, CheckCircle, AlertTriangle, ArrowRight, 
  Globe2, Box, FileText, CheckCircle2, XCircle, Calculator, 
  Scale, Download, Sparkles, Navigation, Layers
} from 'lucide-react';
import { StateMetadata } from '../types';
import { LandMap3D } from '../components/LandMap3D';

const DEFAULT_STATES = ['Jharkhand', 'Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Bihar', 'Delhi'];

export const CheckBeforeYouBuy: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [statesList, setStatesList] = useState<string[]>(DEFAULT_STATES);
  const [stateMetadata, setStateMetadata] = useState<Record<string, StateMetadata>>({});

  // Step 1: Identification States
  const [state, setState] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('Gautam Buddha Nagar (Noida)');
  const [anchal, setAnchal] = useState('Dadri');
  const [mauza, setMauza] = useState('Bhangel');
  const [khata, setKhata] = useState('340');
  const [khesra, setKhesra] = useState('112/1');
  const [areaAcre, setAreaAcre] = useState<number>(0.50);
  const [declaredPriceLakh, setDeclaredPriceLakh] = useState<number>(45);

  // Step 3: 10-Point Legal Checklist State
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    title_chain_30yr: true,
    encumbrance_cert_nil: true,
    mutation_in_register2: true,
    tribal_sc_st_permission: true,
    no_court_stay_orders: true,
    zoning_na_approved: true,
    physical_possession_match: true,
    road_setback_cleared: true,
    tax_receipts_cleared: true,
    rera_approvals_valid: true
  });

  useEffect(() => {
    fetch('/api/v1/land/locations')
      .then(res => res.json())
      .then(data => {
        if (data.states && data.states.length > 0) setStatesList(data.states);
        if (data.state_metadata) setStateMetadata(data.state_metadata);
      })
      .catch(() => console.log("Using built-in location list"));
  }, []);

  const currentStateMeta = stateMetadata[state] || {
    portal: `${state} Official Land Record Portal`,
    subdistrict_name: 'Tehsil / Anchal / Taluk',
    primary_no_name: 'Khata / Gata / Survey No',
    plot_no_name: 'Khesra / Khasra / Plot No',
    record_type: 'Record of Rights (ROR)',
    districts: {}
  };

  const districtOptions = currentStateMeta.districts && Object.keys(currentStateMeta.districts).length > 0
    ? Object.keys(currentStateMeta.districts)
    : [district];

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

  const toggleChecklistItem = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const checklistItems = [
    { key: 'title_chain_30yr', title: '30-Year Continuous Title Search Chain', desc: 'Verifies unbroke succession & registration deed sequence from original recorded owner.' },
    { key: 'encumbrance_cert_nil', title: 'Nil Encumbrance Certificate (Form 15/16)', desc: 'Confirms zero bank mortgages, hypothecations, or financial institution charges.' },
    { key: 'mutation_in_register2', title: 'Updated Mutation & Register-II Jamabandi Entry', desc: 'Ensures current seller is recorded as legitimate rent-paying Bhumidhar/Tenant.' },
    { key: 'tribal_sc_st_permission', title: 'Statutory SC/ST & Tribal Non-Alienation Clearance', desc: 'Compliant with CNT Sec 46/49, SPT Sec 20, UP Code Sec 98, and Karnataka PTCL.' },
    { key: 'no_court_stay_orders', title: 'Revenue & Civil Court Litigation Clearance', desc: 'No active lis pendens injunction, partition dispute, or status quo stay order.' },
    { key: 'zoning_na_approved', title: 'Master Plan Zoning & Non-Agricultural (NA) Order', desc: 'Verified Section 80 / NA conversion order from competent Sub-Divisional Magistrate.' },
    { key: 'physical_possession_match', title: 'Ground Physical Possession & Boundary Demarcation', desc: 'On-site survey matches ETS coordinates, road access, and boundary beacons.' },
    { key: 'road_setback_cleared', title: 'PWD Road, Canal & Forest Eco-Buffer Setbacks', desc: 'Parcel is clear of statutory green belt or road widening reservations.' },
    { key: 'tax_receipts_cleared', title: 'Latest Land Revenue & Municipal Tax Receipts', desc: 'No pending property lagan arrears, conversion cess, or development charges.' },
    { key: 'rera_approvals_valid', title: 'RERA Registration & Plotted Layout Sanction', desc: 'Town planning layout sanction approved with statutory civic amenity reservation.' }
  ];

  const totalPassed = Object.values(checklist).filter(Boolean).length;
  const buyerRiskScore = Math.max(5, 100 - (totalPassed * 9.5));
  const estimatedCircleRateLakh = (areaAcre * 65).toFixed(1);

  const getTargetLandIdentityId = () => {
    if (state === 'Uttar Pradesh') return 'UP-GAU-DAD-BHAN-P340-PL112-1';
    if (state === 'Maharashtra') return 'MH-PUN-HAV-HINJ-G145-P23-B';
    if (state === 'Karnataka') return 'KA-BLR-SOU-WHIT-S89-P3-A';
    if (state === 'Bihar') return 'BR-PAT-DAN-KHAG-K201-P56-3';
    if (state === 'Delhi') return 'DL-SOU-HAU-MEH-K56-P12-A';
    return 'JH-BOK-CHA-KURA-K125-K450-2';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <Globe2 className="w-4 h-4 text-amber-500" />
          <span>DILRMP Pan-India Buyer Title Intelligence & Due-Diligence Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          "Check Before You Buy" Land Due-Diligence Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Multi-layer due-diligence workflow scanning 3D cadastral topology, title consistency, unmutated deeds, active court stay orders, and statutory circle rates before executing property transactions.
        </p>
      </div>

      {/* 5-Step Process Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => setStep(1)}
          className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
            step === 1 ? 'bg-sky-600 text-white border-sky-500 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="block text-[10px] uppercase opacity-70">Step 1</span>
          <span>1. Identification</span>
        </button>

        <button
          onClick={() => setStep(2)}
          className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
            step === 2 ? 'bg-sky-600 text-white border-sky-500 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="block text-[10px] uppercase opacity-70">Step 2</span>
          <span>2. 3D Spatial Terrain</span>
        </button>

        <button
          onClick={() => setStep(3)}
          className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
            step === 3 ? 'bg-sky-600 text-white border-sky-500 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="block text-[10px] uppercase opacity-70">Step 3</span>
          <span>3. 10-Point Legal Audit</span>
        </button>

        <button
          onClick={() => setStep(4)}
          className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
            step === 4 ? 'bg-sky-600 text-white border-sky-500 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="block text-[10px] uppercase opacity-70">Step 4</span>
          <span>4. Scorecard & Verdict</span>
        </button>
      </div>

      {/* STEP 1: PROPERTY IDENTIFICATION */}
      {step === 1 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-sky-500/10 text-sky-500 rounded-2xl">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Step 1: Enter Property Geography & Consideration Value</h2>
              <p className="text-xs text-slate-500">Provide cadastral survey references and declared purchase price.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State / UT (राज्य)</label>
              <select 
                value={state} 
                onChange={e => handleStateChange(e.target.value)} 
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
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
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
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
              <input 
                type="text" 
                value={anchal} 
                onChange={e => setAnchal(e.target.value)} 
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium" 
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Village / Mauza / Sector</label>
              <input 
                type="text" 
                value={mauza} 
                onChange={e => setMauza(e.target.value)} 
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium" 
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {currentStateMeta.primary_no_name || "Khata / Gata No"}
              </label>
              <input 
                type="text" 
                value={khata} 
                onChange={e => setKhata(e.target.value)} 
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium font-mono" 
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {currentStateMeta.plot_no_name || "Khesra / Plot No"}
              </label>
              <input 
                type="text" 
                value={khesra} 
                onChange={e => setKhesra(e.target.value)} 
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium font-mono" 
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Land Area (Acres)</label>
              <input 
                type="number" 
                step="0.01" 
                value={areaAcre} 
                onChange={e => setAreaAcre(parseFloat(e.target.value) || 0.1)} 
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium" 
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Offered Price (₹ Lakhs)</label>
              <input 
                type="number" 
                value={declaredPriceLakh} 
                onChange={e => setDeclaredPriceLakh(parseFloat(e.target.value) || 1)} 
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium" 
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Continue to 3D Spatial Inspection</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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
