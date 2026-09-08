import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ApiKeyModal from './components/common/ApiKeyModal';

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

function AppLayout() {
  const location = useLocation();
  const isAssessmentRoute = location.pathname.startsWith('/assessment');

  return (
    <div className="app-container">
      {!isAssessmentRoute && <Navbar />}
      <ApiKeyModal />
      <main className={isAssessmentRoute ? "main-content-assessment" : "main-content"}>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/recruiter/upload" element={<RecruiterUploadPage />} />
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
    <AppProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  );
}
