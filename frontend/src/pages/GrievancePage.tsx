import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Send, Download, CheckCircle2, ShieldAlert, Activity } from 'lucide-react';

interface GrievancePageProps {
  onShowToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export const GrievancePage: React.FC<GrievancePageProps> = ({ onShowToast }) => {
  const [searchParams] = useSearchParams();
  const landIdParam = searchParams.get('land_id') || 'JH-BOK-CHA-KURA-K125-K450-2';
  const subjectParam = searchParams.get('subject') || 'Overdue Mutation SLA Delay & Owner Mismatch';

  const [userName, setUserName] = useState<string>('Ramesh Kumar Mahato');
  const [userMobile, setUserMobile] = useState<string>('9876543210');
  const [targetAuthority, setTargetAuthority] = useState<string>('Circle Officer (CO Chas)');
  const [landIdentityId, setLandIdentityId] = useState<string>(landIdParam);
  const [subject, setSubject] = useState<string>(subjectParam);
  const [complaintText, setComplaintText] = useState<string>(
    'The mutation application #JH-MUT-2026-10001 has been pending for 73 days, exceeding the statutory 30-day SLA. In addition, there is an unmutated sale deed discrepancy between recorded Khatian owner and Register-II tenant. Requesting urgent field revenue inspection and LRDC intervention.'
  );

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedComplaint, setSubmittedComplaint] = useState<any>(null);

  useEffect(() => {
    if (landIdParam) setLandIdentityId(landIdParam);
    if (subjectParam) setSubject(subjectParam);
  }, [landIdParam, subjectParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/complaints/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: userName,
          user_mobile: userMobile,
          target_authority: targetAuthority,
          land_identity_id: landIdentityId,
          subject: subject,
          complaint_text: complaintText
        })
      });
      const data = await res.json();
      setSubmittedComplaint(data);
      if (onShowToast) {
        onShowToast('success', 'Official Grievance Registered!', `Complaint ID #${data.complaint_id} routed to ${data.target_authority}`);
      }
    } catch (err) {
      console.error("Complaint submission failed", err);
      if (onShowToast) {
        onShowToast('error', 'Submission Failed', 'An error occurred while registering your complaint.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span>BhoomiShield Authority Grievance & Complaint Redressal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          File Official Land Revenue Complaint
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Submit formal grievances regarding mutation SLA delays, owner record tampering, or unmutated deeds directly to Circle Officers (CO), LRDC, or District Collector.
        </p>
      </div>

      {/* Submitted Success Notification Banner */}
      {submittedComplaint && (
        <div className="bg-emerald-50 dark:bg-emerald-950 p-6 rounded-3xl border border-emerald-300 dark:border-emerald-800 shadow-xl space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-emerald-900 dark:text-emerald-200 text-base">
                Official Grievance Registered #{submittedComplaint.complaint_id}
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Routed to <span className="font-bold">{submittedComplaint.target_authority}</span> • Submitted on {submittedComplaint.submitted_at}
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <a
              href={submittedComplaint.download_url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Signed Complaint PDF</span>
            </a>
          </div>
        </div>
      )}

      {/* Complaint Wizard Form */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Grievance Submission Form</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Complainant Full Name</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
              <input
                type="text"
                value={userMobile}
                onChange={e => setUserMobile(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Revenue Authority</label>
              <select
                value={targetAuthority}
                onChange={e => setTargetAuthority(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="Circle Officer (CO Chas)">Circle Officer (CO Chas, Bokaro)</option>
                <option value="Land Reforms Deputy Collector (LRDC)">Land Reforms Deputy Collector (LRDC Bokaro)</option>
                <option value="District Collector (DC Bokaro)">District Collector (DC / Magistrate)</option>
                <option value="Revenue Anti-Corruption Cell">Revenue Anti-Corruption Cell</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Land Identity ID</label>
              <input
                type="text"
                value={landIdentityId}
                onChange={e => setLandIdentityId(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Grievance Subject</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Detailed Statement & Evidence Request</label>
            <textarea
              value={complaintText}
              onChange={e => setComplaintText(e.target.value)}
              rows={4}
              required
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "Submitting Official Grievance..." : "File Formal Complaint & Generate PDF"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
