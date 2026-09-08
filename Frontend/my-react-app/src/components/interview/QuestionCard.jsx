import React from 'react';
import { HelpCircle, Clock, Sparkles } from 'lucide-react';

export default function QuestionCard({
  questionNumber = 1,
  totalQuestions = 5,
  questionText = "",
  tag = "Technical",
  timeRemaining = null
}) {
  return (
    <div className="royal-glass-card solid-border" style={{
      padding: '2rem',
      marginBottom: '1.5rem',
      background: 'rgba(12, 15, 23, 0.85)'
    }}>
      {/* Meta Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span className="badge-gold" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
            Question {questionNumber} of {totalQuestions}
          </span>
          {tag && (
            <span style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 'var(--radius-full)',
              padding: '0.25rem 0.75rem',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)'
            }}>
              {tag}
            </span>
          )}
        </div>

        {timeRemaining !== null && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: timeRemaining < 30 ? 'var(--accent-crimson)' : 'var(--gold-light)',
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
        )}
      </div>

      {/* Question Content */}
      <h2 style={{
        fontSize: '1.25rem',
        color: '#fff',
        fontWeight: 600,
        lineHeight: '1.5',
        letterSpacing: '0.01em'
      }}>
        {questionText}
      </h2>
    </div>
  );
}
