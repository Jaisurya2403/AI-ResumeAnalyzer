import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/common/ProgressBar';
import QuestionCard from '../components/interview/QuestionCard';
import McqOptions from '../components/interview/McqOptions';
import { getRandomAptitudeQuestions } from '../data/aptitudeQuestions';

export default function Round1Page() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [index]: selectedOptionIndex }
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 mins total

  useEffect(() => {
    const qList = getRandomAptitudeQuestions(5);
    setQuestions(qList);
  }, []);

  // Timer countdown
  useEffect(() => {
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
  }, [questions, answers]);

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
        questionId: q.id,
        question: q.question,
        selectedOption: selected !== undefined ? q.options[selected] : "Unanswered",
        correctOption: q.options[q.correctIndex],
        isCorrect
      });
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);

    dispatch({
      type: 'SET_ROUND_SCORE',
      payload: { round: 'round1', score: scorePercent }
    });

    dispatch({
      type: 'SET_ROUND_ANSWERS',
      payload: { round: 'round1', answers: answeredArray }
    });

    navigate('/interview/round2');
  };

  if (!currentQ) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Loading Aptitude Module...
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto' }}>
      {/* Progress Track */}
      <ProgressBar currentRound={1} completedScores={state.roundScores} />

      {/* Question Card */}
      <QuestionCard
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        questionText={currentQ.question}
        tag={currentQ.category || "Aptitude"}
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
                  : (answers[i] !== undefined ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.04)'),
                color: currentIndex === i ? '#07080c' : (answers[i] !== undefined ? 'var(--gold-light)' : 'var(--text-muted)'),
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
            <span>Submit & Enter Round 2</span>
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
