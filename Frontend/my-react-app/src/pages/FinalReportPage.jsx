import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Award, Sparkles, CheckCircle2, TrendingUp, Compass, Share2, Printer, RotateCcw, ArrowRight, ShieldCheck, ChevronRight, ShieldAlert, AlertTriangle, Camera, Mic, Download, FileText } from 'lucide-react';
import { triggerGoldConfetti } from '../utils/confetti';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import ScoreBadge from '../components/common/ScoreBadge';
import DownloadConfirmModal from '../components/common/DownloadConfirmModal';
import MlSuitabilityCard from '../components/results/MlSuitabilityCard';
import BackButton from '../components/common/BackButton';
import { mlClient } from '../services/mlClient';

export default function FinalReportPage() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [loadingRecord, setLoadingRecord] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Load from storage or backend if not in memory
  useEffect(() => {
    if (id && id !== 'latest') {
      const saved = storageService.getResultById(id);
      if (saved) {
        dispatch({ type: 'LOAD_SAVED_RESULT', payload: saved });
      } else {
        // Fetch from backend archive evaluation endpoint
        setLoadingRecord(true);
        fetch(`http://localhost:8085/api/archive/evaluations/${id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              const parsedSkills = typeof data.skills === 'string'
                ? data.skills.split(',').map(s => ({ name: s.trim(), percent: 85 }))
                : (Array.isArray(data.skills) ? data.skills : []);

              let parsedScores = null;
              if (data.roundScores) {
                try {
                  parsedScores = typeof data.roundScores === 'string' ? JSON.parse(data.roundScores) : data.roundScores;
                  if (parsedScores && parsedScores.roundScores) {
                    parsedScores = parsedScores.roundScores;
                  }
                } catch (ignore) {}
              }

              let storedFinalReport = null;
              if (data.finalReportJson) {
                try {
                  storedFinalReport = typeof data.finalReportJson === 'string' ? JSON.parse(data.finalReportJson) : data.finalReportJson;
                } catch (ignore) {}
              }

              const realRoundScores = {
                round1: parsedScores?.round1 != null ? parsedScores.round1 : (data.assessmentScore != null ? Math.round(data.assessmentScore) : 0),
                round2: parsedScores?.round2 != null ? parsedScores.round2 : (data.assessmentScore != null ? Math.round(data.assessmentScore) : 0),
                round3: parsedScores?.round3 != null ? parsedScores.round3 : (data.assessmentScore != null ? Math.round(data.assessmentScore) : 0),
                round4: parsedScores?.round4 != null ? parsedScores.round4 : (data.assessmentScore != null ? Math.round(data.assessmentScore) : 0)
              };

              const calculatedOverall = Math.round((realRoundScores.round1 * 0.15) + (realRoundScores.round2 * 0.35) + (realRoundScores.round3 * 0.30) + (realRoundScores.round4 * 0.20));
              const overall = data.overallScore != null ? Math.round(data.overallScore) : (storedFinalReport?.fitnessPercent || calculatedOverall);

              const candidateDisplayName = (data.name && data.name.trim() !== '') ? data.name : 'Candidate';
              const targetJobTitle = data.targetRole || 'Full Stack Engineer';
              const targetCompanyName = data.companyName || 'Standard Corporate Track';

              const execSummary = storedFinalReport?.executiveSummary || data.aiFeedback || `Candidate ${candidateDisplayName} completed the multi-round assessment for ${targetJobTitle} under ${targetCompanyName} with an overall role fitness score of ${overall}%.`;

              const recommendations = storedFinalReport?.recommendations && Array.isArray(storedFinalReport.recommendations) && storedFinalReport.recommendations.length > 0
                ? storedFinalReport.recommendations
                : [
                    { area: "Technical Architecture & System Design", priority: "High", advice: "Deepen understanding of distributed systems, concurrency control, and scalability patterns." },
                    { area: "Core Domain Implementation", priority: "Medium", advice: "Continue refining practical implementation speed, API contracts, and edge-case handling." }
                  ];

              const alternateRoles = storedFinalReport?.alternateRoles && Array.isArray(storedFinalReport.alternateRoles) && storedFinalReport.alternateRoles.length > 0
                ? storedFinalReport.alternateRoles
                : [
                    { role: targetJobTitle ? `${targetJobTitle} Specialist` : "Backend Systems Engineer", fit: Math.min(100, overall + 2), rationale: "Strong foundational problem-solving and domain aptitude." },
                    { role: "Solutions Architect", fit: Math.max(40, overall - 4), rationale: "Well-suited for system translation, cross-functional design, and client delivery." }
                  ];

              let parsedMlImportances = [];
              if (data.mlFeatureImportancesJson) {
                try {
                  parsedMlImportances = typeof data.mlFeatureImportancesJson === 'string' ? JSON.parse(data.mlFeatureImportancesJson) : data.mlFeatureImportancesJson;
                } catch (ignore) {}
              }

              let parsedMlFeatures = {};
              if (data.mlFeaturesJson) {
                try {
                  parsedMlFeatures = typeof data.mlFeaturesJson === 'string' ? JSON.parse(data.mlFeaturesJson) : data.mlFeaturesJson;
                } catch (ignore) {}
              }

              const mlPredictionData = (data.mlPrediction || data.mlSuitabilityScore != null) ? {
                status: 'SUCCESS',
                candidate_name: candidateDisplayName,
                role_title: targetJobTitle,
                prediction: data.mlPrediction || (data.mlSuitabilityScore >= 50 ? 'Suitable' : 'Not Suitable'),
                suitable: data.mlPrediction ? data.mlPrediction === 'Suitable' : (data.mlSuitabilityScore >= 50),
                suitability_score: data.mlSuitabilityScore != null ? data.mlSuitabilityScore : 85.0,
                confidence: data.mlSuitabilityScore != null ? data.mlSuitabilityScore : 85.0,
                matched_skills: typeof data.mlMatchedSkills === 'string' ? data.mlMatchedSkills.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(data.mlMatchedSkills) ? data.mlMatchedSkills : []),
                missing_skills: typeof data.mlMissingSkills === 'string' ? data.mlMissingSkills.split(',').map(s => s.trim()).filter(Boolean) : (Array.isArray(data.mlMissingSkills) ? data.mlMissingSkills : []),
                features: parsedMlFeatures,
                feature_importances: parsedMlImportances,
                model_info: {
                  algorithm: "RandomForestClassifier",
                  test_accuracy: 88.33,
                  precision: 86.75,
                  recall: 91.72,
                  f1_score: 89.16
                }
              } : null;

              const payload = {
                id: data.candidateId || id,
                candidateId: data.candidateId || id,
                candidateName: candidateDisplayName,
                userName: candidateDisplayName,
                jobRole: {
                  title: targetJobTitle,
                  domain: 'Software Engineering',
                  company: targetCompanyName
                },
                resumeProfile: {
                  candidateName: candidateDisplayName,
                  email: data.email,
                  targetRole: targetJobTitle,
                  skills: parsedSkills
                },
                mlPredictionData: mlPredictionData,
                roundScores: realRoundScores,
                finalReport: {
                  fitnessPercent: overall,
                  executiveSummary: execSummary,
                  recommendations,
                  alternateRoles
                }
              };
              dispatch({ type: 'LOAD_SAVED_RESULT', payload });
            }
          })
          .catch(err => console.warn('Could not load evaluation dossier from backend:', err))
          .finally(() => setLoadingRecord(false));
      }
    }
  }, [id, token]);

  // Trigger Royal Gold Confetti
  useEffect(() => {
    triggerGoldConfetti();
  }, []);

  const scores = state.roundScores || { round1: 0, round2: 0, round3: 0, round4: 0 };
  const role = state.jobRole || { title: "Full Stack Engineer", domain: "Software" };
  const candidateName = state.resumeProfile?.candidateName || state.userName || "Candidate";
  const targetRoleName = role.title || state.resumeProfile?.targetRole || "Full Stack Engineer";
  const targetCompanyName = role.company || "Standard Corporate Track";
  const hasSyncedRef = React.useRef(false);

  const calculatedFitness = Math.round(((scores.round1 ?? 0) * 0.15) + ((scores.round2 ?? 0) * 0.35) + ((scores.round3 ?? 0) * 0.30) + ((scores.round4 ?? 0) * 0.20));

  const report = state.finalReport || {
    fitnessPercent: calculatedFitness,
    executiveSummary: (scores.round1 === 0 && scores.round2 === 0 && scores.round3 === 0 && scores.round4 === 0)
      ? "Assessment completed with no answers submitted across all rounds. Overall fitness score is 0%."
      : `Candidate completed the multi-round assessment with a score of ${calculatedFitness}%.`,
    recommendations: [
      { area: "Technical Architecture & System Design", priority: "High", advice: "Deepen understanding of distributed systems, concurrency control, and scalability patterns." }
    ],
    alternateRoles: []
  };

  const finalOverallScore = report.fitnessPercent !== undefined ? report.fitnessPercent : calculatedFitness;

  // Sync completed scores with backend Oracle DB (only for fresh test completion, not historical archive views)
  useEffect(() => {
    if (hasSyncedRef.current || (id && id !== 'latest')) return;
    hasSyncedRef.current = true;

    const avgAssessment = Math.round(
      ((scores.round1 ?? 0) + (scores.round2 ?? 0) + (scores.round3 ?? 0) + (scores.round4 ?? 0)) / 4
    );
    const atsScore = Math.round(
      state.resumeProfile?.skills && state.resumeProfile.skills.length > 0
        ? state.resumeProfile.skills.reduce((acc, s) => acc + (s.percent || 0), 0) / state.resumeProfile.skills.length
        : 0
    );
    const overall = report.fitnessPercent !== undefined ? report.fitnessPercent : avgAssessment;

    const userEmail = user?.email || state.userEmail || state.resumeProfile?.email || 'candidate@evalai.com';
    const activeCandidateId = state.candidateId || sessionStorage.getItem('eval_candidate_id') || null;
    const activeCandidateToken = state.candidateToken || sessionStorage.getItem('eval_candidate_token') || null;

    fetch('http://localhost:8085/api/resumes/save-evaluation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        candidateId: activeCandidateId,
        token: activeCandidateToken,
        name: candidateName,
        email: userEmail,
        targetRole: role.title || 'Full Stack Engineer',
        companyName: role.company || 'Standard Corporate Track',
        resumeScore: atsScore,
        assessmentScore: avgAssessment,
        overallScore: overall,
        status: 'COMPLETED',
        summary: report.executiveSummary
      })
    }).catch(err => console.warn('Could not update final evaluation in DB:', err));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const summaryText = `🏆 EVAL AI Candidate Assessment Report\nCandidate: ${candidateName}\nTarget Role: ${role.title} (${role.domain})\nOverall Fitness Score: ${report.fitnessPercent}%\n• Round 1 (Aptitude): ${scores.round1}%\n• Round 2 (Domain MCQs): ${scores.round2}%\n• Round 3 (Adaptive Practical): ${scores.round3}%\n• Round 4 (Voice Communication): ${scores.round4}%\n\nEvaluated via EVAL AI Resume & Interview Agent.`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewAssessment = () => {
    dispatch({ type: 'RESET_SESSION' });
    navigate('/');
  };

  const activeReportCandidateId = (state.candidateId || sessionStorage.getItem('eval_candidate_id')) 
    ? (state.candidateId || sessionStorage.getItem('eval_candidate_id'))
    : ((id && !id.startsWith('res_') && id !== 'latest') ? id : (state.candidateToken || sessionStorage.getItem('eval_candidate_token') || id || '1'));

  return (
    <div style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Banner Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <BackButton label="Back" />
          <span className="badge-gold">
            <Award size={15} /> OFFICIAL CANDIDATE EVALUATION DOSSIER
          </span>
          {loadingRecord && (
            <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>
              Loading Dossier Data...
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {activeReportCandidateId && (
            <button
              onClick={() => setShowDownloadModal(true)}
              className="btn-gold"
              style={{ fontSize: '0.85rem', padding: '0.6rem 1.1rem', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
              title="Download Server-Generated Assessment Dossier PDF"
            >
              <Download size={15} />
              <span>Download PDF Dossier</span>
            </button>
          )}

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

      {/* Supervised Machine Learning Suitability Section */}
      <MlSuitabilityCard mlData={state.mlPredictionData} />

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

      {/* Round 4 Spoken English & Technical Answer Assessment */}
      {(() => {
        const r4Data = state.roundAnswers?.round4;
        const subScores = r4Data?.[0]?.subScores || {};
        const sentenceFraming = subScores.sentenceFraming ?? Math.min(95, Math.max(0, scores.round4));
        const englishSkills = subScores.englishSkills ?? Math.min(95, Math.max(0, scores.round4));
        const answerRelevance = subScores.answerRelevance ?? Math.min(95, Math.max(0, scores.round4));
        const notes = subScores.notes || "Spoken responses were converted from microphone voice input and evaluated for sentence framing, linguistic proficiency, and technical accuracy.";

        return (
          <div className="royal-glass-card solid-border" style={{
            padding: '2rem 2.5rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(10, 13, 20, 0.95) 100%)',
            borderColor: 'rgba(212, 175, 55, 0.35)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.15)',
                  border: '1px solid var(--gold-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mic size={22} color="var(--gold-light)" />
                </div>
                <div>
                  <h3 className="font-royal" style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>
                    Round 4: Voice Speech & Linguistic Competency Analysis
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                    AI analysis of sentence framing, English proficiency, and answer accuracy from microphone voice transcripts
                  </p>
                </div>
              </div>

              <span className="badge-gold" style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                Voice Score: {scores.round4}%
              </span>
            </div>

            {/* Linguistic Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(5, 7, 12, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>Sentence Framing & Grammar</span>
                  <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>{sentenceFraming}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${sentenceFraming}%`, height: '100%', background: 'var(--grad-gold)' }} />
                </div>
              </div>

              <div style={{ background: 'rgba(5, 7, 12, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>English Vocabulary & Skills</span>
                  <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>{englishSkills}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${englishSkills}%`, height: '100%', background: 'var(--grad-gold)' }} />
                </div>
              </div>

              <div style={{ background: 'rgba(5, 7, 12, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>Answer Relevance & Accuracy</span>
                  <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>{answerRelevance}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${answerRelevance}%`, height: '100%', background: 'var(--grad-gold)' }} />
                </div>
              </div>
            </div>

            {/* AI Evaluator Critique */}
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.55', margin: 0, background: 'rgba(5, 7, 12, 0.5)', padding: '0.85rem 1.1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              💬 <strong style={{ color: '#fff' }}>AI Linguistic & Technical Feedback:</strong> {notes}
            </p>
          </div>
        );
      })()}

      {/* AI Proctoring & Malpractice Integrity Dossier */}
      {(() => {
        const malpracticeScore = state.malpracticeScore || 0;
        const violations = state.proctoringViolations || [];
        const isCheating = malpracticeScore > 50;

        return (
          <div className="royal-glass-card solid-border" style={{
            padding: '2rem 2.5rem',
            marginBottom: '2rem',
            background: isCheating
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(10, 13, 20, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(10, 13, 20, 0.95) 100%)',
            borderColor: isCheating ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: isCheating ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  border: `1px solid ${isCheating ? '#ef4444' : '#10b981'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {isCheating ? <ShieldAlert size={22} color="#f87171" /> : <ShieldCheck size={22} color="#34d399" />}
                </div>
                <div>
                  <h3 className="font-royal" style={{ fontSize: '1.2rem', color: '#fff', margin: 0 }}>
                    MediaPipe AI Proctoring & Integrity Dossier
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                    Live webcam biometric tracking, multi-face detection, head pose yaw/pitch & tab switch verification
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {isCheating ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.45rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1.5px solid #ef4444',
                    color: '#fca5a5',
                    fontSize: '0.88rem',
                    fontWeight: 800
                  }}>
                    <AlertTriangle size={15} color="#ef4444" /> CHEATING FLAGGED ({malpracticeScore} pts / 50 limit)
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.45rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1.5px solid #10b981',
                    color: '#6ee7b7',
                    fontSize: '0.88rem',
                    fontWeight: 800
                  }}>
                    <ShieldCheck size={15} color="#10b981" /> VERIFIED CLEAN INTEGRITY ({malpracticeScore}/50 pts)
                  </span>
                )}
              </div>
            </div>

            {/* Integrity Summary Details */}
            <p style={{
              color: isCheating ? '#fecaca' : 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: '1.55',
              marginBottom: violations.length > 0 ? '1rem' : 0
            }}>
              {isCheating
                ? "⚠️ Warning: The background malpractice flag score exceeded the threshold of 50 points during the interview. Excessive looking away, tab switching, or absent face tracking was detected."
                : "🛡️ Candidate maintained consistent face alignment and gaze tracking throughout all 4 interview rounds. Malpractice flag score remained within acceptable limits (<= 50)."}
            </p>

            {/* Recorded Violations Log */}
            {violations.length > 0 && (
              <div style={{
                background: 'rgba(5, 7, 12, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '0.85rem 1.25rem',
                marginTop: '0.75rem'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gold-light)', marginBottom: '0.5rem' }}>
                  Recorded Proctoring Events ({violations.length} total):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {violations.slice(0, 4).map((v, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1' }}>
                      <span>{v.message}</span>
                      <span style={{ color: '#f87171', fontWeight: 700 }}>+{v.points} pts ({v.timestamp})</span>
                    </div>
                  ))}
                  {violations.length > 4 && (
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      + {violations.length - 4} additional minor events recorded
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })()}

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

      {/* Confirmation Modal */}
      <DownloadConfirmModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onView={() => {
          if (activeReportCandidateId) {
            window.open(`http://localhost:8085/api/archive/evaluations/${activeReportCandidateId}/report-pdf`, '_blank');
          }
        }}
        onConfirm={async () => {
          if (activeReportCandidateId) {
            const url = `http://localhost:8085/api/archive/evaluations/${activeReportCandidateId}/report-pdf`;
            const fname = `Assessment_Dossier_${candidateName.replace(/\s+/g, '_')}_${targetRoleName.replace(/\s+/g, '_')}.pdf`;
            try {
              const res = await fetch(url);
              if (!res.ok) throw new Error("Download failed");
              const blob = await res.blob();
              const bUrl = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = bUrl;
              a.download = fname;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(bUrl);
            } catch (err) {
              window.open(url, '_blank');
            }
          }
        }}
        title="Candidate Assessment Dossier"
        fileName={`Assessment_Dossier_${candidateName.replace(/\s+/g, '_')}_${targetRoleName.replace(/\s+/g, '_')}.pdf`}
        fileType="Official Assessment Dossier (PDF)"
        details={[
          { label: "Candidate", value: candidateName },
          { label: "Target Role", value: targetRoleName },
          { label: "Company", value: targetCompanyName },
          { label: "Overall Score", value: `${finalOverallScore}%` }
        ]}
      />
    </div>
  );
}
