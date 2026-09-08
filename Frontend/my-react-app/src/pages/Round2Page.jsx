import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Sparkles, Cpu, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { aiClient } from '../services/aiClient';
import ProgressBar from '../components/common/ProgressBar';
import QuestionCard from '../components/interview/QuestionCard';
import McqOptions from '../components/interview/McqOptions';

export default function Round2Page() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(480); // 8 mins total

  const skills = state.resumeProfile?.skills || [
    { name: "React", percent: 90 },
    { name: "Node.js", percent: 85 },
    { name: "Database Design", percent: 80 }
  ];
  const jobRole = state.jobRole || { title: "Full Stack Engineer", domain: "Software" };
  const resumeQuality = state.resumeProfile?.resumeQuality || {};
  const projects = state.resumeProfile?.projects || [];

  useEffect(() => {
    let isMounted = true;

    async function loadMCQs() {
      setIsLoading(true);
      try {
        const seed = String(state.candidateId || state.resultId || state.userName || Date.now());
        const mcqs = await aiClient.generateDomainMCQs(skills, jobRole, resumeQuality, projects, seed);
        if (isMounted) {
          setQuestions(mcqs || []);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to generate MCQs with Qwen AI:", err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMCQs();

    return () => {
      isMounted = false;
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isLoading) return;
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
  }, [isLoading, questions, answers]);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optionIdx) => {
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: optionIdx
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

  const handleSubmit = () => {
    if (questions.length === 0) return;

    let correctCount = 0;
    const answeredArray = [];

    questions.forEach((q, idx) => {
      const selected = answers[idx];
      const isCorrect = selected === q.correctIndex;
      if (isCorrect) correctCount++;
      answeredArray.push({
        questionId: q.id || idx + 1,
        question: q.question,
        selectedOption: selected !== undefined ? q.options[selected] : "Unanswered",
        correctOption: q.options[q.correctIndex],
        skillTag: q.skillTag,
        isCorrect
      });
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);

    dispatch({
      type: 'SET_ROUND_SCORE',
      payload: { round: 'round2', score: scorePercent }
    });

    dispatch({
      type: 'SET_ROUND_ANSWERS',
      payload: { round: 'round2', answers: answeredArray }
    });

    navigate('/interview/round3');
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '860px', margin: '3rem auto', textAlign: 'center' }}>
        <ProgressBar currentRound={2} completedScores={state.roundScores} />
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
            <Cpu size={28} color="var(--gold-light)" />
          </div>
          <h3 className="font-royal" style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
            Qwen AI Synthesizing Domain Questions
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Testing verified resume proficiencies ({skills.slice(0, 4).map(s => s.name).join(", ")}) for {jobRole.title}...
          </p>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        No questions generated.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Progress Track */}
      <ProgressBar currentRound={2} completedScores={state.roundScores} />

      {/* Question Card */}
      <QuestionCard
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        questionText={currentQ.question}
        tag={currentQ.skillTag || jobRole.title}
        timeRemaining={timeRemaining}
      />

      {/* MCQ Options */}
      <div style={{ marginBottom: '2rem' }}>
        <McqOptions
          options={currentQ.options}
          selectedIndex={answers[currentIndex]}
          onSelectOption={handleSelectOption}
        />
      </div>

      {/* Bottom Action Controls */}
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

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {questions.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '6px',
                border: currentIndex === i ? '1px solid var(--gold-light)' : '1px solid rgba(255, 255, 255, 0.1)',
                background: currentIndex === i
                  ? 'var(--grad-gold)'
                  : (answers[i] !== undefined ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)'),
                color: currentIndex === i ? '#07080c' : (answers[i] !== undefined ? 'var(--gold-light)' : 'var(--text-muted)'),
                fontWeight: 600,
                fontSize: '0.78rem',
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
            <span>Submit & Enter Round 3</span>
            <ArrowRight size={16} />
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
