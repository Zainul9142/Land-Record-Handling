import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Scale, Send, Sparkles, BookOpen, AlertTriangle, ShieldCheck, ShieldAlert, ArrowRight, Globe2 } from 'lucide-react';

interface LegalAdvisorPageProps {
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const LegalAdvisorPage: React.FC<LegalAdvisorPageProps> = ({ onShowToast }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const landIdParam = searchParams.get('land_id') || '';

  const [question, setQuestion] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('Pan-India');
  const [landId, setLandId] = useState<string>(landIdParam);
  const [loading, setLoading] = useState<boolean>(false);
  const [consultation, setConsultation] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'UP' | 'MAHARASHTRA' | 'KARNATAKA' | 'JHARKHAND' | 'DELHI' | 'CENTRAL'>('ALL');

  useEffect(() => {
    if (landIdParam) {
      const q = `Explain legal risk factors and statutory provisions for land parcel ${landIdParam}`;
      setQuestion(q);
      handleConsult(undefined, q, landIdParam);
    }
  }, [landIdParam]);

  const handleConsult = async (e?: React.FormEvent, customQ?: string, targetLandId?: string) => {
    if (e) e.preventDefault();
    const qToAsk = customQ || question;
    if (!qToAsk.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/v1/legal-advisor/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: qToAsk, 
          state: selectedState === 'Pan-India' ? undefined : selectedState,
          land_identity_id: targetLandId || landId 
        })
      });
      const data = await res.json();
      setConsultation(data);
      if (onShowToast) {
        onShowToast('info', 'Statutory Legal Analysis Ready', `Consulted ${data.statutory_reference}`);
      }
    } catch (err) {
      console.error("Legal AI consultation failed", err);
      if (onShowToast) {
        onShowToast('error', 'Consultation Failed', 'Unable to connect to Legal AI server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const legalTemplates = [
    {
      category: 'UP',
      state: 'Uttar Pradesh',
      title: "UP Revenue Code Sec 98 (SC/ST Land Transfer)",
      question: "Can Bhumidhari land belonging to Scheduled Castes be sold without District Magistrate permission under UP Revenue Code Section 98?"
    },
    {
      category: 'UP',
      state: 'Uttar Pradesh',
      title: "UP Sec 80 Non-Agricultural Conversion (NA)",
      question: "What is the legal process and penalty for non-agricultural use of agricultural land without Section 80 declaration under UP Revenue Code?"
    },
    {
      category: 'MAHARASHTRA',
      state: 'Maharashtra',
      title: "Maharashtra MLRC Sec 36A (Tribal Land)",
      question: "What are the restrictions on purchasing tribal agricultural land in Maharashtra under MLRC Section 36A?"
    },
    {
      category: 'MAHARASHTRA',
      state: 'Maharashtra',
      title: "Maharashtra MLRC Sec 44 (NA-44 Permission)",
      question: "Is Section 44 NA conversion mandatory for developing a residential layout on agricultural land in Maharashtra?"
    },
    {
      category: 'KARNATAKA',
      state: 'Karnataka',
      title: "Karnataka PTCL Act 1978 (SC/ST Granted Land)",
      question: "Can agricultural land granted to SC/ST under Karnataka Land Grant Rules be alienated without government permission under the PTCL Act?"
    },
    {
      category: 'DELHI',
      state: 'Delhi',
      title: "Delhi Land Reforms Act Sec 81 (Misuse)",
      question: "What are the consequences of constructing commercial godowns or farmhouses on agricultural land under Delhi Land Reforms Act Section 81?"
    },
    {
      category: 'JHARKHAND',
      state: 'Jharkhand',
      title: "CNT Act Section 46 (Tribal Land Protection)",
      question: "Can tribal land under CNT Act Section 46 be sold or transferred to non-STs in Jharkhand?"
    },
    {
      category: 'CENTRAL',
      state: 'Pan-India',
      title: "RERA Section 18 (Builder Possession Delay)",
      question: "What legal remedies and refund compensation are available under RERA Section 18 for delayed possession by builders?"
    },
    {
      category: 'CENTRAL',
      state: 'Pan-India',
      title: "Lis Pendens (Transfer of Property Act Sec 52)",
      question: "What is the legal validity of purchasing property that is subject to an active court stay order or pending title litigation?"
    }
  ];

  const filteredTemplates = activeCategory === 'ALL'
    ? legalTemplates
    : legalTemplates.filter(t => t.category === activeCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <Globe2 className="w-4 h-4 text-emerald-500" />
          <span>Pan-India State Revenue Codes & Central Land Acts AI Advisor</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          BhoomiShield National Legal AI Advisor
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Expert legal advice grounded in the <b>UP Revenue Code 2006</b>, <b>Maharashtra Land Revenue Code 1966</b>, <b>Karnataka PTCL Act</b>, <b>CNT/SPT Acts (Jharkhand)</b>, <b>Delhi Land Reforms Act</b>, <b>RERA 2016</b>, and the <b>Transfer of Property Act</b>.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-2 text-xs">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${activeCategory === 'ALL' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          All National Laws
        </button>
        <button
          onClick={() => setActiveCategory('UP')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${activeCategory === 'UP' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          UP Revenue Code 2006
        </button>
        <button
          onClick={() => setActiveCategory('MAHARASHTRA')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${activeCategory === 'MAHARASHTRA' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          Maharashtra MLRC / 7/12
        </button>
        <button
          onClick={() => setActiveCategory('KARNATAKA')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${activeCategory === 'KARNATAKA' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          Karnataka PTCL & Bhoomi
        </button>
        <button
          onClick={() => setActiveCategory('JHARKHAND')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${activeCategory === 'JHARKHAND' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          Jharkhand CNT / SPT
        </button>
        <button
          onClick={() => setActiveCategory('DELHI')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${activeCategory === 'DELHI' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          Delhi Land Reforms
        </button>
        <button
          onClick={() => setActiveCategory('CENTRAL')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${activeCategory === 'CENTRAL' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          RERA & Central Property Acts
        </button>
      </div>

      {/* Template Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {filteredTemplates.map((t, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuestion(t.question);
              setSelectedState(t.state);
              handleConsult(undefined, t.question);
            }}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:border-emerald-500/60 transition-all shadow-sm group space-y-1.5"
          >
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
              <span className="text-emerald-500">{t.state}</span>
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="font-bold text-slate-900 dark:text-white text-xs">{t.title}</div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
              {t.question}
            </p>
          </button>
        ))}
      </div>

      {/* Consultation Input Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <form onSubmit={e => handleConsult(e)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                State Jurisdiction (राज्य)
              </label>
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
              >
                <option value="Pan-India">Pan-India (All States & Central Acts)</option>
                <option value="Uttar Pradesh">Uttar Pradesh (UP Revenue Code 2006)</option>
                <option value="Maharashtra">Maharashtra (MLRC 1966 & 7/12)</option>
                <option value="Karnataka">Karnataka (KLR Act & PTCL 1978)</option>
                <option value="Jharkhand">Jharkhand (CNT/SPT Acts)</option>
                <option value="Delhi">Delhi (Delhi Land Reforms Act 1954)</option>
                <option value="Bihar">Bihar (Bihar Tenancy Act)</option>
                <option value="Tamil Nadu">Tamil Nadu (Patta Passbook Act)</option>
                <option value="West Bengal">West Bengal (Land Reforms Act 1955)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Optional Land Identity ID:
              </label>
              <input
                type="text"
                value={landId}
                onChange={e => setLandId(e.target.value)}
                placeholder="e.g. UP-GAU-DAD-BHAN-P340-PL112-1 or JH-BOK-CHA-KURA-P125-PL450-2"
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="relative">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. Can agricultural land in Uttar Pradesh be sold to non-SC buyers under Section 98 of UP Revenue Code?"
              rows={3}
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Scale className="w-4 h-4" />
            <span>{loading ? "Consulting State Revenue Codes & Central Acts..." : "Consult Pan-India AI Legal Advisor"}</span>
          </button>
        </form>

        {/* Legal Consultation Output Card */}
        {consultation && (
          <div className="p-6 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl space-y-4 text-xs leading-relaxed animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <Sparkles className="w-5 h-5" />
                <span>Statutory AI Advice & Legal Remedies</span>
              </div>
              <span className="font-mono text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                Ref: {consultation.statutory_reference}
              </span>
            </div>

            <div className="whitespace-pre-wrap text-slate-200 font-sans">
              {consultation.legal_advice}
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-400">
              <span className="italic">⚖️ {consultation.disclaimer}</span>
              <Link
                to={`/complaints?land_id=${encodeURIComponent(landId || '')}&subject=${encodeURIComponent('Legal Redressal: ' + question.slice(0, 50))}`}
                className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-lg shadow flex items-center space-x-1 shrink-0"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
                <span>File Grievance with this Context →</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
