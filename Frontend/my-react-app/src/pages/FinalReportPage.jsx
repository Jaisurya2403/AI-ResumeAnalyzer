import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Award, Sparkles, CheckCircle2, TrendingUp, Compass, Share2, Printer, RotateCcw, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { triggerGoldConfetti } from '../utils/confetti';
import { useApp } from '../context/AppContext';
import { storageService } from '../services/storageService';
import ScoreBadge from '../components/common/ScoreBadge';

export default function FinalReportPage() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Load from storage if not in memory
  useEffect(() => {
    if (!state.finalReport && id && id !== 'latest') {
      const saved = storageService.getResultById(id);
      if (saved) {
        dispatch({ type: 'LOAD_SAVED_RESULT', payload: saved });
      }
    }
  }, [id, state.finalReport]);

  // Trigger Royal Gold Confetti
  useEffect(() => {
    triggerGoldConfetti();
  }, []);

  const report = state.finalReport || {
    fitnessPercent: 88,
    executiveSummary: "Candidate exhibits exceptional technical architecture mastery, rapid problem-solving, and articulate verbal articulation. Strongly recommended for technical tracks.",
    recommendations: [
      { area: "Distributed System Failover & Idempotency", priority: "High", advice: "Deepen understanding of Raft distributed consensus, idempotency keys, and cross-region replication topologies." },
      { area: "STAR Framework in Behavioral Questions", priority: "Medium", advice: "Frame scenario resolution crisply using Situation, Task, Action, and quantifiable Result metrics." }
    ],
    alternateRoles: [
      { role: "Distributed Systems Architect", reason: "Strong grasp of concurrency control, Redis cluster scaling, and low-latency API throughput." },
      { role: "Technical Lead / Engineering Manager", reason: "Articulate communication, team leadership awareness, and structured thought process." }
    ]
  };

  const scores = state.roundScores || { round1: 80, round2: 85, round3: 80, round4: 88 };
  const role = state.jobRole || { title: "Full Stack Engineer", domain: "Software" };
  const candidateName = state.resumeProfile?.candidateName || "Candidate";

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const summaryText = `🏆 AURA AI Candidate Assessment Report\nCandidate: ${candidateName}\nTarget Role: ${role.title} (${role.domain})\nOverall Fitness Score: ${report.fitnessPercent}%\n• Round 1 (Aptitude): ${scores.round1}%\n• Round 2 (Domain MCQs): ${scores.round2}%\n• Round 3 (Adaptive Practical): ${scores.round3}%\n• Round 4 (Voice Communication): ${scores.round4}%\n\nEvaluated via AURA AI Resume & Interview Agent.`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewAssessment = () => {
    dispatch({ type: 'RESET_SESSION' });
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Banner Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="badge-gold">
            <Award size={15} /> OFFICIAL CANDIDATE EVALUATION DOSSIER
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleShare}
            className="btn-dark"
            style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
          >
            <Share2 size={15} />
            <span>{copied ? "Copied Summary!" : "Share Summary"}</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-dark"
            style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
          >
            <Printer size={15} />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleNewAssessment}
            className="btn-gold"
            style={{ fontSize: '0.85rem', padding: '0.6rem 1.2rem' }}
          >
            <RotateCcw size={15} />
            <span>New Assessment</span>
          </button>
        </div>
      </div>

      {/* Executive Hero Scorecard */}
      <div className="royal-glass-card solid-border" style={{
        padding: '3rem 2.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(10, 13, 20, 0.95) 100%)',
        boxShadow: '0 15px 45px rgba(212, 175, 55, 0.25)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2.5rem', alignItems: 'center' }}>
          {/* Big Circular Score Badge */}
          <div>
            <ScoreBadge
              score={report.fitnessPercent}
              size={160}
              strokeWidth={12}
              label="Role Fitness"
              sublabel="OVERALL"
            />
          </div>

          {/* Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className="badge-emerald" style={{ fontSize: '0.75rem' }}>
                <ShieldCheck size={13} /> Assessment Completed
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="font-royal" style={{ fontSize: '2.2rem', color: '#fff', fontWeight: 800 }}>
              {candidateName}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: '1.05rem' }}>
                {role.title}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {role.domain} Engineering Track
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', background: 'rgba(5, 7, 10, 0.5)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              {report.executiveSummary}
            </p>
          </div>
        </div>
      </div>

      {/* 4-Round Scores Breakdown */}
      <div className="royal-glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 className="font-royal" style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="var(--gold-light)" />
          Multi-Round Competency Breakdown
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[
            { id: 1, name: "Round 1: Aptitude", score: scores.round1, desc: "Quantitative & logic speed" },
            { id: 2, name: "Round 2: Domain MCQs", score: scores.round2, desc: "Technical skill depth" },
            { id: 3, name: "Round 3: Practical", score: scores.round3, desc: "Architecture & scenarios" },
            { id: 4, name: "Round 4: Voice / Comm", score: scores.round4, desc: "Speech & articulation" }
          ].map(r => (
            <div
              key={r.id}
              style={{
                background: 'rgba(10, 13, 20, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.22)',
                borderRadius: 'var(--radius-md)',
                padding: '1.4rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                  {r.name}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.desc}</p>
              </div>

              <ScoreBadge
                score={r.score}
                size={95}
                strokeWidth={7}
                label=""
              />

              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: (r.score >= 75 ? 'var(--gold-light)' : 'var(--accent-amber)') }}>
                {r.score >= 80 ? 'Mastery Level' : (r.score >= 60 ? 'Proficient' : 'Growth Area')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Recommendations & Alternate Roles */}
      <div className="grid-2">
        {/* Actionable Recommendations */}
        <div className="royal-glass-card" style={{ padding: '2rem' }}>
          <h3 className="font-royal" style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--gold-light)" />
            Targeted Improvement Roadmap
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Actionable strategies calibrated to your lowest scoring interview segments:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(report.recommendations || []).map((rec, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(10, 13, 20, 0.7)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.1rem',
                  borderLeft: rec.priority === 'High' ? '4px solid var(--accent-crimson)' : '4px solid var(--gold-light)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                    {rec.area}
                  </h4>
                  <span className={rec.priority === 'High' ? 'badge-crimson' : 'badge-gold'} style={{ fontSize: '0.65rem' }}>
                    {rec.priority || 'High'} Priority
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {rec.advice}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Alternate Role Recommendations */}
        <div className="royal-glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="font-royal" style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={18} color="var(--gold-light)" />
              High-Fit Alternate Role Matches
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Career pathways where your demonstrated problem-solving skills align exceptionally well:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(report.alternateRoles || []).map((alt, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(10, 13, 20, 0.7)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold-light)' }} />
                    <h4 style={{ color: 'var(--gold-light)', fontSize: '0.95rem', fontWeight: 600 }}>
                      {alt.role}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {alt.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
            <Link
              to="/history"
              className="btn-gold-outline"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>View All Past Assessment History</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
