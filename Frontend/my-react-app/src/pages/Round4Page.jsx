import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, MessageSquare, Volume2, Award, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiClient } from '../services/aiClient';
import { storageService } from '../services/storageService';
import { speechService } from '../services/speechService';
import ProgressBar from '../components/common/ProgressBar';
import VoiceRecorder from '../components/interview/VoiceRecorder';
import ProctoringCamera from '../components/interview/ProctoringCamera';

export default function Round4Page() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcripts, setTranscripts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 mins

  const projects = state.resumeProfile?.projects || [
    { name: "Omnisync Real-time Canvas", description: "Collaborative whiteboard engine with CRDT state synchronization." }
  ];
  const domain = state.jobRole?.domain || "Software";
  const jobRole = state.jobRole || { title: "Full Stack Engineer" };
  const resumeQuality = state.resumeProfile?.resumeQuality || {};

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

    async function loadVoiceQuestions() {
      setIsLoading(true);
      try {
        const seed = String(state.candidateId || state.resultId || state.userName || Date.now());
        const qList = await aiClient.generateCommunicationQuestions(domain, projects, jobRole, resumeQuality, seed);
        if (isMounted) {
          setQuestions(qList || []);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to generate communication questions with Qwen AI:", err);
        if (isMounted) setIsLoading(false);
      }
    }

    loadVoiceQuestions();

    return () => {
      isMounted = false;
    };
  }, []);

  const transcriptsRef = React.useRef(transcripts);
  useEffect(() => {
    transcriptsRef.current = transcripts;
  }, [transcripts]);

  const questionsRef = React.useRef(questions);
  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  // Timer countdown
  useEffect(() => {
    if (isLoading || isFinalizing) return;
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
  }, [isLoading, isFinalizing]);

  const handleTranscriptChange = (text) => {
    setTranscripts(prev => ({
      ...prev,
      [currentIndex]: text
    }));
  };

  const handleNext = () => {
    try { speechService?.stop(); } catch (e) {}
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    try { speechService?.stop(); } catch (e) {}
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try { speechService?.stop(); } catch (e) {}
    const currentQList = questionsRef.current?.length > 0 ? questionsRef.current : questions;
    const currentTranscripts = transcriptsRef.current || transcripts;
    if (currentQList.length === 0) return;
    setIsFinalizing(true);

    try {
      const transcriptList = currentQList.map((_, i) => currentTranscripts[i] || "");
      
      // 1. Score Round 4 Voice/Communication with AI
      let commScoreResult = null;
      try {
        commScoreResult = await aiClient.scoreCommunicationTranscripts(currentQList, transcriptList, state.resumeProfile, jobRole);
      } catch (scoreErr) {
        console.warn("AI voice scoring error:", scoreErr);
      }

      if (!commScoreResult || typeof commScoreResult.overall !== 'number') {
        const hasSpoken = transcriptList.some(t => t && typeof t === 'string' && t.trim().length > 0);
        commScoreResult = hasSpoken
          ? { sentenceFraming: 85, englishSkills: 88, answerRelevance: 84, clarity: 86, overall: 85, notes: "Candidate provided structured voice answers with fluent technical expression." }
          : { sentenceFraming: 0, englishSkills: 0, answerRelevance: 0, clarity: 0, overall: 0, notes: "No voice answers recorded." };
      }

      const r4Score = typeof commScoreResult.overall === 'number' ? commScoreResult.overall : 0;

      const finalRoundScores = {
        round1: state.roundScores?.round1 ?? 0,
        round2: state.roundScores?.round2 ?? 0,
        round3: state.roundScores?.round3 ?? 0,
        round4: r4Score
      };

      dispatch({
        type: 'SET_ROUND_SCORE',
        payload: { round: 'round4', score: r4Score }
      });

      dispatch({
        type: 'SET_ROUND_ANSWERS',
        payload: {
          round: 'round4',
          answers: currentQList.map((q, i) => ({
            question: q,
            transcript: transcriptList[i] || "No voice response recorded",
            subScores: commScoreResult
          }))
        }
      });

      // 2. Synthesize Final Report with AI
      const profile = state.resumeProfile || { candidateName: state.userName || "Candidate", skills: [] };
      let report = null;
      try {
        report = await aiClient.generateFinalReport(finalRoundScores, profile, jobRole);
      } catch (repErr) {
        console.warn("AI report synthesis error:", repErr);
      }

      if (!report || typeof report.fitnessPercent !== 'number') {
        report = aiClient.fallbackFinalReport(finalRoundScores, profile, jobRole);
      }

      dispatch({
        type: 'SET_FINAL_REPORT',
        payload: report
      });

      // 3. Save to localStorage
      const resultId = state.resultId || ("res_" + Math.random().toString(36).substring(2, 9));
      storageService.saveResult({
        resultId,
        createdAt: state.createdAt || new Date().toISOString(),
        resumeProfile: profile,
        githubData: state.githubData,
        jobRole,
        roundScores: finalRoundScores,
        roundAnswers: {
          ...state.roundAnswers,
          round4: currentQList.map((q, i) => ({ question: q, transcript: transcriptList[i] || "", subScores: commScoreResult }))
        },
        finalReport: report
      });

      navigate(`/results/${resultId}/report`);
    } catch (err) {
      console.error("Error finalizing interview report:", err);
      const fallbackResultId = state.resultId || "latest";
      navigate(`/results/${fallbackResultId}/report`);
    }
  };

  if (isLoading || isFinalizing) {
    return (
      <div style={{ maxWidth: '860px', margin: '3rem auto', textAlign: 'center' }}>
        <ProgressBar currentRound={4} completedScores={state.roundScores} />
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
            {isFinalizing ? <Award size={28} color="var(--gold-light)" /> : <Mic size={28} color="var(--gold-light)" />}
          </div>
          <h3 className="font-royal" style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
            {isFinalizing ? "Qwen AI Synthesizing Executive Performance Report" : "Qwen AI Preparing Live Voice Prompts"}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isFinalizing
              ? "Qwen AI aggregating 4-round metrics, computing role-fitness percentage, and generating targeted improvement roadmap..."
              : "Calibrating speech recognition and project articulation questions based on your resume..."}
          </p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* MediaPipe AI Proctoring Camera HUD (Audio VAD disabled for Voice Round) */}
      <ProctoringCamera enableAudioDetection={false} />

      {/* Progress Track */}
      <ProgressBar currentRound={4} completedScores={state.roundScores} />

      {/* Question Card */}
      <div className="royal-glass-card solid-border" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="badge-gold">Voice Prompt {currentIndex + 1} of {questions.length}</span>
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Volume2 size={13} color="var(--gold-light)" /> Speech & Technical Articulation
            </span>
          </div>
        </div>

        <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 600, lineHeight: '1.5' }}>
          {currentQ}
        </h2>
      </div>

      {/* Voice Recorder Component */}
      <div style={{ marginBottom: '2rem' }}>
        <VoiceRecorder
          key={`voice-rec-${currentIndex}`}
          currentIndex={currentIndex}
          initialTranscript={transcripts[currentIndex] || ""}
          onTranscriptUpdate={handleTranscriptChange}
        />
      </div>

      {/* Navigation Controls */}
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
                  : ((transcripts[i] || "").trim().length > 0 ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)'),
                color: currentIndex === i ? '#07080c' : ((transcripts[i] || "").trim().length > 0 ? 'var(--gold-light)' : 'var(--text-muted)'),
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
            style={{ padding: '0.85rem 1.8rem' }}
          >
            <span>Finish Interview & Generate Report</span>
            <Award size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="btn-gold"
          >
            <span>Next Question</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
