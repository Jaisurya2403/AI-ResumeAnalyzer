import React from 'react';
import { Github, Linkedin, Code, Globe, ExternalLink } from 'lucide-react';

export default function LinkBadges({ links = {} }) {
  if (!links) return null;

  const items = [
    { key: 'github', label: 'GitHub', icon: Github, color: '#e2e8f0', url: links.github },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#38bdf8', url: links.linkedin },
    { key: 'leetcode', label: 'LeetCode', icon: Code, color: '#fbbf24', url: links.leetcode },
    { key: 'portfolio', label: 'Portfolio', icon: Globe, color: 'var(--gold-light)', url: links.portfolio }
  ].filter(item => Boolean(item.url));

  if (items.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Profiles:</span>
      {items.map(item => {
        const Icon = item.icon;
        return (
          <a
            key={item.key}
            href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(212, 175, 55, 0.25)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--gold-light)';
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.25)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <Icon size={14} color={item.color} />
            <span>{item.label}</span>
            <ExternalLink size={11} color="var(--text-muted)" />
          </a>
        );
      })}
    </div>
  );
}
