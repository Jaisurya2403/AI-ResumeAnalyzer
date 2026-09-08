import React from 'react';
import { Github, Star, GitFork, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

export default function GitHubProfileCard({ githubData }) {
  if (!githubData) {
    return (
      <div className="royal-glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Github size={24} color="var(--text-muted)" />
        </div>
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>GitHub Profile Detection</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No public GitHub link detected in resume text or API query unauthenticated.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="royal-glass-card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {githubData.avatarUrl ? (
            <img
              src={githubData.avatarUrl}
              alt={githubData.username}
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                border: '2px solid var(--gold-light)',
                boxShadow: '0 0 14px rgba(212, 175, 55, 0.4)'
              }}
            />
          ) : (
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--grad-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Github size={28} color="#07080c" />
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>
                {githubData.name || githubData.username}
              </h4>
              <span className="badge-emerald" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={12} /> Verified GitHub
              </span>
            </div>
            <a
              href={githubData.profileUrl || `https://github.com/${githubData.username}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--gold-light)', fontSize: '0.82rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
            >
              @{githubData.username} <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Quick telemetry counter */}
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="font-royal" style={{ fontSize: '1.2rem', color: 'var(--gold-light)', fontWeight: 700 }}>
              {githubData.publicRepos || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Public Repos</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="font-royal" style={{ fontSize: '1.2rem', color: 'var(--gold-light)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
              <Star size={14} fill="var(--gold-light)" color="var(--gold-light)" /> {githubData.totalStars || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Stars Earned</div>
          </div>
        </div>
      </div>

      {/* Top Languages */}
      {githubData.topLanguages && githubData.topLanguages.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
            Top Active Languages in Repositories:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {githubData.topLanguages.map((lang, idx) => (
              <span key={idx} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '0.2rem 0.6rem',
                fontSize: '0.75rem',
                color: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold-light)' }} />
                {lang.name} ({lang.count} repos)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Featured Repositories */}
      {githubData.featuredRepos && githubData.featuredRepos.length > 0 && (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', fontWeight: 500 }}>
            Featured Code Repositories:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {githubData.featuredRepos.map((repo, i) => (
              <a
                key={i}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  background: 'rgba(10, 13, 20, 0.8)',
                  border: '1px solid rgba(212, 175, 55, 0.15)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                <div>
                  <div style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <BookOpen size={13} /> {repo.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: '1.3', marginBottom: '0.5rem', maxHeight: '35px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {repo.description}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  <span>{repo.language || 'Code'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--gold-light)' }}>
                    <Star size={11} fill="var(--gold-light)" /> {repo.stars}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
