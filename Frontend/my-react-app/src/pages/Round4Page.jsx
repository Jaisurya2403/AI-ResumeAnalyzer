import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, MessageSquare, Volume2, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiClient } from '../services/aiClient';
import { storageService } from '../services/storageService';
import ProgressBar from '../components/common/ProgressBar';
import VoiceRecorder from '../components/interview/VoiceRecorder';

export default function Round4Page() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transcripts, setTranscripts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const projects = state.resumeProfile?.projects || [
    { name: "Omnisync Real-time Canvas", description: "Collaborative whiteboard engine with CRDT state synchronization." }
  ];
  const domain = state.jobRole?.domain || "Software";
  const jobRole = state.jobRole || { title: "Full Stack Engineer" };
  const resumeQuality = state.resumeProfile?.resumeQuality || {};

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

  const handleTranscriptChange = (text) => {
    setTranscripts(prev => ({
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
    setIsFinalizing(true);

    try {
      const transcriptList = questions.map((_, i) => transcripts[i] || "");
      
      // 1. Score Round 4 Voice/Communication with AI
      const commScoreResult = await aiClient.scoreCommunicationTranscripts(questions, transcriptList, state.resumeProfile, jobRole);
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
          answers: questions.map((q, i) => ({
            question: q,
            transcript: transcripts[i] || "No voice response recorded",
            subScores: commScoreResult
          }))
        }
      });

      // 2. Synthesize Final Report with AI
      const profile = state.resumeProfile || { candidateName: "Candidate", skills: [] };
      const report = await aiClient.generateFinalReport(finalRoundScores, profile, jobRole);

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
          round4: questions.map((q, i) => ({ question: q, transcript: transcripts[i] || "" }))
        },
        finalReport: report
      });

      navigate(`/results/${resultId}/report`);
    } catch (err) {
      console.error("Error finalizing interview report:", err);
      navigate(`/results/${state.resultId || 'latest'}/report`);
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
      {/* Progress Track */}
      <ProgressBar currentRound={4} completedScores={state.roundScores} />

      {/* Question Card */}
      <div className="royal-glass-card solid-border" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span className="badge-gold">Voice Prompt {currentIndex + 1} of {questions.length}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Volume2 size={13} color="var(--gold-light)" /> Speech & Technical Articulation
          </span>
        </div>

        <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 600, lineHeight: '1.5' }}>
          {currentQ}
        </h2>
      </div>

      {/* Voice Recorder Component */}
      <div style={{ marginBottom: '2rem' }}>
        <VoiceRecorder
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
