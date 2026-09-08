import React from 'react';
import { Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(212, 175, 55, 0.15)',
      background: 'rgba(5, 6, 9, 0.92)',
      padding: '2.5rem 2rem 2rem',
      marginTop: 'auto',
      color: 'var(--text-muted)',
      fontSize: '0.85rem'
    }}>
      <div style={{
        maxWidth: '1560px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'rgba(212, 175, 55, 0.15)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={14} color="var(--gold-primary)" />
          </div>
          <div>
            <span style={{ color: '#fff', fontWeight: 600 }}>EVAL AI</span> • Intelligent Career Assessment & Multi-Round Voice Simulator
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Shield size={14} color="var(--gold-light)" />
            Client-Side Privacy • In-Browser Persistence
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Cpu size={14} color="var(--accent-emerald)" />
            Adaptive AI Engine
          </span>
        </div>
      </div>
    </footer>
  );
}
