import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
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
import { AuthPage } from './pages/AuthPage';
import { UserVaultPage } from './pages/UserVaultPage';
import { OfficialWorkspacePage } from './pages/OfficialWorkspacePage';
import { ValuationCalculatorPage } from './pages/ValuationCalculatorPage';
import { ToastContainer, ToastMessage } from './components/Toast';

export const App: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <Navbar />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<LandSearchPage onShowToast={showToast} />} />
                <Route path="/land/:landIdentityId" element={<LandProfilePage onShowToast={showToast} />} />
                <Route path="/login" element={<AuthPage onShowToast={showToast} />} />
                <Route path="/register" element={<AuthPage onShowToast={showToast} />} />
                <Route path="/auth" element={<AuthPage onShowToast={showToast} />} />
                <Route path="/vault" element={<UserVaultPage onShowToast={showToast} />} />
                <Route path="/official" element={<OfficialWorkspacePage onShowToast={showToast} />} />
                <Route path="/legal-advisor" element={<LegalAdvisorPage onShowToast={showToast} />} />
                <Route path="/complaints" element={<GrievancePage onShowToast={showToast} />} />
                <Route path="/valuation" element={<ValuationCalculatorPage onShowToast={showToast} />} />
                <Route path="/check-buy" element={<CheckBeforeYouBuy />} />
                <Route path="/track-mutation" element={<MutationTrackerPage />} />
                <Route path="/track-mutation/:appNo" element={<MutationTrackerPage />} />
                <Route path="/verify/:reportId" element={<ReportVerificationPage />} />
                <Route path="/admin" element={<AdminDashboard onShowToast={showToast} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />
            <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
