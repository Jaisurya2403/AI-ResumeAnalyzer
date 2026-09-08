import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ApiKeyModal from './components/common/ApiKeyModal';
import AuthModal from './components/auth/AuthModal';

// Pages
import UploadPage from './pages/UploadPage';
import RecruiterUploadPage from './pages/RecruiterUploadPage';
import LeaderboardPage from './pages/LeaderboardPage';
import CandidateAssessmentPage from './pages/CandidateAssessmentPage';
import AnalyzingPage from './pages/AnalyzingPage';
import ResultsPage from './pages/ResultsPage';
import InterviewSetupPage from './pages/InterviewSetupPage';
import Round1Page from './pages/Round1Page';
import Round2Page from './pages/Round2Page';
import Round3Page from './pages/Round3Page';
import Round4Page from './pages/Round4Page';
import FinalReportPage from './pages/FinalReportPage';
import HistoryPage from './pages/HistoryPage';

import './styles/index.css';

function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, isAdmin, openAuthModal } = useAuth();

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Admin Access Required</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Please sign in with your administrator credentials to access Batch ZIP features.
        </p>
        <button onClick={() => openAuthModal('login')} className="btn-gold" style={{ padding: '0.75rem 1.5rem' }}>
          Sign In as Admin
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Restricted Area</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Batch ZIP upload and company management are reserved exclusively for Administrators.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
}

function AppLayout() {
  const location = useLocation();
  const isAssessmentRoute = location.pathname.startsWith('/assessment');

  return (
    <div className="app-container">
      {!isAssessmentRoute && <Navbar />}
      <ApiKeyModal />
      <AuthModal />
      <main className={isAssessmentRoute ? "main-content-assessment" : "main-content"}>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/recruiter/upload" element={
            <ProtectedAdminRoute>
              <RecruiterUploadPage />
            </ProtectedAdminRoute>
          } />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/assessment/:token" element={<CandidateAssessmentPage />} />
          <Route path="/analyzing" element={<AnalyzingPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/results/:id/report" element={<FinalReportPage />} />
          <Route path="/interview/setup" element={<InterviewSetupPage />} />
          <Route path="/interview/round1" element={<Round1Page />} />
          <Route path="/interview/round2" element={<Round2Page />} />
          <Route path="/interview/round3" element={<Round3Page />} />
          <Route path="/interview/round4" element={<Round4Page />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAssessmentRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
