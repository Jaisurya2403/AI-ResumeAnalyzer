import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Folder, 
  Briefcase, 
  ChevronRight, 
  ArrowLeft, 
  Download, 
  Search, 
  Trophy, 
  Mail, 
  FileText, 
  ExternalLink, 
  RefreshCw, 
  Users, 
  Sparkles, 
  Calendar, 
  Award, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  Archive,
  Layers,
  UserCheck,
  Lock,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import DownloadConfirmModal from '../components/common/DownloadConfirmModal';
import BackButton from '../components/common/BackButton';

export default function HistoryPage() {
  const { user, token, isAuthenticated, isAdmin, isUser, openAuthModal } = useAuth();

  const [currentLevel, setCurrentLevel] = useState(1); // 1: Companies, 2: Roles, 3: Dates, 4: Leaderboard
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateFormatted, setSelectedDateFormatted] = useState(null);

  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [dateBatches, setDateBatches] = useState([]);
  const [cohortLeaderboard, setCohortLeaderboard] = useState([]);

  // Personal Archive for Regular Users
  const [myHistory, setMyHistory] = useState([]);
  const [myLoading, setMyLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDownload, setConfirmDownload] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      fetchCompanies();
    } else if (isAuthenticated && user?.email) {
      fetchMyHistory();
    }
  }, [isAdmin, isAuthenticated, user]);

  const fetchMyHistory = async () => {
    setMyLoading(true);
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const params = new URLSearchParams();
      if (user?.email) params.append('email', user.email);
      if (user?.name) params.append('name', user.name);
      if (user?.username) params.append('username', user.username);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`http://localhost:8085/api/archive/my-history${queryString}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data?.evaluations) ? data.evaluations : []);
        setMyHistory(list);
      } else {
        setMyHistory([]);
      }
    } catch (err) {
      console.error("Error fetching personal history:", err);
      setMyHistory([]);
    } finally {
      setMyLoading(false);
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8085/api/archive/companies');
      if (res.ok) {
        const data = await res.json();
        setCompanies(Array.isArray(data) ? data : []);
      } else {
        setCompanies([]);
      }
    } catch (err) {
      console.error("Error fetching companies from backend:", err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCompany = async (companyName) => {
    setSelectedCompany(companyName);
    setSelectedRole(null);
    setSelectedDate(null);
    setCurrentLevel(2);
    setSearchTerm('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8085/api/archive/companies/${encodeURIComponent(companyName)}/roles`);
      if (res.ok) {
        const data = await res.json();
        setRoles(Array.isArray(data) ? data : []);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error("Error fetching roles from backend:", err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRole = async (roleName) => {
    setSelectedRole(roleName);
    setSelectedDate(null);
    setSearchTerm('');
    setLoading(true);

    if (roleName === "ALL") {
      setCurrentLevel(4);
      try {
        const res = await fetch(`http://localhost:8085/api/archive/companies/${encodeURIComponent(selectedCompany)}/roles/ALL/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          setCohortLeaderboard(Array.isArray(data) ? data : []);
        } else {
          setCohortLeaderboard([]);
        }
      } catch (err) {
        console.error("Error fetching company leaderboard:", err);
        setCohortLeaderboard([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    setCurrentLevel(3);
    try {
      const res = await fetch(`http://localhost:8085/api/archive/companies/${encodeURIComponent(selectedCompany)}/roles/${encodeURIComponent(roleName)}/dates`);
      if (res.ok) {
        const data = await res.json();
        setDateBatches(Array.isArray(data) ? data : []);
      } else {
        setDateBatches([]);
      }
    } catch (err) {
      console.error("Error fetching dates from backend:", err);
      setDateBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDate = async (dateObj) => {
    const dVal = typeof dateObj === 'string' ? dateObj : dateObj.date;
    const dFormatted = typeof dateObj === 'string' ? dateObj : (dateObj.formattedDate || dateObj.date);
    setSelectedDate(dVal);
    setSelectedDateFormatted(dFormatted);
    setCurrentLevel(4);
    setSearchTerm('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8085/api/archive/companies/${encodeURIComponent(selectedCompany)}/roles/${encodeURIComponent(selectedRole)}/dates/${encodeURIComponent(dVal)}/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setCohortLeaderboard(Array.isArray(data) ? data : []);
      } else {
        setCohortLeaderboard([]);
      }
    } catch (err) {
      console.error("Error fetching date leaderboard from backend:", err);
      setCohortLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAllDatesForRole = async () => {
    setSelectedDate("ALL");
    setSelectedDateFormatted("All Date Batches Combined");
    setCurrentLevel(4);
    setSearchTerm('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:8085/api/archive/companies/${encodeURIComponent(selectedCompany)}/roles/${encodeURIComponent(selectedRole)}/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setCohortLeaderboard(Array.isArray(data) ? data : []);
      } else {
        setCohortLeaderboard([]);
      }
    } catch (err) {
      console.error("Error fetching role leaderboard:", err);
      setCohortLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCohortPdf = async () => {
    if (!selectedCompany || !selectedRole) return;
    setIsExportingPdf(true);

    try {
      let url;
      let filename;
      if (selectedDate && selectedDate !== "ALL") {
        url = `http://localhost:8085/api/archive/companies/${encodeURIComponent(selectedCompany)}/roles/${encodeURIComponent(selectedRole)}/dates/${encodeURIComponent(selectedDate)}/export-pdf`;
        filename = `${selectedCompany.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedRole.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}_Leaderboard.pdf`;
      } else {
        url = `http://localhost:8085/api/archive/companies/${encodeURIComponent(selectedCompany)}/roles/${encodeURIComponent(selectedRole)}/export-pdf`;
        filename = `${selectedCompany.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedRole.replace(/[^a-zA-Z0-9]/g, '_')}_Leaderboard.pdf`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to generate Cohort Leaderboard PDF");

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("PDF export error:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const downloadBlobUrl = async (url, filename) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const bUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = bUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(bUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const triggerExportCohortPdfConfirm = () => {
    let url;
    let filename;
    if (selectedDate && selectedDate !== "ALL") {
      url = `http://localhost:8085/api/archive/companies/${encodeURIComponent(selectedCompany)}/roles/${encodeURIComponent(selectedRole)}/dates/${encodeURIComponent(selectedDate)}/export-pdf`;
      filename = `${(selectedCompany || 'Company').replace(/[^a-zA-Z0-9]/g, '_')}_${(selectedRole || 'Role').replace(/[^a-zA-Z0-9]/g, '_')}_${selectedDate}_Leaderboard.pdf`;
    } else {
      url = `http://localhost:8085/api/archive/companies/${encodeURIComponent(selectedCompany)}/roles/${encodeURIComponent(selectedRole)}/export-pdf`;
      filename = `${(selectedCompany || 'Company').replace(/[^a-zA-Z0-9]/g, '_')}_${(selectedRole || 'Role').replace(/[^a-zA-Z0-9]/g, '_')}_Leaderboard.pdf`;
    }

    setConfirmDownload({
      onView: () => window.open(url, '_blank'),
      onConfirm: () => handleExportCohortPdf(),
      title: "Export Cohort Leaderboard PDF",
      fileName: filename,
      fileType: "Batch Cohort Leaderboard PDF",
      details: [
        { label: "Company", value: selectedCompany || "N/A" },
        { label: "Role", value: selectedRole || "N/A" },
        { label: "Date Batch", value: selectedDateFormatted || selectedDate || "All Time" },
        { label: "Candidates", value: `${cohortLeaderboard.length} Candidates` }
      ]
    });
  };

  const triggerCandPdfConfirm = (cand) => {
    const cId = cand.candidateId || cand.id;
    const cName = cand.candidateName || cand.name || user?.name || 'Candidate';
    const cRole = cand.targetRole || cand.role || selectedRole || 'Assessment Role';
    const cComp = cand.targetCompany || cand.company || cand.companyName || selectedCompany || 'Company';
    const cScore = cand.overallScore || cand.score || 0;
    const url = `http://localhost:8085/api/archive/evaluations/${cId}/report-pdf`;
    const filename = `Assessment_Dossier_${cName.replace(/\s+/g, '_')}_${cRole.replace(/\s+/g, '_')}.pdf`;

    setConfirmDownload({
      onView: () => window.open(url, '_blank'),
      onConfirm: () => downloadBlobUrl(url, filename),
      title: "Candidate Assessment Dossier",
      fileName: filename,
      fileType: "Official Assessment Dossier (PDF)",
      details: [
        { label: "Candidate", value: cName },
        { label: "Target Role", value: cRole },
        { label: "Company", value: cComp },
        { label: "Overall Score", value: `${cScore}%` }
      ]
    });
  };

  const triggerCandResumeConfirm = (cand) => {
    const cId = cand.candidateId || cand.id;
    const cName = cand.candidateName || cand.name || 'Candidate';
    const url = `http://localhost:8085/api/resumes/${cId}/pdf`;
    const filename = `Resume_${cName.replace(/\s+/g, '_')}.pdf`;

    setConfirmDownload({
      onView: () => window.open(url, '_blank'),
      onConfirm: () => downloadBlobUrl(url, filename),
      title: "Candidate Original Resume",
      fileName: filename,
      fileType: "Original Uploaded Resume PDF",
      details: [
        { label: "Candidate", value: cName },
        { label: "Document", value: "Applicant Resume Submission" }
      ]
    });
  };

  const goToCompanies = () => {
    setCurrentLevel(1);
    setSelectedCompany(null);
    setSelectedRole(null);
    setSelectedDate(null);
    setSearchTerm('');
  };

  const goToRoles = () => {
    setCurrentLevel(2);
    setSelectedRole(null);
    setSelectedDate(null);
    setSearchTerm('');
  };

  const goToDates = () => {
    setCurrentLevel(3);
    setSelectedDate(null);
    setSearchTerm('');
  };

  // If user is a regular user (or non-admin authenticated), show their personal evaluation archive
  if (!isAdmin && isAuthenticated) {
    return (
      <div style={{ width: '100%', minHeight: '80vh', padding: '0 0.5rem' }}>
        {/* Top Left Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '1.25rem' }}>
          <BackButton to="/" label="Back to Home" />
        </div>

        {/* Personal Archive Hero */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            marginBottom: '1rem'
          }}>
            <UserCheck size={16} color="var(--gold-light)" />
            <span style={{ fontSize: '0.82rem', color: 'var(--gold-light)', fontWeight: 600, letterSpacing: '0.05em' }}>
              PERSONAL EVALUATION DOSSIER • {user?.name ? `${user.name.toUpperCase()} (${user?.email})` : user?.email}
            </span>
          </div>

          <h1 className="font-royal" style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 800, marginBottom: '0.75rem' }}>
            {user?.name ? `${user.name}'s` : 'My Candidate'} <span className="gold-text-gradient">Archive</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            Track your submitted resume analyses, live AI assessment results, and overall competency scores.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={fetchMyHistory}
              disabled={myLoading}
              className="btn-dark"
              style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} className={myLoading ? "spin" : ""} />
              <span>Refresh My Records</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', maxWidth: '540px', width: '100%' }}>
            <Search size={18} color="var(--gold-light)" style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search your evaluations by role or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1.2rem 0.85rem 3rem',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(10, 13, 20, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                color: '#fff',
                fontSize: '0.92rem',
                outline: 'none',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
              }}
            />
          </div>
        </div>

        {/* Content Table / Cards */}
        {(() => {
          const attendedHistory = myHistory.filter(cand => {
            const status = (cand.status || cand.assessmentStatus || '').toUpperCase();
            // Strictly include only assessments that the candidate actually attended
            return status === 'COMPLETED' || status === 'DISQUALIFIED' || status === 'EVALUATED' || status === 'TERMINATED' || (cand.assessmentScore !== null && cand.assessmentScore !== undefined);
          });

          if (myLoading) {
            return (
              <div className="royal-glass-card solid-border" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <RefreshCw size={32} className="spin" color="var(--gold-light)" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Loading your attended assessments from database...</p>
              </div>
            );
          }

          if (attendedHistory.length === 0) {
            return (
              <div className="royal-glass-card solid-border" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}>
                  <Award size={28} color="var(--gold-light)" />
                </div>
                <h3 className="font-royal" style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                  No Attended Assessments Yet
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                  You have not attended or submitted any AI interview assessments under your account ({user?.email}) yet. Complete an assessment to see your verified scores recorded here.
                </p>
                <Link to="/" className="btn-gold" style={{ padding: '0.75rem 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} />
                  <span>Start New Mock Assessment</span>
                </Link>
              </div>
            );
          }

          return (
            <div className="royal-glass-card solid-border" style={{ padding: '2rem', overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', background: 'rgba(5, 7, 10, 0.5)' }}>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)' }}>DATE</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)' }}>NAME / EMAIL</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)' }}>TARGET ROLE</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)' }}>COMPANY</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)', textAlign: 'center' }}>ATS SCORE</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)', textAlign: 'center' }}>ASSESSMENT</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)', textAlign: 'center' }}>OVERALL SCORE</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)', textAlign: 'center' }}>STATUS</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)', textAlign: 'center' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {attendedHistory
                    .filter(c => 
                      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (c.targetRole || c.jobRole || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((cand, idx) => {
                      const cId = cand.candidateId || cand.id;
                      const cRole = cand.targetRole || cand.jobRole || 'Fullstack Engineer';
                      const cAts = cand.resumeScore != null ? cand.resumeScore : (cand.atsScore != null ? cand.atsScore : 'N/A');
                      const cStatus = cand.status || cand.assessmentStatus || 'COMPLETED';
                      
                      return (
                        <tr
                          key={cId || idx}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'background-color 0.2s',
                            background: idx % 2 === 1 ? 'rgba(255, 255, 255, 0.015)' : 'transparent'
                          }}
                        >
                          <td style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {cand.createdAt ? new Date(cand.createdAt).toLocaleDateString() : 'Recent'}
                          </td>

                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                              {(!cand.name || cand.name.trim().toLowerCase() === 'candidate') 
                                ? (user?.name || cand.email?.split('@')[0] || 'Candidate') 
                                : cand.name}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{cand.email}</div>
                          </td>

                          <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                            {cRole}
                          </td>

                          <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                            {cand.companyName || 'Standard'}
                          </td>

                          <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                            <span style={{ color: 'var(--gold-light)', fontWeight: 700, fontSize: '0.95rem' }}>
                              {cAts !== 'N/A' ? `${cAts}%` : 'N/A'}
                            </span>
                          </td>

                          <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                            {cand.assessmentScore != null ? (
                              <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.95rem' }}>
                                {cand.assessmentScore}%
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                0%
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                            {cand.overallScore != null ? (
                              <div style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.75rem',
                                borderRadius: 'var(--radius-full)',
                                background: 'rgba(212, 175, 55, 0.15)',
                                border: '1px solid var(--gold-light)',
                                color: 'var(--gold-light)',
                                fontWeight: 800,
                                fontSize: '1rem',
                                boxShadow: '0 0 10px rgba(212, 175, 55, 0.2)'
                              }}>
                                {cand.overallScore}%
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                                0%
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '1rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            {cStatus === 'COMPLETED' ? (
                              <span className="badge-emerald" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                                <CheckCircle2 size={13} /> <span>Evaluated</span>
                              </span>
                            ) : cStatus === 'DISQUALIFIED' ? (
                              <span style={{
                                fontSize: '0.75rem',
                                color: '#f87171',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid #ef4444',
                                padding: '0.25rem 0.75rem',
                                borderRadius: 'var(--radius-full)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                whiteSpace: 'nowrap'
                              }}>
                                Terminated
                              </span>
                            ) : (
                              <span className="badge-gold" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                                <Clock size={13} /> <span>In Progress</span>
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '1rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', flexWrap: 'nowrap' }}>
                              <Link
                                to={`/results/${cId}/report`}
                                className="btn-gold"
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  fontSize: '0.75rem',
                                  borderRadius: 'var(--radius-sm)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  textDecoration: 'none',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                <Award size={13} />
                                <span>View Report</span>
                              </Link>
                              <button
                                onClick={() => triggerCandPdfConfirm({
                                  candidateId: cId,
                                  candidateName: cand.candidateName || user?.name || 'Candidate',
                                  targetRole: cand.targetRole || cand.role || 'Assessment Role',
                                  targetCompany: cand.companyName || cand.company || 'Company',
                                  overallScore: cand.overallScore || cand.score || 0
                                })}
                                className="btn-dark"
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  fontSize: '0.75rem',
                                  borderRadius: 'var(--radius-sm)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  cursor: 'pointer'
                                }}
                                title="Download Candidate Assessment Dossier PDF"
                              >
                                <FileText size={13} color="var(--gold-light)" />
                                <span>PDF</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          );
        })()}

        {/* Confirmation Modal */}
        {confirmDownload && (
          <DownloadConfirmModal
            isOpen={Boolean(confirmDownload)}
            onClose={() => setConfirmDownload(null)}
            onConfirm={confirmDownload.onConfirm}
            onView={confirmDownload.onView}
            title={confirmDownload.title}
            fileName={confirmDownload.fileName}
            fileType={confirmDownload.fileType}
            details={confirmDownload.details}
          />
        )}
      </div>
    );
  }

  // If unauthenticated guest, require login and DO NOT expose admin / corporate records
  if (!isAuthenticated) {
    return (
      <div style={{ width: '100%', minHeight: '80vh', padding: '0 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '640px', display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
          <BackButton to="/" label="Back to Home" />
        </div>
        <div className="royal-glass-card solid-border" style={{ maxWidth: '640px', width: '100%', padding: '3.5rem 2.5rem', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1.5px solid var(--gold-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 25px rgba(212, 175, 55, 0.25)'
          }}>
            <Lock size={28} color="var(--gold-light)" />
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.8rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            marginBottom: '1rem'
          }}>
            <ShieldCheck size={14} color="var(--gold-light)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)', fontWeight: 700, letterSpacing: '0.06em' }}>
              SECURE ASSESSMENT ARCHIVE
            </span>
          </div>

          <h2 className="font-royal" style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, marginBottom: '0.85rem' }}>
            Authentication <span className="gold-text-gradient">Required</span>
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '480px', margin: '0 auto 2rem' }}>
            Sign in to access your personal test evaluations and ATS dossiers, or sign in with administrator credentials for corporate hiring records.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => openAuthModal('login')}
              className="btn-gold"
              style={{ padding: '0.85rem 2rem', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <LogIn size={17} />
              <span>Sign In to Access Archive</span>
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="btn-dark"
              style={{ padding: '0.85rem 1.8rem', fontSize: '0.95rem' }}
            >
              <span>Create Candidate Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Corporate Recruitment Hierarchy (Accessible only when isAuthenticated && isAdmin)
  return (
    <div style={{ width: '100%', minHeight: '80vh', padding: '0 0.5rem' }}>
      {/* Top Header Navigation: Responsive Left-Aligned Back Button & Centered Breadcrumbs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        marginBottom: '2.25rem',
        width: '100%'
      }}>
        {/* Back Button */}
        {currentLevel > 1 ? (
          <BackButton
            onClick={
              currentLevel === 2 ? goToCompanies :
              currentLevel === 3 ? goToRoles :
              (selectedRole === "ALL" ? goToCompanies : goToDates)
            }
            label="Back"
          />
        ) : (
          <BackButton to="/" label="Back to Home" />
        )}

        {/* Breadcrumb Navigation Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.65rem 1.25rem',
          background: 'rgba(14, 18, 28, 0.75)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.88rem',
          maxWidth: '100%',
          margin: currentLevel > 1 ? '0' : '0 auto'
        }}>
          <button
            onClick={goToCompanies}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentLevel === 1 ? 'var(--gold-light)' : 'var(--text-secondary)',
              fontWeight: currentLevel === 1 ? 700 : 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px'
            }}
          >
            <Archive size={16} color="var(--gold-light)" />
            <span>Archive Root (Companies)</span>
          </button>

          {currentLevel >= 2 && selectedCompany && (
            <>
              <ChevronRight size={15} color="var(--gold-muted)" />
              <button
                onClick={goToRoles}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: currentLevel === 2 ? 'var(--gold-light)' : 'var(--text-secondary)',
                  fontWeight: currentLevel === 2 ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px'
                }}
              >
                <Building2 size={16} color="var(--gold-light)" />
                <span>{selectedCompany}</span>
              </button>
            </>
          )}

          {currentLevel >= 3 && selectedRole && (
            <>
              <ChevronRight size={15} color="var(--gold-muted)" />
              <button
                onClick={goToDates}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: currentLevel === 3 ? 'var(--gold-light)' : 'var(--text-secondary)',
                  fontWeight: currentLevel === 3 ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px'
                }}
              >
                <Briefcase size={16} color="var(--gold-light)" />
                <span>{selectedRole === "ALL" ? "All Roles" : selectedRole}</span>
              </button>
            </>
          )}

          {currentLevel === 4 && selectedDate && (
            <>
              <ChevronRight size={15} color="var(--gold-muted)" />
              <span style={{
                color: 'var(--gold-light)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.2rem 0.5rem'
              }}>
                <Calendar size={16} color="var(--gold-light)" />
                <span>{selectedDateFormatted || selectedDate}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEVEL 1: ROOT COMPANIES DIRECTORY */}
      {/* ========================================================================= */}
      {currentLevel === 1 && (
        <div style={{ width: '100%' }}>
          {/* Centered Hero Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.95rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.35)',
              marginBottom: '1rem'
            }}>
              <Archive size={15} color="var(--gold-light)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--gold-light)', fontWeight: 600, letterSpacing: '0.05em' }}>
                HIERARCHICAL RECRUITMENT ARCHIVE
              </span>
            </div>

            <h1 className="font-royal" style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 800, marginBottom: '0.75rem' }}>
              Company <span className="gold-text-gradient">Root Folders</span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '720px', margin: '0 auto 1.75rem', lineHeight: '1.6' }}>
              Select a hiring organization folder to browse specific job roles and date-wise evaluation batches.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={fetchCompanies}
                className="btn-dark"
                style={{ padding: '0.75rem 1.4rem', fontSize: '0.88rem' }}
                title="Refresh companies"
              >
                <RefreshCw size={15} />
                <span>Refresh Archive</span>
              </button>

              <Link to="/recruiter/upload" className="btn-gold" style={{ padding: '0.75rem 1.5rem' }}>
                <span>Upload New Batch ZIP</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {/* Centered Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div style={{ position: 'relative', maxWidth: '540px', width: '100%' }}>
              <Search size={18} color="var(--gold-light)" style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search company folder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.2rem 0.85rem 3rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(10, 13, 20, 0.85)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  color: '#fff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                }}
              />
            </div>
          </div>

          {/* Companies Grid - Centered & Fit Screen */}
          {loading ? (
            <div className="royal-glass-card solid-border" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <RefreshCw size={32} className="spin" color="var(--gold-light)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>Scanning recruitment archive from database...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="royal-glass-card solid-border" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <Archive size={28} color="var(--gold-light)" />
              </div>
              <h3 className="font-royal" style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                No Archived Companies Found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto 1.5rem' }}>
                No candidate batches have been uploaded to the database yet. Configure a hiring campaign with Company Name, Role, and Expiry Date to create company folders.
              </p>
              <Link to="/recruiter/upload" className="btn-gold">
                <span>Upload Batch ZIP Now</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 400px))',
              justifyContent: 'center',
              gap: '2rem',
              width: '100%'
            }}>
              {companies
                .filter(c => (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()))
                .map((comp, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOpenCompany(comp.companyName)}
                    className="royal-glass-card solid-border interactive-folder-card"
                    style={{
                      padding: '2rem 1.75rem',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(10, 13, 20, 0.9) 100%)',
                      borderColor: 'rgba(212, 175, 55, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'var(--gold-light)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(212, 175, 55, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 16px rgba(212, 175, 55, 0.2)'
                      }}>
                        <Folder size={28} color="var(--gold-light)" />
                      </div>

                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--gold-light)',
                        background: 'rgba(212, 175, 55, 0.12)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600
                      }}>
                        ROOT FOLDER
                      </span>
                    </div>

                    <h3 className="font-royal" style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 800, marginBottom: '0.65rem' }}>
                      {comp.companyName}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Briefcase size={14} color="var(--gold-light)" />
                        <span><strong>{comp.roleCount || comp.roles?.length || 1}</strong> Job Roles</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={14} color="var(--gold-light)" />
                        <span><strong>{comp.candidateCount || 0}</strong> Candidates</span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(212, 175, 55, 0.15)',
                      color: 'var(--gold-light)',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      <span>Explore Role Subfolders</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 2: SUBFOLDERS OF ROLES */}
      {/* ========================================================================= */}
      {currentLevel === 2 && (
        <div style={{ width: '100%' }}>
          {/* Centered Hero Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 className="font-royal" style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 800, marginBottom: '0.75rem' }}>
              <span className="gold-text-gradient">{selectedCompany}</span> Role Subfolders
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '720px', margin: '0 auto 1.75rem', lineHeight: '1.6' }}>
              Select a specific job role to explore its date-wise hiring batches and candidate evaluations.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleOpenRole("ALL")}
                className="btn-gold"
                style={{ padding: '0.75rem 1.6rem' }}
              >
                <Trophy size={16} />
                <span>View Combined Company Leaderboard</span>
              </button>
            </div>
          </div>

          {/* Centered Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div style={{ position: 'relative', maxWidth: '540px', width: '100%' }}>
              <Search size={18} color="var(--gold-light)" style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search job role subfolder..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.2rem 0.85rem 3rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(10, 13, 20, 0.85)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  color: '#fff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                }}
              />
            </div>
          </div>

          {/* Roles Subfolder Grid - Centered & Fit Screen */}
          {loading ? (
            <div className="royal-glass-card solid-border" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <RefreshCw size={32} className="spin" color="var(--gold-light)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading roles for {selectedCompany} from database...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="royal-glass-card solid-border" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <Briefcase size={28} color="var(--gold-light)" />
              </div>
              <h3 className="font-royal" style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                No Role Subfolders Found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                No job roles have been recorded for {selectedCompany} in the database yet.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 400px))',
              justifyContent: 'center',
              gap: '2rem',
              width: '100%'
            }}>
              {roles
                .filter(r => (r.roleName || '').toLowerCase().includes(searchTerm.toLowerCase()))
                .map((roleObj, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOpenRole(roleObj.roleName)}
                    className="royal-glass-card solid-border interactive-folder-card"
                    style={{
                      padding: '1.85rem 1.6rem',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.06) 0%, rgba(10, 13, 20, 0.92) 100%)',
                      borderColor: 'rgba(212, 175, 55, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'var(--gold-light)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(212, 175, 55, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '14px',
                        background: 'rgba(212, 175, 55, 0.12)',
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Briefcase size={24} color="var(--gold-light)" />
                      </div>

                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--gold-light)',
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600
                      }}>
                        ROLE SUBFOLDER
                      </span>
                    </div>

                    <h3 className="font-royal" style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, marginBottom: '0.5rem' }}>
                      {roleObj.roleName}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} color="var(--gold-light)" />
                        <span><strong>{roleObj.dateCount || 1}</strong> Date Batches</span>
                      </div>
                      <span>•</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={13} color="var(--gold-light)" />
                        <span><strong>{roleObj.candidateCount || 0}</strong> Candidates</span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid rgba(212, 175, 55, 0.15)',
                      color: 'var(--gold-light)',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      <span>Browse Date Batches</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 3: DATE-WISE SUBFOLDERS */}
      {/* ========================================================================= */}
      {currentLevel === 3 && (
        <div style={{ width: '100%' }}>
          {/* Centered Hero Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge-gold">
                <Building2 size={13} /> {selectedCompany}
              </span>
              <span className="badge-gold">
                <Briefcase size={13} /> {selectedRole}
              </span>
            </div>

            <h1 className="font-royal" style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 800, marginBottom: '0.75rem' }}>
              <span className="gold-text-gradient">{selectedRole}</span> Date Batches
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '720px', margin: '0 auto 1.75rem', lineHeight: '1.6' }}>
              Select a specific date subfolder to view the leaderboard for that campaign date, or view all dates combined.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleOpenAllDatesForRole}
                className="btn-gold"
                style={{ padding: '0.75rem 1.6rem' }}
              >
                <Trophy size={16} />
                <span>View All Dates Combined Leaderboard</span>
              </button>
            </div>
          </div>

          {/* Centered Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div style={{ position: 'relative', maxWidth: '540px', width: '100%' }}>
              <Search size={18} color="var(--gold-light)" style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search date batch (e.g. 2026-09-08, Sep)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.2rem 0.85rem 3rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(10, 13, 20, 0.85)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  color: '#fff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                }}
              />
            </div>
          </div>

          {/* Date Batches Grid - Centered & Fit Screen */}
          {loading ? (
            <div className="royal-glass-card solid-border" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <RefreshCw size={32} className="spin" color="var(--gold-light)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading date batches for {selectedRole}...</p>
            </div>
          ) : dateBatches.length === 0 ? (
            <div className="royal-glass-card solid-border" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <Calendar size={28} color="var(--gold-light)" />
              </div>
              <h3 className="font-royal" style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                No Date Batches Found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                No candidate batches have been uploaded for {selectedRole} at {selectedCompany} yet.
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 420px))',
              justifyContent: 'center',
              gap: '2rem',
              width: '100%'
            }}>
              {dateBatches
                .filter(d => 
                  (d.date || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (d.formattedDate || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((dateObj, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleOpenDate(dateObj)}
                    className="royal-glass-card solid-border interactive-folder-card"
                    style={{
                      padding: '2rem 1.75rem',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(10, 13, 20, 0.92) 100%)',
                      borderColor: 'rgba(212, 175, 55, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'var(--gold-light)';
                      e.currentTarget.style.boxShadow = '0 12px 30px rgba(212, 175, 55, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '16px',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 16px rgba(212, 175, 55, 0.2)'
                      }}>
                        <Calendar size={26} color="var(--gold-light)" />
                      </div>

                      <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--gold-light)',
                        background: 'rgba(212, 175, 55, 0.12)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        padding: '0.25rem 0.7rem',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600
                      }}>
                        DATE BATCH
                      </span>
                    </div>

                    <h3 className="font-royal" style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 800, marginBottom: '0.35rem' }}>
                      {dateObj.formattedDate || dateObj.date}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                      Batch Date Identifier: {dateObj.date}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={14} color="var(--gold-light)" />
                        <span><strong>{dateObj.candidateCount || 0}</strong> Candidates</span>
                      </div>
                      <span>•</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} color="var(--accent-emerald)" />
                        <span><strong>{dateObj.completedCount || 0}</strong> Evaluated</span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(212, 175, 55, 0.15)',
                      color: 'var(--gold-light)',
                      fontSize: '0.88rem',
                      fontWeight: 600
                    }}>
                      <span>View Date Leaderboard</span>
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* LEVEL 4: COHORT DEDICATED LEADERBOARD */}
      {/* ========================================================================= */}
      {currentLevel === 4 && (
        <div style={{ width: '100%' }}>
          {/* Centered Hero Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span className="badge-gold">
                <Building2 size={13} /> {selectedCompany}
              </span>
              <span className="badge-gold">
                <Briefcase size={13} /> {selectedRole === "ALL" ? "All Roles Combined" : selectedRole}
              </span>
              {selectedDate && selectedDate !== "ALL" && (
                <span className="badge-gold">
                  <Calendar size={13} /> {selectedDateFormatted || selectedDate}
                </span>
              )}
            </div>

            <h1 className="font-royal" style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 800, marginBottom: '0.75rem' }}>
              Cohort <span className="gold-text-gradient">Leaderboard Dossier</span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '720px', margin: '0 auto 1.75rem', lineHeight: '1.6' }}>
              Ranked evaluation of all candidates assessed for {selectedRole === "ALL" ? "all roles" : selectedRole} at {selectedCompany}
              {selectedDate && selectedDate !== "ALL" ? ` on ${selectedDateFormatted || selectedDate}` : ""}.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={triggerExportCohortPdfConfirm}
                disabled={isExportingPdf}
                className="btn-gold"
                style={{ padding: '0.75rem 1.6rem' }}
              >
                <Download size={16} />
                <span>{isExportingPdf ? "Generating PDF..." : "Export Batch PDF"}</span>
              </button>
            </div>
          </div>

          {/* Centered Search Filter inside Cohort */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div style={{ position: 'relative', maxWidth: '540px', width: '100%' }}>
              <Search size={18} color="var(--gold-light)" style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Filter candidates by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1.2rem 0.85rem 3rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(10, 13, 20, 0.85)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  color: '#fff',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                }}
              />
            </div>
          </div>

          {/* Leaderboard Table Card - Full Width Fit */}
          {loading ? (
            <div className="royal-glass-card solid-border" style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <RefreshCw size={32} className="spin" color="var(--gold-light)" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>Fetching cohort leaderboard from database...</p>
            </div>
          ) : cohortLeaderboard.length === 0 ? (
            <div className="royal-glass-card solid-border" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(212, 175, 55, 0.1)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem'
              }}>
                <Trophy size={28} color="var(--gold-light)" />
              </div>
              <h3 className="font-royal" style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
                No Candidates Evaluated Yet
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto' }}>
                No candidate records were found in the database for this date cohort.
              </p>
            </div>
          ) : (
            <div className="royal-glass-card solid-border" style={{ padding: '2rem', overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', background: 'rgba(5, 7, 10, 0.5)' }}>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)', width: '70px' }}>RANK</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)' }}>CANDIDATE</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)' }}>TARGET ROLE</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)', textAlign: 'center' }}>ATS RESUME</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)', textAlign: 'center' }}>ASSESSMENT</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)', textAlign: 'center' }}>OVERALL SCORE</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)', textAlign: 'center' }}>STATUS</th>
                    <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--gold-light)', textAlign: 'center' }}>RESUME PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortLeaderboard
                    .slice()
                    .sort((a, b) => {
                      const aHas = a.overallScore != null;
                      const bHas = b.overallScore != null;
                      if (aHas && bHas) return b.overallScore - a.overallScore;
                      if (aHas) return -1;
                      if (bHas) return 1;
                      return (b.resumeScore || 0) - (a.resumeScore || 0);
                    })
                    .filter(c => 
                      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((cand, idx) => (
                    <tr
                      key={cand.candidateId || idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background-color 0.2s',
                        background: idx % 2 === 1 ? 'rgba(255, 255, 255, 0.015)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          background: idx === 0 ? 'linear-gradient(135deg, #ffd700, #b8860b)' :
                                      idx === 1 ? 'linear-gradient(135deg, #e2e8f0, #94a3b8)' :
                                      idx === 2 ? 'linear-gradient(135deg, #d97706, #92400e)' :
                                      'rgba(255, 255, 255, 0.06)',
                          color: idx < 3 ? '#07080c' : 'var(--text-secondary)',
                          border: idx < 3 ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                          boxShadow: idx === 0 ? '0 0 12px rgba(255, 215, 0, 0.5)' : 'none'
                        }}>
                          #{idx + 1}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{cand.name}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{cand.email}</div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        {cand.targetRole}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <span style={{ color: 'var(--gold-light)', fontWeight: 700, fontSize: '0.95rem' }}>
                          {cand.resumeScore != null ? `${cand.resumeScore}%` : 'N/A'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        {cand.assessmentScore != null ? (
                          <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.95rem' }}>
                            {cand.assessmentScore}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Pending
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        {cand.assessmentScore != null && cand.overallScore != null ? (
                          <div style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            background: 'rgba(212, 175, 55, 0.15)',
                            border: '1px solid var(--gold-light)',
                            color: 'var(--gold-light)',
                            fontWeight: 800,
                            fontSize: '1rem',
                            boxShadow: '0 0 10px rgba(212, 175, 55, 0.2)'
                          }}>
                            {cand.overallScore}%
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Pending
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {cand.status === 'COMPLETED' ? (
                          <span className="badge-emerald" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                            <CheckCircle2 size={13} /> <span>Evaluated</span>
                          </span>
                        ) : cand.status === 'DISQUALIFIED' ? (
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#f87171',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid #ef4444',
                            padding: '0.25rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap'
                          }}>
                            Terminated (0%)
                          </span>
                        ) : (
                          <span className="badge-gold" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                            <Clock size={13} /> <span>Pending Assessment</span>
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', flexWrap: 'nowrap' }}>
                          <Link
                            to={`/results/${cand.candidateId}/report`}
                            className="btn-gold"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              textDecoration: 'none',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Award size={13} />
                            <span>Report</span>
                          </Link>
                          <button
                            onClick={() => triggerCandPdfConfirm(cand)}
                            className="btn-dark"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer'
                            }}
                            title="Download Assessment Dossier PDF"
                          >
                            <FileText size={13} color="var(--gold-light)" />
                            <span>PDF</span>
                          </button>
                          <button
                            onClick={() => triggerCandResumeConfirm(cand)}
                            className="btn-dark"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '0.35rem 0.55rem',
                              fontSize: '0.72rem',
                              borderRadius: 'var(--radius-sm)',
                              opacity: 0.8,
                              cursor: 'pointer'
                            }}
                            title="View Original Uploaded Resume"
                          >
                            <ExternalLink size={11} color="var(--gold-muted)" />
                            <span>Resume</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDownload && (
        <DownloadConfirmModal
          isOpen={Boolean(confirmDownload)}
          onClose={() => setConfirmDownload(null)}
          onConfirm={confirmDownload.onConfirm}
          onView={confirmDownload.onView}
          title={confirmDownload.title}
          fileName={confirmDownload.fileName}
          fileType={confirmDownload.fileType}
          details={confirmDownload.details}
        />
      )}

    </div>
  );
}
