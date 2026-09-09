import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Code, Layers, Sparkles, CheckCircle2, ShieldAlert, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiClient } from '../services/aiClient';
import ProgressBar from '../components/common/ProgressBar';
import ProctoringCamera from '../components/interview/ProctoringCamera';

export default function Round3Page() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isScoring, setIsScoring] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 mins

  const round2Score = state.roundScores?.round2 ?? 75;
  const isAdvanced = round2Score >= 70;
  const difficulty = isAdvanced ? "advanced" : "foundational";
  const domain = state.jobRole?.domain || "Software";
  const jobRole = state.jobRole || { title: "Full Stack Engineer" };
  const projects = state.resumeProfile?.projects || [];
  const skills = state.resumeProfile?.skills || [];

  // Ensure Fullscreen mode during assessment
  useEffect(() => {
    const enterFS = async () => {
      try {
        if (!document.fullscreenElement) {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen().catch(() => {});
          } else if (document.documentElement.webkitRequestFullscreen) {
            await document.documentElement.webkitRequestFullscreen().catch(() => {});
          }
        }
      } catch (e) {}
    };
    enterFS();
    window.addEventListener('click', enterFS, { once: true });
    return () => {
      window.removeEventListener('click', enterFS);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPracticalQuestions() {
      setIsLoading(true);
      try {
        const seed = String(state.candidateId || state.resultId || state.userName || Date.now());
        const qList = await aiClient.generatePracticalQuestions(domain, jobRole, difficulty, round2Score, projects, skills, seed);
        if (isMounted) {
          setQuestions(qList || []);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to generate practical questions with Qwen AI:", err);
        if (isMounted) setIsLoading(false);
      }
    }

    loadPracticalQuestions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isLoading || isScoring) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading, isScoring, questions, answers]);

  const currentQ = questions[currentIndex];

  const handleAnswerChange = (text) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: text
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (questions.length === 0) return;
    setIsScoring(true);

    try {
      const answersArray = questions.map((_, i) => answers[i] || "");
      const scoringResult = await aiClient.scorePracticalAnswers(questions, answersArray, state.resumeProfile, jobRole);

      const score = typeof scoringResult.averageScore === 'number' ? scoringResult.averageScore : 0;

      dispatch({
        type: 'SET_ROUND_SCORE',
        payload: { round: 'round3', score }
      });

      dispatch({
        type: 'SET_ROUND_ANSWERS',
        payload: {
          round: 'round3',
          answers: questions.map((q, i) => ({
            question: q.question,
            expectedApproach: q.expectedApproach,
            candidateAnswer: answers[i] || "No answer provided",
            score: scoringResult.perQuestionScores?.[i] ?? score,
            feedback: scoringResult.feedback
          }))
        }
      });

      navigate('/interview/round4');
    } catch (err) {
      console.error("Scoring error in Round 3:", err);
      const answersArray = questions.map((_, i) => answers[i] || "");
      const hasAny = answersArray.some(a => a && a.trim().length > 0);
      dispatch({
        type: 'SET_ROUND_SCORE',
        payload: { round: 'round3', score: hasAny ? 50 : 0 }
      });
      navigate('/interview/round4');
    }
  };

  if (isLoading || isScoring) {
    return (
      <div style={{ maxWidth: '860px', margin: '3rem auto', textAlign: 'center' }}>
        <ProgressBar currentRound={3} completedScores={state.roundScores} />
        <div className="royal-glass-card solid-border" style={{ padding: '3.5rem 2rem', marginTop: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '2px dashed var(--gold-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            animation: 'spinSlow 10s linear infinite'
          }}>
            <Code size={28} color="var(--gold-light)" />
          </div>
          <h3 className="font-royal" style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
            {isScoring ? "Qwen AI Evaluating Practical Solutions" : `Qwen AI Adapting Questions (${difficulty.toUpperCase()} Track)`}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isScoring
              ? "Qwen AI Principal Architect evaluating edge-case resilience, architectural choices, and complexity..."
              : `Round 2 score was ${round2Score}%. Dynamic branching calibrated to ${difficulty} difficulty based on resume projects.`}
          </p>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        No practical questions available.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* MediaPipe AI Proctoring Camera HUD with Voice Activity Detection */}
      <ProctoringCamera enableAudioDetection={true} />

      {/* Progress Track */}
      <ProgressBar currentRound={3} completedScores={state.roundScores} />

      {/* Adaptive Difficulty Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        background: isAdvanced ? 'rgba(212, 175, 55, 0.1)' : 'rgba(6, 182, 212, 0.1)',
        border: isAdvanced ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(6, 182, 212, 0.3)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color={isAdvanced ? "var(--gold-light)" : "var(--accent-cyan)"} />
          <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>
            Adaptive Engine: {difficulty.toUpperCase()} Challenge Level
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Calibrated from Round 2 Score: <strong>{round2Score}%</strong>
        </span>
      </div>

      {/* Question Card */}
      <div className="royal-glass-card solid-border" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="badge-gold">Scenario {currentIndex + 1} of {questions.length}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              color: timeRemaining < 60 ? 'var(--accent-crimson)' : 'var(--gold-light)',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: 'rgba(5, 7, 10, 0.6)',
              padding: '0.3rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(212, 175, 55, 0.2)'
            }}>
              <Clock size={15} />
              <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>System Architecture & Implementation</span>
          </div>
        </div>

        <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 600, lineHeight: '1.5', marginBottom: '1.5rem' }}>
          {currentQ.question}
        </h2>

        {/* Text/Code Editor Area */}
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
            <span>Architectural Explanation & Implementation Strategy:</span>
            <span>{(answers[currentIndex] || "").length} characters</span>
          </label>
          <textarea
            rows={9}
            value={answers[currentIndex] || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={`Outline your architecture, state flow, algorithms, trade-offs, and edge case handling...\n\nExample:\n1. Core Architecture Strategy\n2. Concurrency & Race Condition Safeguards\n3. Fallback & Graceful Degradation`}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'rgba(5, 7, 10, 0.9)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#f8fafc',
              fontSize: '0.92rem',
              lineHeight: '1.6',
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingTop: '1rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="btn-dark"
        >
          <ArrowLeft size={16} />
          <span>Previous</span>
        </button>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {questions.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: currentIndex === i ? '1px solid var(--gold-light)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: currentIndex === i
                  ? 'var(--grad-gold)'
                  : ((answers[i] || "").trim().length > 0 ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)'),
                color: currentIndex === i ? '#07080c' : ((answers[i] || "").trim().length > 0 ? 'var(--gold-light)' : 'var(--text-muted)'),
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentIndex === questions.length - 1 ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="btn-gold"
          >
            <span>Submit & Enter Final Voice Round</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="btn-gold"
          >
            <span>Next Scenario</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
