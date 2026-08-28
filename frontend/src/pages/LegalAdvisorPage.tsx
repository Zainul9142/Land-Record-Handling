import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Scale, Send, Sparkles, BookOpen, AlertTriangle, ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react';

interface LegalAdvisorPageProps {
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const LegalAdvisorPage: React.FC<LegalAdvisorPageProps> = ({ onShowToast }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const landIdParam = searchParams.get('land_id') || '';

  const [question, setQuestion] = useState<string>('');
  const [landId, setLandId] = useState<string>(landIdParam);
  const [loading, setLoading] = useState<boolean>(false);
  const [consultation, setConsultation] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'CNT' | 'MUTATION' | 'DEED'>('ALL');

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
        body: JSON.stringify({ question: qToAsk, land_identity_id: targetLandId || landId })
      });
      const data = await res.json();
      setConsultation(data);
      if (onShowToast) {
        onShowToast('info', 'Legal Analysis Ready', `Consulted ${data.statutory_reference}`);
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
      category: 'CNT',
      title: "Tribal Land Transfer (CNT Act Section 46)",
      question: "Can tribal land under CNT Act Section 46 be sold or transferred to non-STs in Jharkhand?"
    },
    {
      category: 'MUTATION',
      title: "Mutation Delay Past 30-Day SLA",
      question: "What legal action can I take if Circle Officer delays mutation past statutory 30-day SLA?"
    },
    {
      category: 'DEED',
      title: "Unmutated Deed Legal Validity",
      question: "What is the legal validity of a registered sale deed if Register-II is not mutated?"
    },
    {
      category: 'MUTATION',
      title: "Partition Suit & Appeal Section 7",
      question: "How to file a land partition suit or challenge illegal mutation before LRDC under Section 7?"
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
          <Scale className="w-4 h-4 text-emerald-500" />
          <span>Indian Land Law & Jharkhand Statutory Acts AI Advisor</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          BhoomiShield Legal AI Advisor
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Expert legal advice grounded in the <b>Chota Nagpur Tenancy (CNT) Act 1908</b>, <b>Santhal Parganas Tenancy (SPT) Act 1949</b>, <b>Jharkhand Land Mutation Rules 2011</b>, <b>Registration Act 1908</b>, and <b>Specific Relief Act</b>.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center space-x-2 text-xs">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${activeCategory === 'ALL' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          All Templates
        </button>
        <button
          onClick={() => setActiveCategory('CNT')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${activeCategory === 'CNT' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          CNT / SPT Tribal Rights
        </button>
        <button
          onClick={() => setActiveCategory('MUTATION')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${activeCategory === 'MUTATION' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          Mutation & SLA Delay
        </button>
        <button
          onClick={() => setActiveCategory('DEED')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${activeCategory === 'DEED' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
        >
          Deed & Registration
        </button>
      </div>

      {/* Template Prompts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {filteredTemplates.map((t, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuestion(t.question);
              handleConsult(undefined, t.question);
            }}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:border-emerald-500/60 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1 text-[10px] uppercase font-bold">
              <span>{t.title}</span>
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              {t.question}
            </p>
          </button>
        ))}
      </div>

      {/* Consultation Input Form */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <form onSubmit={e => handleConsult(e)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ask your legal land question or statutory query:
              </label>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Optional Land Identity ID:
              </label>
              <input
                type="text"
                value={landId}
                onChange={e => setLandId(e.target.value)}
                placeholder="e.g. JH-BOK-CHA-KURA-K125-K450-2"
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="relative">
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. Is a power of attorney valid for transferring raiyati land under CNT Act Section 46?"
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
            <span>{loading ? "Consulting Indian & Jharkhand Statutory Acts..." : "Consult AI Legal Advisor"}</span>
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
                to={`/complaints?land_id=${encodeURIComponent(landId || '')}&subject=${encodeURIComponent('Legal Remedy Request: ' + question.slice(0, 50))}`}
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
