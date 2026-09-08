import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, Search, Download, FileText, ExternalLink, RefreshCw, CheckCircle2, Clock, Filter, ArrowUpRight, Sparkles, Award } from 'lucide-react';

export default function LeaderboardPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isExporting, setIsExporting] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8085/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      } else {
        // Fallback demo data if backend is offline
        loadFallbackLeaderboard();
      }
    } catch (err) {
      console.warn("Backend not reached, loading mock leaderboard:", err);
      loadFallbackLeaderboard();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackLeaderboard = () => {
    setCandidates([
      {
        rank: 1,
        candidateId: 101,
        name: "Alexander Vance",
        email: "alex.vance@techdev.io",
        targetRole: "Full Stack Engineer",
        resumeScore: 92.0,
        assessmentScore: 94.5,
        overallScore: 93.6,
        status: "COMPLETED",
        resumeViewUrl: "#",
        createdAt: "2026-09-08T10:30:00"
      },
      {
        rank: 2,
        candidateId: 102,
        name: "Dr. Elena Rostova",
        email: "elena.rostova@deepmind-labs.org",
        targetRole: "AI / ML Engineer",
        resumeScore: 96.0,
        assessmentScore: 91.0,
        overallScore: 92.8,
        status: "COMPLETED",
        resumeViewUrl: "#",
        createdAt: "2026-09-08T11:15:00"
      },
      {
        rank: 3,
        candidateId: 103,
        name: "Marcus Sterling",
        email: "marcus.sterling@devops.net",
        targetRole: "Backend Developer",
        resumeScore: 86.0,
        assessmentScore: 88.0,
        overallScore: 87.3,
        status: "COMPLETED",
        resumeViewUrl: "#",
        createdAt: "2026-09-08T12:00:00"
      },
      {
        rank: 4,
        candidateId: 104,
        name: "Sophia Chen",
        email: "sophia.chen@hardware-core.io",
        targetRole: "Embedded Systems Engineer",
        resumeScore: 84.0,
        assessmentScore: null,
        overallScore: 84.0,
        status: "INVITED",
        resumeViewUrl: "#",
        createdAt: "2026-09-08T13:45:00"
      }
    ]);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('http://localhost:8085/api/leaderboard/export-pdf');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EVAL_AI_Leaderboard_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert("Unable to generate PDF directly from backend. Printing view...");
        window.print();
      }
    } catch {
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const filtered = candidates.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesRole = roleFilter === 'ALL' || (c.targetRole || '').includes(roleFilter);
    return matchesSearch && matchesStatus && matchesRole;
  });

  const uniqueRoles = Array.from(new Set(candidates.map(c => c.targetRole).filter(Boolean)));

  return (
    <div style={{ width: '100%', maxWidth: '1600px', margin: '0 auto', paddingTop: '1rem', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div className="royal-glass-card solid-border" style={{
        padding: '2.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(10, 13, 20, 0.95) 100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span className="badge-gold">
                <Trophy size={14} /> EVAL AI • OFFICIAL RECRUITER TALENT LEADERBOARD
              </span>
            </div>
            <h1 className="font-royal" style={{ fontSize: '2.3rem', color: '#fff', fontWeight: 800 }}>
              Candidate <span className="gold-text-gradient">Rankings & Dossier</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '0.4rem', maxWidth: '680px' }}>
              Real-time rankings based on Resume ATS Score (35%) and Multi-Round AI Assessment Performance (65%).
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={fetchLeaderboard}
              className="btn-dark"
              style={{ fontSize: '0.85rem', padding: '0.65rem 1.1rem' }}
            >
              <RefreshCw size={15} className={loading ? "animate-spin-slow" : ""} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="btn-gold"
              style={{ fontSize: '0.85rem', padding: '0.65rem 1.4rem' }}
            >
              <Download size={16} />
              <span>{isExporting ? "Generating PDF..." : "Export Leaderboard PDF"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="royal-glass-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '320px', flex: 1 }}>
            <Search size={17} color="var(--gold-light)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by candidate name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.8rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(5, 7, 10, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#0e111a',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="INVITED">Invited (Pending)</option>
              <option value="IN_PROGRESS">In Progress</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#0e111a',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Roles</option>
              {uniqueRoles.map((role, idx) => (
                <option key={idx} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="royal-glass-card solid-border" style={{ overflowX: 'auto', padding: '0.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.25)', background: 'rgba(5, 7, 10, 0.6)' }}>
              <th style={{ padding: '1.1rem 1.25rem', fontSize: '0.82rem', color: 'var(--gold-light)', fontWeight: 700, width: '80px', textAlign: 'center' }}>RANK</th>
              <th style={{ padding: '1.1rem 1.25rem', fontSize: '0.82rem', color: 'var(--gold-light)', fontWeight: 700 }}>CANDIDATE</th>
              <th style={{ padding: '1.1rem 1.25rem', fontSize: '0.82rem', color: 'var(--gold-light)', fontWeight: 700 }}>ROLE</th>
              <th style={{ padding: '1.1rem 1.25rem', fontSize: '0.82rem', color: 'var(--gold-light)', fontWeight: 700, textAlign: 'center' }}>RESUME (ATS)</th>
              <th style={{ padding: '1.1rem 1.25rem', fontSize: '0.82rem', color: 'var(--gold-light)', fontWeight: 700, textAlign: 'center' }}>ASSESSMENT</th>
              <th style={{ padding: '1.1rem 1.25rem', fontSize: '0.82rem', color: 'var(--gold-light)', fontWeight: 700, textAlign: 'center' }}>OVERALL SCORE</th>
              <th style={{ padding: '1.1rem 1.25rem', fontSize: '0.82rem', color: 'var(--gold-light)', fontWeight: 700, textAlign: 'center' }}>STATUS</th>
              <th style={{ padding: '1.1rem 1.25rem', fontSize: '0.82rem', color: 'var(--gold-light)', fontWeight: 700, textAlign: 'center' }}>RESUME</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
                  No candidates found matching your criteria.
                </td>
              </tr>
            ) : (
              filtered.map((cand, idx) => {
                const rankNum = idx + 1;
                const isTop3 = rankNum <= 3;
                return (
                  <tr
                    key={cand.candidateId || idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                      transition: 'background 0.2s',
                      background: isTop3 ? 'rgba(212, 175, 55, 0.03)' : 'transparent'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)'}
                    onMouseOut={(e) => e.currentTarget.style.background = isTop3 ? 'rgba(212, 175, 55, 0.03)' : 'transparent'}
                  >
                    {/* Rank Badge */}
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        background: rankNum === 1
                          ? 'var(--grad-gold)'
                          : (rankNum === 2 ? 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)' : (rankNum === 3 ? 'linear-gradient(135deg, #d97706 0%, #78350f 100%)' : 'rgba(255,255,255,0.06)')),
                        color: rankNum === 1 ? '#07080c' : (rankNum === 2 ? '#07080c' : '#fff'),
                        boxShadow: rankNum === 1 ? '0 0 14px rgba(212, 175, 55, 0.5)' : 'none'
                      }}>
                        {rankNum === 1 ? "🥇" : (rankNum === 2 ? "🥈" : (rankNum === 3 ? "🥉" : `#${rankNum}`))}
                      </div>
                    </td>

                    {/* Name & Email */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                        {cand.name}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {cand.email}
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {cand.targetRole || "Software Engineer"}
                      </span>
                    </td>

                    {/* Resume ATS Score */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <span style={{ fontWeight: 600, color: 'var(--gold-light)', fontSize: '0.95rem' }}>
                        {cand.resumeScore != null ? `${cand.resumeScore}%` : 'N/A'}
                      </span>
                    </td>

                    {/* Assessment Score */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      {cand.assessmentScore != null ? (
                        <span style={{ fontWeight: 600, color: '#34d399', fontSize: '0.95rem' }}>
                          {cand.assessmentScore}%
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pending</span>
                      )}
                    </td>

                    {/* Overall Score */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: 'rgba(212, 175, 55, 0.15)',
                        border: '1px solid rgba(212, 175, 55, 0.4)',
                        padding: '0.35rem 0.85rem',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        <span className="font-royal" style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem' }}>
                          {cand.overallScore != null ? cand.overallScore : cand.resumeScore}%
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      {cand.status === 'COMPLETED' ? (
                        <span className="badge-emerald" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={12} /> Completed
                        </span>
                      ) : (
                        <span className="badge-gold" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={12} /> Invited
                        </span>
                      )}
                    </td>

                    {/* Resume PDF Link */}
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      <a
                        href={`http://localhost:8085/api/resumes/${cand.candidateId}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-dark"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FileText size={13} color="var(--gold-light)" />
                        <span>View PDF</span>
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
