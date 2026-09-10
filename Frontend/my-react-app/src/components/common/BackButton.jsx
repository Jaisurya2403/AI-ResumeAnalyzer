import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({
  to,
  onClick,
  label = "Back",
  style = {},
  className = "btn-dark"
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.84rem',
        fontWeight: 600,
        padding: '0.45rem 0.95rem',
        borderRadius: 'var(--radius-full)',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        color: 'var(--gold-light, #ffd700)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        ...style
      }}
      title="Go back to previous view"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--gold-light, #ffd700)';
        e.currentTarget.style.transform = 'translateX(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.35)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      <ArrowLeft size={15} />
      <span>{label}</span>
    </button>
  );
}
