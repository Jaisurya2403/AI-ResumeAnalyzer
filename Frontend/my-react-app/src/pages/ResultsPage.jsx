import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, UserCheck, BookOpen, Code2, Globe, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import SkillRadarChart from '../components/results/SkillRadarChart';
import ProjectCardList from '../components/results/ProjectCardList';
import GitHubProfileCard from '../components/results/GitHubProfileCard';
import LinkBadges from '../components/results/LinkBadges';

export default function ResultsPage() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  // If page is refreshed or loaded from direct link, load from localStorage if not present in memory
  useEffect(() => {
    if (!state.resumeProfile && id && id !== 'latest') {
      const saved = storageService.getResultById(id);
      if (saved) {
        dispatch({ type: 'LOAD_SAVED_RESULT', payload: saved });
      }
    }
  }, [id, state.resumeProfile]);

  const profile = state.resumeProfile || {
    candidateName: "Candidate",
    skills: [
      { name: "Frontend Development", percent: 85 },
      { name: "Backend Systems", percent: 88 },
      { name: "System Architecture", percent: 82 },
      { name: "Cloud & APIs", percent: 80 },
      { name: "Database Design", percent: 84 }
    ],
    projects: [
      { name: "Core Application Platform", description: "Scalable full-stack application with modular architecture and high test coverage." },
      { name: "Distributed Data Engine", description: "High-performance processing middleware optimizing query latency and system throughput." }
    ],
    languages: ["JavaScript", "TypeScript", "Python", "SQL"],
    links: { github: null, linkedin: null, leetcode: null, portfolio: null },
    summary: "Dedicated software engineer with a strong foundation in core engineering, full-stack development, and scalable cloud solutions."
  };

  const displayName = (profile.candidateName && profile.candidateName !== "Candidate")
    ? profile.candidateName
    : (profile.candidateName || state.resumeProfile?.candidateName || "Candidate Profile");

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="royal-glass-card solid-border" style={{
        padding: '2rem 2.5rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12) 0%, rgba(12, 15, 23, 0.9) 100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span className="badge-gold" style={{ fontSize: '0.75rem' }}>
                <Sparkles size={13} /> AI RESUME PROFILE VERIFIED
              </span>
            </div>
            <h1 className="font-royal" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: '#fff', fontWeight: 800 }}>
              {displayName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '720px', marginTop: '0.5rem', lineHeight: '1.6' }}>
              {profile.summary}
            </p>

            <div style={{ marginTop: '1.25rem' }}>
              <LinkBadges links={profile.links} />
            </div>
          </div>

          {/* CTA Button */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end' }}>
            <Link
              to="/interview/setup"
              className="btn-gold"
              style={{ padding: '0.95rem 1.8rem', fontSize: '1rem', boxShadow: '0 8px 25px rgba(212, 175, 55, 0.45)' }}
            >
              <span>Proceed to 4-Round Interview</span>
              <ArrowRight size={18} />
            </Link>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Tailored specifically to this extracted skill vector
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Charts & GitHub */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <SkillRadarChart skills={profile.skills} />
        <GitHubProfileCard githubData={state.githubData} profile={profile} />
      </div>

      {/* Grid: Projects & Languages */}
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        <ProjectCardList projects={profile.projects} />

        {/* Competencies & Languages Card */}
        <div className="royal-glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="font-royal" style={{ fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Code2 size={18} color="var(--gold-light)" />
              Languages & Core Technologies
            </h3>

            {/* Programming Languages */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.6rem', fontWeight: 500 }}>
                Primary Programming Languages:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(() => {
                  const SPOKEN = new Set(["tamil", "english", "hindi", "telugu", "malayalam", "kannada", "spanish", "french", "german", "mandarin"]);
                  let progLangs = (profile.languages || []).filter(l => !SPOKEN.has(String(l).trim().toLowerCase()));
                  if (progLangs.length === 0) {
                    progLangs = ["Java", "JavaScript", "Python", "SQL"];
                  }
                  return progLangs.map((lang, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        color: 'var(--gold-light)',
                        padding: '0.4rem 0.85rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}
                    >
                      {lang}
                    </span>
                  ));
                })()}
              </div>
            </div>

            {/* Spoken / Natural Languages if available */}
            {(() => {
              const SPOKEN = new Set(["tamil", "english", "hindi", "telugu", "malayalam", "kannada", "spanish", "french", "german", "mandarin"]);
              const rawSpoken = [
                ...(profile.spokenLanguages || []),
                ...(profile.languages || []).filter(l => SPOKEN.has(String(l).trim().toLowerCase()))
              ];
              const uniqueSpoken = [...new Set(rawSpoken)];

              if (uniqueSpoken.length === 0) return null;

              return (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Globe size={14} color="var(--gold-light)" />
                    Spoken / Natural Languages:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                    {uniqueSpoken.map((lang, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#e2e8f0',
                          padding: '0.3rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: 500
                        }}
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div style={{
              background: 'rgba(5, 7, 10, 0.6)',
              border: '1px dashed rgba(212, 175, 55, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="var(--accent-emerald)" /> Ready for Interview Simulation
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.5' }}>
                The AI will dynamically synthesize 10 domain questions, 3 practical coding/architecture scenarios, and 3 voice communication prompts matching these skills.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <Link
              to="/interview/setup"
              className="btn-gold"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>Launch Mock Interview Simulation</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
