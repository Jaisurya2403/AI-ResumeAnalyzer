import React from 'react';

export default function ScoreBadge({ score = 0, size = 110, strokeWidth = 8, label = "Score", sublabel = "" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.max(0, Math.min(100, Math.round(score || 0)));
  const offset = circumference - (safeScore / 100) * circumference;

  let colorGradId = "goldGrad";
  if (safeScore >= 80) colorGradId = "goldGrad";
  else if (safeScore >= 60) colorGradId = "emeraldGrad";
  else colorGradId = "amberGrad";

  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="50%" stopColor="#f5df88" />
              <stop offset="100%" stopColor="#aa820a" />
            </linearGradient>
            <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Foreground animated value */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${colorGradId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </svg>

        {/* Center text */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <span className="font-royal" style={{
            fontSize: size > 90 ? '1.75rem' : '1.25rem',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1
          }}>
            {safeScore}<span style={{ fontSize: '0.65em', color: 'var(--gold-light)' }}>%</span>
          </span>
          {sublabel && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span style={{
          marginTop: '0.5rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textAlign: 'center'
        }}>
          {label}
        </span>
      )}
    </div>
  );
}
