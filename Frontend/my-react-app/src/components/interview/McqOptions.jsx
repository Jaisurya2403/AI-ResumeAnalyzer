import React from 'react';
import { Check } from 'lucide-react';

export default function McqOptions({
  options = [],
  selectedIndex = null,
  onSelectOption,
  disabled = false,
  showResult = false,
  correctIndex = null
}) {
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {options.map((option, idx) => {
        const isSelected = selectedIndex === idx;
        const isCorrect = showResult && correctIndex === idx;
        const isWrong = showResult && isSelected && correctIndex !== idx;

        let borderStyle = '1px solid rgba(212, 175, 55, 0.2)';
        let bgStyle = 'rgba(12, 15, 23, 0.7)';
        let textColor = 'var(--text-secondary)';

        if (isSelected) {
          borderStyle = '1px solid var(--gold-light)';
          bgStyle = 'rgba(212, 175, 55, 0.14)';
          textColor = '#fff';
        }
        if (isCorrect) {
          borderStyle = '1px solid var(--accent-emerald)';
          bgStyle = 'rgba(16, 185, 129, 0.18)';
          textColor = '#34d399';
        } else if (isWrong) {
          borderStyle = '1px solid var(--accent-crimson)';
          bgStyle = 'rgba(244, 63, 94, 0.18)';
          textColor = '#fb7185';
        }

        return (
          <button
            key={idx}
            type="button"
            onClick={() => !disabled && onSelectOption(idx)}
            disabled={disabled}
            style={{
              padding: '1.1rem 1.35rem',
              borderRadius: 'var(--radius-md)',
              border: borderStyle,
              background: bgStyle,
              color: textColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              cursor: disabled ? 'default' : 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isSelected ? '0 0 16px rgba(212, 175, 55, 0.2)' : 'none',
              transform: isSelected ? 'translateX(4px)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isSelected ? 'var(--grad-gold)' : 'rgba(255, 255, 255, 0.05)',
                color: isSelected ? '#07080c' : 'var(--gold-light)',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {letters[idx] || (idx + 1)}
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: isSelected ? 600 : 400, lineHeight: '1.4' }}>
                {option}
              </span>
            </div>

            {isSelected && (
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: 'var(--gold-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Check size={14} color="#07080c" strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
