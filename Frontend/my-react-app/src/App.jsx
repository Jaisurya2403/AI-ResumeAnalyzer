import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ApiKeyModal from './components/common/ApiKeyModal';

// Pages
import UploadPage from './pages/UploadPage';
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

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <ApiKeyModal />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<UploadPage />} />
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
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
