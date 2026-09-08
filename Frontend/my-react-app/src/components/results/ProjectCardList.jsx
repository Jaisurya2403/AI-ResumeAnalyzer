import React from 'react';
import { Layers, Sparkles, CheckCircle } from 'lucide-react';

export default function ProjectCardList({ projects = [] }) {
  return (
    <div className="royal-glass-card" style={{ padding: '1.75rem', height: '100%' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 className="font-royal" style={{ fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={18} color="var(--gold-light)" />
          Demonstrated Projects & Engineering Impact
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Extracted architectural initiatives and quantifiable deliverables
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(!projects || projects.length === 0) ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No specific projects parsed from resume.
          </div>
        ) : (
          projects.map((proj, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(10, 13, 20, 0.7)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '1.1rem 1.25rem',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <h4 style={{ color: 'var(--gold-light)', fontSize: '0.95rem', fontWeight: 600 }}>
                  {proj.name}
                </h4>
                <span className="badge-gold" style={{ fontSize: '0.65rem' }}>
                  Project {idx + 1}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {proj.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
