import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, Award, Clock, ArrowRight, ArrowLeft, Mic, Code, HelpCircle, Sparkles, AlertCircle, Maximize, AlertTriangle, Lock } from 'lucide-react';
import ProgressBar from '../components/common/ProgressBar';
import QuestionCard from '../components/interview/QuestionCard';
import McqOptions from '../components/interview/McqOptions';
import VoiceRecorder from '../components/interview/VoiceRecorder';
import { getRandomAptitudeQuestions } from '../data/aptitudeQuestions';
import { aiClient } from '../services/aiClient';
import ProctoringCamera from '../components/interview/ProctoringCamera';

export default function CandidateAssessmentPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [candidateInfo, setCandidateInfo] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [currentRound, setCurrentRound] = useState(0); // 0: Welcome Briefing, 1: Aptitude, 2: Domain, 3: Practical, 4: Voice, 5: Completed
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  // Round Timer States (in seconds)
  const [r1TimeRemaining, setR1TimeRemaining] = useState(300); // 5 mins
  const [r2TimeRemaining, setR2TimeRemaining] = useState(480); // 8 mins
  const [r3TimeRemaining, setR3TimeRemaining] = useState(600); // 10 mins
  const [r4TimeRemaining, setR4TimeRemaining] = useState(300); // 5 mins

  // Proctoring & Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [autoSubmittedViolation, setAutoSubmittedViolation] = useState(false);
  const lastSwitchTimeRef = useRef(0);

  // Round 1 State
  const [r1Questions, setR1Questions] = useState([]);
  const [r1Index, setR1Index] = useState(0);
  const [r1Answers, setR1Answers] = useState({});

  // Round 2 State
  const [r2Questions, setR2Questions] = useState([]);
  const [r2Index, setR2Index] = useState(0);
  const [r2Answers, setR2Answers] = useState({});
  const [r2Loading, setR2Loading] = useState(false);

  // Round 3 State
  const [r3Questions, setR3Questions] = useState([]);
  const [r3Index, setR3Index] = useState(0);
  const [r3Answers, setR3Answers] = useState({});
  const [r3Loading, setR3Loading] = useState(false);

  // Round 4 State
  const [r4Questions, setR4Questions] = useState([]);
  const [r4Index, setR4Index] = useState(0);
  const [r4Transcripts, setR4Transcripts] = useState({});
  const [r4Loading, setR4Loading] = useState(false);

  // Scores tracked internally
  const [scores, setScores] = useState({ round1: null, round2: null, round3: null, round4: null });

  // Helper: Request Fullscreen
  const requestFullscreenMode = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen().catch(() => {});
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen().catch(() => {});
        }
        setIsFullscreen(true);
      }
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }
  };

  // 1. Fetch Candidate Context & Enforce Lock
  useEffect(() => {
    async function loadCandidate() {
      setLoadingContext(true);

      const localLock = localStorage.getItem(`eval_locked_${token}`);
      if (localLock === 'DISQUALIFIED') {
        setAutoSubmittedViolation(true);
        setCurrentRound(5);
      } else if (localLock === 'COMPLETED') {
        setAlreadyCompleted(true);
        setCurrentRound(5);
      }

      try {
        const res = await fetch(`http://localhost:8085/api/assessment/${token}`);
        if (res.status === 410) {
          const errData = await res.json();
          setCandidateInfo({ ...errData, isExpired: true });
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.isExpired || data.status === 'EXPIRED') {
            setCandidateInfo({ ...data, isExpired: true });
            return;
          }
          setCandidateInfo(data);
          if (data.isDisqualified || data.status === 'DISQUALIFIED') {
            setAutoSubmittedViolation(true);
            setCurrentRound(5);
            localStorage.setItem(`eval_locked_${token}`, 'DISQUALIFIED');
          } else if (data.alreadyCompleted || data.status === 'COMPLETED') {
            setAlreadyCompleted(true);
            setCurrentRound(5);
            localStorage.setItem(`eval_locked_${token}`, 'COMPLETED');
          }
        } else {
          setCandidateInfo({
            name: "Candidate",
            targetRole: "Full Stack Engineer",
            companyName: "TechCorp Global",
            skills: "React, TypeScript, Node.js, SQL, System Design",
            email: "candidate@example.com"
          });
        }
      } catch (err) {
        setCandidateInfo({
          name: "Candidate",
          targetRole: "Full Stack Engineer",
          companyName: "TechCorp Global",
          skills: "React, TypeScript, Node.js, SQL, System Design",
          email: "candidate@example.com"
        });
      } finally {
        setLoadingContext(false);
      }
    }

    loadCandidate().then(async (info) => {
      const targetRole = info?.targetRole || "Full Stack Engineer";
      const skills = (info?.skills || "React, Node.js, SQL").split(',').map(s => s.trim());
      const aptList = await aiClient.generateAptitudeQuestions("Software", targetRole, skills);
      setR1Questions(aptList || []);
    });
  }, [token]);

  // Finish Round 4 -> Submit to Backend
  const handleFinalSubmit = useCallback(async (isViolationSubmit = false) => {
    setIsSubmitting(true);
    let r4Score = 0;
    const transcriptList = r4Questions.map((_, i) => r4Transcripts[i] || "");

    if (!isViolationSubmit && r4Questions.length > 0) {
      try {
        const commResult = await aiClient.scoreCommunicationTranscripts(r4Questions, transcriptList);
        r4Score = typeof commResult?.overall === 'number' ? commResult.overall : 0;
      } catch (e) {
        r4Score = 0;
      }
    }

    const finalScores = isViolationSubmit
      ? { round1: 0, round2: 0, round3: 0, round4: 0 }
      : {
          round1: scores.round1 ?? 0,
          round2: scores.round2 ?? 0,
          round3: scores.round3 ?? 0,
          round4: scores.round4 ?? r4Score
        };

    const payload = {
      roundScores: finalScores,
      round1Answers: Object.values(r1Answers),
      round2Answers: Object.values(r2Answers),
      round3Answers: Object.values(r3Answers),
      round4Transcripts: transcriptList,
      violation: isViolationSubmit
    };

    try {
      await fetch(`http://localhost:8085/api/assessment/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn("Could not post to backend, recorded locally:", err);
    } finally {
      setIsSubmitting(false);
      if (isViolationSubmit) {
        setAutoSubmittedViolation(true);
        localStorage.setItem(`eval_locked_${token}`, 'DISQUALIFIED');
      } else {
        setAlreadyCompleted(true);
        localStorage.setItem(`eval_locked_${token}`, 'COMPLETED');
      }
      setCurrentRound(5); // Show Locked Completion Screen
    }
  }, [token, r4Questions, r4Transcripts, scores, r1Answers, r2Answers, r3Answers]);

  // Countdown timer per section effect
  useEffect(() => {
    if (currentRound < 1 || currentRound > 4) return;
    const timer = setInterval(() => {
      if (currentRound === 1) {
        setR1TimeRemaining(prev => {
          if (prev <= 1) {
            handleFinishRound1();
            return 0;
          }
          return prev - 1;
        });
      } else if (currentRound === 2) {
        setR2TimeRemaining(prev => {
          if (prev <= 1) {
            handleFinishRound2();
            return 0;
          }
          return prev - 1;
        });
      } else if (currentRound === 3) {
        setR3TimeRemaining(prev => {
          if (prev <= 1) {
            handleFinishRound3();
            return 0;
          }
          return prev - 1;
        });
      } else if (currentRound === 4) {
        setR4TimeRemaining(prev => {
          if (prev <= 1) {
            handleFinalSubmit(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [currentRound, handleFinalSubmit]);

  // 2. Proctoring Event Listeners (Enforce max 3 tab switches in background)
  useEffect(() => {
    // Only monitor tab switches during active assessment rounds (1 to 4)
    if (currentRound < 1 || currentRound > 4) return;

    const handleSwitchViolation = () => {
      const now = Date.now();
      // Debounce events firing within 1 second
      if (now - lastSwitchTimeRef.current < 1000) return;
      lastSwitchTimeRef.current = now;

      setTabSwitchCount((prevCount) => {
        const newCount = prevCount + 1;
        if (newCount >= 3) {
          // 3rd switch violation -> immediate disqualification & submit score 0
          setShowWarningModal(false);
          handleFinalSubmit(true);
          return newCount;
        } else {
          setShowWarningModal(true);
          return newCount;
        }
      });
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleSwitchViolation();
      }
    };

    const onBlur = () => {
      handleSwitchViolation();
    };

    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [currentRound, handleFinalSubmit]);

  // Start Round 1 with Fullscreen
  const handleStartAssessment = () => {
    requestFullscreenMode();
    setCurrentRound(1);
  };

  // Finish Round 1 -> Load Round 2
  const handleFinishRound1 = async () => {
    let correct = 0;
    r1Questions.forEach((q, i) => {
      if (r1Answers[i] === q.correctIndex) correct++;
    });
    const r1Score = Math.round((correct / r1Questions.length) * 100);
    setScores(prev => ({ ...prev, round1: r1Score }));

    setCurrentRound(2);
    setR2Loading(true);

    const skills = (candidateInfo?.skills || "React, Node.js, Database Design").split(',').map(s => ({ name: s.trim() }));
    const mcqs = await aiClient.generateDomainMCQs(skills, { title: candidateInfo?.targetRole || "Software Engineer" });
    setR2Questions(mcqs || []);
    setR2Loading(false);
  };

  // Finish Round 2 -> Load Round 3
  const handleFinishRound2 = async () => {
    let correct = 0;
    r2Questions.forEach((q, i) => {
      if (r2Answers[i] === q.correctIndex) correct++;
    });
    const r2Score = Math.round((correct / (r2Questions.length || 1)) * 100);
    setScores(prev => ({ ...prev, round2: r2Score }));

    setCurrentRound(3);
    setR3Loading(true);

    const difficulty = r2Score >= 70 ? "advanced" : "foundational";
    const practicals = await aiClient.generatePracticalQuestions("Software", { title: candidateInfo?.targetRole || "Software Engineer" }, difficulty, r2Score);
    setR3Questions(practicals || []);
    setR3Loading(false);
  };

  // Finish Round 3 -> Load Round 4
  const handleFinishRound3 = async () => {
    const answersArray = r3Questions.map((_, i) => r3Answers[i] || "");
    const practicalScoreResult = await aiClient.scorePracticalAnswers(r3Questions, answersArray);
    const r3Score = typeof practicalScoreResult?.averageScore === 'number' ? practicalScoreResult.averageScore : 0;
    setScores(prev => ({ ...prev, round3: r3Score }));

    setCurrentRound(4);
    setR4Loading(true);

    const comms = await aiClient.generateCommunicationQuestions("Software", [], { title: candidateInfo?.targetRole || "Software Engineer" });
    setR4Questions(comms || []);
    setR4Loading(false);
  };

  // Dismiss Warning and re-enter fullscreen
  const handleAcknowledgeWarning = () => {
    setShowWarningModal(false);
    requestFullscreenMode();
  };

  if (loadingContext) {
    return (
      <div style={{ width: '100%', maxWidth: '700px', margin: '6rem auto', textAlign: 'center', color: '#cbd5e1' }}>
        <Sparkles size={36} color="#ffd700" className="animate-spin-slow" style={{ margin: '0 auto 1.25rem' }} />
        <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>Authenticating Assessment Link...</h2>
      </div>
    );
  }

  // Proctoring HUD Bar Header Component (with live Section countdown timer)
  const renderProctoringHUD = () => {
    if (currentRound < 1 || currentRound > 4) return null;

    const currentRemaining = currentRound === 1 
      ? r1TimeRemaining 
      : currentRound === 2 
      ? r2TimeRemaining 
      : currentRound === 3 
      ? r3TimeRemaining 
      : r4TimeRemaining;

    const formatTimer = (secs) => {
      const m = Math.floor(secs / 60);
      const s = (secs % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    const isUrgent = currentRemaining < 60;

    return (
      <>
      <div style={{
        background: 'rgba(12, 16, 26, 0.95)',
        border: `1px solid ${isUrgent ? 'rgba(239, 68, 68, 0.5)' : 'rgba(212, 175, 55, 0.35)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: isUrgent ? '0 4px 25px rgba(239, 68, 68, 0.25)' : '0 4px 20px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.82rem',
            color: '#ffd700',
            fontWeight: 700,
            letterSpacing: '0.04em'
          }}>
            <ShieldCheck size={16} color="#ffd700" /> EVAL AI PROCTOR ACTIVE
          </span>

          <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            Candidate: <strong style={{ color: '#ffffff' }}>{candidateInfo?.name}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {/* Live Section Countdown Timer Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: isUrgent ? 'rgba(239, 68, 68, 0.2)' : 'rgba(212, 175, 55, 0.15)',
            border: `1px solid ${isUrgent ? '#ef4444' : 'rgba(212, 175, 55, 0.4)'}`,
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            color: isUrgent ? '#f87171' : '#ffd700',
            fontWeight: 700,
            letterSpacing: '0.02em',
            animation: isUrgent ? 'pulse 1s infinite' : 'none'
          }}>
            <Clock size={15} color={isUrgent ? '#f87171' : '#ffd700'} />
            <span>Round {currentRound} Timer: {formatTimer(currentRemaining)}</span>
          </div>

          {!isFullscreen ? (
            <button
              onClick={requestFullscreenMode}
              className="btn-dark"
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.82rem',
                borderColor: '#f59e0b',
                color: '#fbbf24',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Maximize size={14} /> Fullscreen Inactive • Click to Re-enter
            </button>
          ) : (
            <span style={{
              fontSize: '0.8rem',
              color: '#34d399',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              padding: '0.3rem 0.75rem',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 600
            }}>
              <CheckCircle2 size={13} color="#34d399" /> Fullscreen Locked
            </span>
          )}
        </div>
      </div>
      <ProctoringCamera enableAudioDetection={currentRound >= 1 && currentRound <= 3} />
      </>
    );
  };

  // Warning Modal Dialog (Shows firm warning without revealing hidden count)
  const renderWarningModal = () => {
    if (!showWarningModal) return null;
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.5rem'
      }}>
        <div className="royal-glass-card solid-border" style={{
          maxWidth: '560px',
          width: '100%',
          padding: '2.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(10, 13, 20, 0.98) 100%)',
          borderColor: 'rgba(239, 68, 68, 0.6)',
          boxShadow: '0 20px 60px rgba(239, 68, 68, 0.35)'
        }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '2px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <AlertTriangle size={36} color="#f87171" />
          </div>

          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', fontWeight: 800, marginBottom: '0.75rem', fontFamily: "'Outfit', sans-serif" }}>
            Proctoring Warning: Tab Switch / Defocus Detected
          </h2>

          <p style={{ color: '#e2e8f0', fontSize: '0.98rem', lineHeight: '1.55', marginBottom: '1.5rem' }}>
            You have navigated away from the assessment window. Switching browser tabs, minimizing the screen, or opening external applications is strictly prohibited.
          </p>

          <div style={{
            background: 'rgba(0, 0, 0, 0.65)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.75rem',
            fontSize: '0.88rem',
            color: '#fca5a5',
            textAlign: 'left',
            lineHeight: '1.5'
          }}>
            <strong style={{ color: '#ef4444' }}>Important Policy:</strong> Continued violations will result in immediate disqualification, test lock, and a final recorded score of <strong style={{ color: '#fff' }}>0</strong>.
          </div>

          <button
            onClick={handleAcknowledgeWarning}
            className="btn-gold"
            style={{ width: '100%', padding: '0.9rem 1.5rem', fontSize: '1rem' }}
          >
            <span>I Understand & Return to Fullscreen</span>
          </button>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // Link Expired Screen
  // -------------------------------------------------------------
  if (candidateInfo?.isExpired) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '1.5rem'
      }}>
        <div className="royal-glass-card solid-border" style={{
          width: '100%',
          maxWidth: '750px',
          padding: '3.5rem 3rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(10, 13, 20, 0.98) 100%)',
          borderColor: 'rgba(239, 68, 68, 0.5)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          borderRadius: '24px'
        }}>
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.18)',
            border: '2px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.35)'
          }}>
            <Lock size={40} color="#f87171" />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              border: '1px solid #ef4444',
              padding: '0.4rem 1.25rem',
              borderRadius: '20px',
              display: 'inline-block',
              letterSpacing: '0.06em'
            }}>
              LINK EXPIRED • INVITATION CLOSED
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
            color: '#ffffff',
            fontWeight: 800,
            marginBottom: '0.75rem',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Assessment Link Has Expired
          </h1>

          <p style={{
            color: '#cbd5e1',
            fontSize: '1.05rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            The deadline for this assessment invitation ({candidateInfo?.targetRole || "Role"}{candidateInfo?.companyName ? ` at ${candidateInfo.companyName}` : ''}) was <strong style={{ color: '#f87171' }}>{candidateInfo?.expiryDate ? new Date(candidateInfo.expiryDate).toLocaleString() : 'passed'}</strong>.
          </p>

          <div style={{
            background: 'rgba(12, 16, 26, 0.9)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem'
          }}>
            <h4 style={{ color: '#fca5a5', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={17} color="#ef4444" /> Next Steps:
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5', margin: 0 }}>
              If you require a link extension or re-invitation, please contact the recruitment team at <strong style={{ color: '#fff' }}>{candidateInfo?.companyName || "the hiring organization"}</strong> directly.
            </p>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
            Session ID: {token} • EVAL AI Secure Assessment Portal
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Round 5: Confidential Completion Screen (NO SCORES SHOWN)
  // -------------------------------------------------------------
  if (currentRound === 5) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '1rem'
      }}>
        <div className="royal-glass-card solid-border" style={{
          width: '100%',
          maxWidth: '850px',
          padding: '3.5rem 3rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(10, 13, 20, 0.98) 100%)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          borderRadius: '24px'
        }}>
          {/* Status Icon */}
          <div style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: autoSubmittedViolation ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.18)',
            border: `2px solid ${autoSubmittedViolation ? '#ef4444' : '#10b981'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: autoSubmittedViolation ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)'
          }}>
            {autoSubmittedViolation ? (
              <Lock size={42} color="#f87171" />
            ) : (
              <CheckCircle2 size={44} color="#34d399" />
            )}
          </div>

          {/* Badge */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              background: autoSubmittedViolation ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: autoSubmittedViolation ? '#f87171' : '#34d399',
              border: `1px solid ${autoSubmittedViolation ? '#ef4444' : '#10b981'}`,
              padding: '0.4rem 1.25rem',
              borderRadius: '20px',
              display: 'inline-block',
              letterSpacing: '0.06em'
            }}>
              {autoSubmittedViolation ? "DISQUALIFIED • PROCTORING VIOLATION" : "ASSESSMENT COMPLETED"}
            </span>
          </div>

          {/* Two-tier Clean Heading Hierarchy */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{
              fontSize: '1.25rem',
              color: autoSubmittedViolation ? '#f87171' : '#ffd700',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '0.4rem'
            }}>
              {autoSubmittedViolation ? "Assessment Terminated" : "Assessment Submitted"}
            </div>
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              color: '#ffffff',
              fontWeight: 800,
              letterSpacing: '0.01em',
              margin: 0,
              lineHeight: 1.3,
              textWrap: 'balance'
            }}>
              {candidateInfo?.name || "Candidate"}
            </h1>
          </div>

          {/* Subtitle Description */}
          <p style={{
            color: '#e2e8f0',
            fontSize: '1.05rem',
            lineHeight: '1.6',
            maxWidth: '650px',
            margin: '0 auto 2rem',
            textWrap: 'pretty'
          }}>
            {autoSubmittedViolation
              ? "Your assessment session was automatically terminated due to tab-switching and window defocus violations. In accordance with examination regulations, your overall assessment score is recorded as 0."
              : <>Your 4-round technical & verbal assessment for <strong style={{ color: '#ffd700' }}>{candidateInfo?.targetRole || "Software Engineer"}</strong> has been successfully submitted.</>}
          </p>

          {/* Details Card */}
          <div style={{
            background: 'rgba(12, 16, 26, 0.9)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem 1.75rem',
            textAlign: 'left',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
          }}>
            <h4 style={{ color: '#f5df88', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="#ffd700" /> What happens next?
            </h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
              Our EVAL AI evaluation engine and hiring committee will review your dossier and verify proctor logs alongside your ATS resume benchmarks. The recruitment team will reach out directly to your registered email (<strong style={{ color: '#ffd700' }}>{candidateInfo?.email}</strong>) with the final selection status.
            </p>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
            You may now safely close this browser window.
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Round 0: Welcome & Instructions
  // -------------------------------------------------------------
  if (currentRound === 0) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: '1rem'
      }}>
        <div className="royal-glass-card solid-border" style={{
          width: '100%',
          maxWidth: '960px',
          padding: '3.5rem 3rem',
          borderRadius: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <span className="badge-gold">
              <Sparkles size={14} /> EVAL AI CANDIDATE ASSESSMENT PORTAL
            </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', color: '#ffffff', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            Welcome, <span style={{ color: '#ffd700', textShadow: '0 0 16px rgba(212, 175, 55, 0.4)' }}>{candidateInfo?.name}</span>
          </h1>
          <p style={{ color: '#e2e8f0', fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
            You have been invited to complete a proctored 4-round technical assessment for the role of <strong style={{ color: '#ffd700' }}>{candidateInfo?.targetRole}</strong>{candidateInfo?.companyName ? <> at <strong style={{ color: '#ffd700' }}>{candidateInfo.companyName}</strong></> : ''}.
          </p>

          <div style={{
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1.25rem'
          }}>
            <ShieldCheck size={28} color="#ffd700" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                Proctoring & Anti-Cheating Examination Policy
              </h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                • Assessment runs in <strong>mandatory Fullscreen Mode</strong>.<br />
                • Tab-switching, minimizing the window, or losing window focus is strictly monitored.<br />
                • Unresolved violations will cause immediate exam termination and a recorded score of <strong>0</strong>.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {[
              { r: "Round 1", t: "Aptitude & Verbal", d: "5 Questions • 5 Mins" },
              { r: "Round 2", t: "Domain MCQs", d: "Role Specific • 8 Mins" },
              { r: "Round 3", t: "Adaptive Practical", d: "Architecture & Code" },
              { r: "Round 4", t: "Voice & Behavioral", d: "Live Speech Recognition" }
            ].map((item, idx) => (
              <div key={idx} style={{ background: 'rgba(12, 16, 26, 0.85)', border: '1px solid rgba(212, 175, 55, 0.25)', borderRadius: 'var(--radius-md)', padding: '1.4rem' }}>
                <div className="badge-gold" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>{item.r}</div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>{item.t}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{item.d}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleStartAssessment}
              className="btn-gold"
              style={{ padding: '1rem 3.5rem', fontSize: '1.15rem' }}
            >
              <Maximize size={20} />
              <span>Enter Fullscreen & Begin Assessment</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Round 1: Aptitude
  // -------------------------------------------------------------
  if (currentRound === 1) {
    const currentQ = r1Questions[r1Index];
    return (
      <div style={{ width: '100%', maxWidth: '1200px', margin: '1rem auto' }}>
        {renderWarningModal()}
        {renderProctoringHUD()}
        <ProgressBar currentRound={1} completedScores={scores} />
        {currentQ && (
          <>
            <QuestionCard
              questionNumber={r1Index + 1}
              totalQuestions={r1Questions.length}
              questionText={currentQ.question}
              tag={currentQ.category}
              timeRemaining={r1TimeRemaining}
            />
            <div style={{ marginBottom: '2rem' }}>
              <McqOptions
                options={currentQ.options}
                selectedIndex={r1Answers[r1Index]}
                onSelectOption={(idx) => setR1Answers(prev => ({ ...prev, [r1Index]: idx }))}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
              <button disabled={r1Index === 0} onClick={() => setR1Index(prev => prev - 1)} className="btn-dark">
                <ArrowLeft size={16} /> Previous
              </button>
              {r1Index === r1Questions.length - 1 ? (
                <button onClick={handleFinishRound1} className="btn-gold">
                  <span>Submit Round 1 & Proceed</span> <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={() => setR1Index(prev => prev + 1)} className="btn-gold">
                  <span>Next Question</span> <ArrowRight size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Round 2: Domain MCQs
  // -------------------------------------------------------------
  if (currentRound === 2) {
    if (r2Loading) {
      return (
        <div style={{ width: '100%', maxWidth: '700px', margin: '4rem auto', textAlign: 'center', color: '#cbd5e1' }}>
          {renderProctoringHUD()}
          <ProgressBar currentRound={2} completedScores={scores} />
          <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem' }}>Synthesizing Domain Questions...</h3>
        </div>
      );
    }
    const currentQ = r2Questions[r2Index];
    return (
      <div style={{ width: '100%', maxWidth: '1200px', margin: '1rem auto' }}>
        {renderWarningModal()}
        {renderProctoringHUD()}
        <ProgressBar currentRound={2} completedScores={scores} />
        {currentQ && (
          <>
            <QuestionCard
              questionNumber={r2Index + 1}
              totalQuestions={r2Questions.length}
              questionText={currentQ.question}
              tag={currentQ.skillTag || candidateInfo?.targetRole}
              timeRemaining={r2TimeRemaining}
            />
            <div style={{ marginBottom: '2rem' }}>
              <McqOptions
                options={currentQ.options}
                selectedIndex={r2Answers[r2Index]}
                onSelectOption={(idx) => setR2Answers(prev => ({ ...prev, [r2Index]: idx }))}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
              <button disabled={r2Index === 0} onClick={() => setR2Index(prev => prev - 1)} className="btn-dark">
                <ArrowLeft size={16} /> Previous
              </button>
              {r2Index === r2Questions.length - 1 ? (
                <button onClick={handleFinishRound2} className="btn-gold">
                  <span>Submit Round 2 & Proceed</span> <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={() => setR2Index(prev => prev + 1)} className="btn-gold">
                  <span>Next Question</span> <ArrowRight size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Round 3: Practical Assessment
  // -------------------------------------------------------------
  if (currentRound === 3) {
    if (r3Loading) {
      return (
        <div style={{ width: '100%', maxWidth: '700px', margin: '4rem auto', textAlign: 'center', color: '#cbd5e1' }}>
          {renderProctoringHUD()}
          <ProgressBar currentRound={3} completedScores={scores} />
          <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem' }}>Calibrating Adaptive Practical Scenarios...</h3>
        </div>
      );
    }
    const currentQ = r3Questions[r3Index];
    return (
      <div style={{ width: '100%', maxWidth: '1200px', margin: '1rem auto' }}>
        {renderWarningModal()}
        {renderProctoringHUD()}
        <ProgressBar currentRound={3} completedScores={scores} />
        {currentQ && (
          <>
            <div className="royal-glass-card solid-border" style={{ padding: '2.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="badge-gold">Scenario {r3Index + 1} of {r3Questions.length}</span>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: r3TimeRemaining < 60 ? '#f87171' : 'var(--gold-light)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: 'rgba(5, 7, 10, 0.6)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}>
                  <Clock size={15} />
                  <span>{Math.floor(r3TimeRemaining / 60)}:{(r3TimeRemaining % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
              <h2 style={{ fontSize: '1.35rem', color: '#ffffff', fontWeight: 600, lineHeight: '1.55', marginBottom: '1.5rem' }}>
                {currentQ.question}
              </h2>
              <textarea
                rows={9}
                value={r3Answers[r3Index] || ""}
                onChange={(e) => setR3Answers(prev => ({ ...prev, [r3Index]: e.target.value }))}
                placeholder="Write your architectural approach, code outline, and edge-case handling strategy here..."
                style={{
                  width: '100%',
                  padding: '1.1rem',
                  background: 'rgba(5, 7, 10, 0.95)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  color: '#f8fafc',
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  lineHeight: '1.5',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
              <button disabled={r3Index === 0} onClick={() => setR3Index(prev => prev - 1)} className="btn-dark">
                <ArrowLeft size={16} /> Previous
              </button>
              {r3Index === r3Questions.length - 1 ? (
                <button onClick={handleFinishRound3} className="btn-gold">
                  <span>Submit Round 3 & Proceed to Voice Round</span> <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={() => setR3Index(prev => prev + 1)} className="btn-gold">
                  <span>Next Scenario</span> <ArrowRight size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Round 4: Voice Round
  // -------------------------------------------------------------
  if (currentRound === 4) {
    if (r4Loading || isSubmitting) {
      return (
        <div style={{ width: '100%', maxWidth: '700px', margin: '4rem auto', textAlign: 'center', color: '#cbd5e1' }}>
          {renderProctoringHUD()}
          <ProgressBar currentRound={4} completedScores={scores} />
          <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginTop: '2rem' }}>
            {isSubmitting ? "Transmitting & Finalizing Assessment Submission..." : "Preparing Live Voice Prompts..."}
          </h3>
        </div>
      );
    }
    const currentQ = r4Questions[r4Index];
    return (
      <div style={{ width: '100%', maxWidth: '1200px', margin: '1rem auto' }}>
        {renderWarningModal()}
        {renderProctoringHUD()}
        <ProgressBar currentRound={4} completedScores={scores} />
        {currentQ && (
          <>
            <div className="royal-glass-card solid-border" style={{ padding: '2.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="badge-gold">Voice Prompt {r4Index + 1} of {r4Questions.length}</span>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: r4TimeRemaining < 60 ? '#f87171' : 'var(--gold-light)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: 'rgba(5, 7, 10, 0.6)',
                  padding: '0.3rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}>
                  <Clock size={15} />
                  <span>{Math.floor(r4TimeRemaining / 60)}:{(r4TimeRemaining % 60).toString().padStart(2, '0')}</span>
                </div>
              </div>
              <h2 style={{ fontSize: '1.35rem', color: '#ffffff', fontWeight: 600, lineHeight: '1.55' }}>
                {currentQ}
              </h2>
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <VoiceRecorder
                initialTranscript={r4Transcripts[r4Index] || ""}
                onTranscriptUpdate={(text) => setR4Transcripts(prev => ({ ...prev, [r4Index]: text }))}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.25rem' }}>
              <button disabled={r4Index === 0} onClick={() => setR4Index(prev => prev - 1)} className="btn-dark">
                <ArrowLeft size={16} /> Previous
              </button>
              {r4Index === r4Questions.length - 1 ? (
                <button onClick={() => handleFinalSubmit(false)} className="btn-gold">
                  <span>Complete Assessment & Submit</span> <Award size={16} />
                </button>
              ) : (
                <button onClick={() => setR4Index(prev => prev + 1)} className="btn-gold">
                  <span>Next Voice Question</span> <ArrowRight size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return null;
}
