import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

export default function ProgressBar({ rounds = [
  { id: 1, name: "Aptitude & Verbal", path: "/interview/round1" },
  { id: 2, name: "Domain MCQs", path: "/interview/round2" },
  { id: 3, name: "Adaptive Practical", path: "/interview/round3" },
  { id: 4, name: "Voice & Behavioral", path: "/interview/round4" }
], currentRound = 1, completedScores = {} }) {
  return (
    <div style={{
      width: '100%',
      marginBottom: '2rem',
      background: 'rgba(12, 16, 25, 0.65)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(212, 175, 55, 0.22)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.75rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        {rounds.map((round, idx) => {
          const isDone = completedScores[`round${round.id}`] !== undefined && completedScores[`round${round.id}`] !== null;
          const isCurrent = currentRound === round.id;
          const isPending = !isDone && !isCurrent;

          return (
            <React.Fragment key={round.id}>
              {/* Step indicator */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 2,
                cursor: 'default'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                  background: isCurrent
                    ? 'var(--grad-gold)'
                    : (isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)'),
                  border: isCurrent
                    ? '2px solid #fff'
                    : (isDone ? '2px solid var(--accent-emerald)' : '1px solid rgba(255, 255, 255, 0.15)'),
                  color: isCurrent ? '#07080c' : (isDone ? 'var(--accent-emerald)' : 'var(--text-muted)'),
                  boxShadow: isCurrent ? '0 0 18px rgba(212, 175, 55, 0.6)' : 'none'
                }}>
                  {isDone ? <Check size={18} strokeWidth={3} /> : round.id}
                </div>

                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--gold-light)' : (isDone ? '#fff' : 'var(--text-muted)'),
                  textAlign: 'center'
                }}>
                  Round {round.id}
                </div>
                <div style={{
                  fontSize: '0.72rem',
                  color: isCurrent ? 'var(--text-secondary)' : 'var(--text-muted)',
                  textAlign: 'center',
                  maxWidth: '120px'
                }}>
                  {round.name}
                </div>
              </div>

              {/* Connecting line */}
              {idx < rounds.length - 1 && (
                <div style={{
                  flex: 1,
                  height: '2px',
                  background: isDone
                    ? 'var(--accent-emerald)'
                    : 'rgba(212, 175, 55, 0.18)',
                  margin: '0 0.75rem',
                  transform: 'translateY(-18px)',
                  zIndex: 1,
                  transition: 'background 0.4s'
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
