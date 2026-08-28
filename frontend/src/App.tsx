import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LandSearchPage } from './pages/LandSearchPage';
import { LandProfilePage } from './pages/LandProfilePage';
import { CheckBeforeYouBuy } from './pages/CheckBeforeYouBuy';
import { MutationTrackerPage } from './pages/MutationTrackerPage';
import { ReportVerificationPage } from './pages/ReportVerificationPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LegalAdvisorPage } from './pages/LegalAdvisorPage';
import { GrievancePage } from './pages/GrievancePage';
import { ToastContainer, ToastMessage } from './components/Toast';

export const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [userRole, setUserRole] = useState<string>('CITIZEN');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <Navbar lang={lang} setLang={setLang} userRole={userRole} setUserRole={setUserRole} />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage lang={lang} />} />
            <Route path="/search" element={<LandSearchPage lang={lang} onShowToast={showToast} />} />
            <Route path="/land/:landIdentityId" element={<LandProfilePage lang={lang} onShowToast={showToast} />} />
            <Route path="/legal-advisor" element={<LegalAdvisorPage onShowToast={showToast} />} />
            <Route path="/complaints" element={<GrievancePage onShowToast={showToast} />} />
            <Route path="/check-buy" element={<CheckBeforeYouBuy />} />
            <Route path="/track-mutation" element={<MutationTrackerPage />} />
            <Route path="/track-mutation/:appNo" element={<MutationTrackerPage />} />
            <Route path="/verify/:reportId" element={<ReportVerificationPage />} />
            <Route path="/admin" element={<AdminDashboard userRole={userRole} />} />
          </Routes>
        </main>

        <Footer />
        <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      </div>
    </Router>
  );
};

export default App;
