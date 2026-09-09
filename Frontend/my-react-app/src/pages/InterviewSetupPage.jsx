import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Cpu, Code2, ArrowRight, ShieldCheck, CheckCircle, Sparkles, Mic, Layers, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROLE_PRESETS, DOMAIN_OPTIONS, detectDomainFromRole } from '../data/rolePresets';

export default function InterviewSetupPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [domain, setDomain] = useState(state.jobRole?.domain || "Software");
  const availableRoles = ROLE_PRESETS.filter(r => r.domain === domain);
  const [selectedRoleId, setSelectedRoleId] = useState(
    availableRoles.find(r => r.id === state.jobRole?.id)?.id || availableRoles[0]?.id || "fullstack-eng"
  );
  
  const currentRole = ROLE_PRESETS.find(r => r.id === selectedRoleId) || availableRoles[0] || ROLE_PRESETS[0];

  const handleDomainChange = (newDomain) => {
    setDomain(newDomain);
    const rolesForNewDomain = ROLE_PRESETS.filter(r => r.domain === newDomain);
    if (rolesForNewDomain.length > 0) {
      setSelectedRoleId(rolesForNewDomain[0].id);
    }
  };

  const handleRoleChange = (roleId) => {
    setSelectedRoleId(roleId);
    const role = ROLE_PRESETS.find(r => r.id === roleId);
    if (role && role.domain !== domain) {
      setDomain(role.domain);
    }
  };

  const handleStartInterview = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen().catch(() => {});
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen().catch(() => {});
        }
      }
    } catch (e) {}

    dispatch({
      type: 'SET_JOB_ROLE',
      payload: {
        id: currentRole.id,
        title: currentRole.title,
        domain: currentRole.domain,
        coreSkills: currentRole.coreSkills
      }
    });
    navigate('/interview/round1');
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', paddingTop: '1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge-gold" style={{ marginBottom: '1rem' }}>
          <Sparkles size={14} /> STEP 4 • INTERVIEW INITIALIZATION
        </span>
        <h1 className="font-royal" style={{ fontSize: '2.2rem', color: '#fff', fontWeight: 800, marginTop: '0.5rem' }}>
          Configure Your <span className="gold-text-gradient">AI Mock Interview</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '640px', margin: '0.5rem auto 0' }}>
          Select your target role and track. The AI will synthesize a 4-round adaptive evaluation dynamically matching your resume profile.
        </p>
      </div>

      {/* Role & Domain Selection Card */}
      <div className="royal-glass-card solid-border" style={{ padding: '2.2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {/* Domain Track */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--gold-light)', fontWeight: 600, marginBottom: '0.65rem' }}>
              Engineering Discipline / Domain
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {DOMAIN_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleDomainChange(opt.id)}
                  style={{
                    flex: 1,
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: domain === opt.id ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    border: domain === opt.id ? '1px solid var(--gold-light)' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: domain === opt.id ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {opt.id === "Software" ? <Code2 size={16} /> : <Cpu size={16} />}
                  <span>{opt.id} Track</span>
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Auto-calibrates technical question generation to {domain} industry standards.
            </p>
          </div>

          {/* Role Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--gold-light)', fontWeight: 600, marginBottom: '0.65rem' }}>
              Target Job Role Preset ({domain} Domain)
            </label>
            <select
              value={selectedRoleId}
              onChange={(e) => handleRoleChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(5, 7, 10, 0.85)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {availableRoles.map(r => (
                <option key={r.id} value={r.id} style={{ background: '#0e111a', color: '#fff' }}>
                  {r.title} ({r.domain})
                </option>
              ))}
            </select>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {currentRole.description}
            </p>
          </div>
        </div>

        {/* Expected Core Skills preview */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
            Key Evaluation Focus Areas for {currentRole.title}:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {currentRole.coreSkills.map((skill, i) => (
              <span key={i} className="badge-gold" style={{ fontSize: '0.78rem' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Round Roadmap */}
      <h3 className="font-royal" style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Layers size={20} color="var(--gold-light)" />
        Simulated 4-Round Evaluation Pipeline
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          {
            round: "Round 1",
            title: "Aptitude & Logical",
            desc: "5 static questions testing quantitative speed, logical deduction, and verbal reasoning.",
            duration: "~5 mins",
            type: "Deterministic Scoring"
          },
          {
            round: "Round 2",
            title: "Domain MCQs",
            desc: "10 AI-generated multiple-choice questions testing core skills from your resume & role.",
            duration: "~8 mins",
            type: "AI Synthesized"
          },
          {
            round: "Round 3",
            title: "Adaptive Practical",
            desc: "3-4 open-ended scenario questions. Difficulty branches dynamically based on Round 2.",
            duration: "~10 mins",
            type: "Adaptive Branching"
          },
          {
            round: "Round 4",
            title: "Voice & Communication",
            desc: "3 voice-spoken questions with live Web Speech API transcription and clarity scoring.",
            duration: "~6 mins",
            type: "Speech Recognition"
          }
        ].map((item, idx) => (
          <div key={idx} className="royal-glass-card" style={{ padding: '1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span className="badge-gold" style={{ fontSize: '0.72rem' }}>{item.round}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Clock size={11} /> {item.duration}
              </span>
            </div>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              {item.title}
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '0.75rem' }}>
              {item.desc}
            </p>
            <div style={{ fontSize: '0.7rem', color: 'var(--gold-light)', fontWeight: 600 }}>
              {item.type}
            </div>
          </div>
        ))}
      </div>

      {/* Start Button */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <button
          type="button"
          onClick={handleStartInterview}
          className="btn-gold"
          style={{ padding: '1rem 3rem', fontSize: '1.1rem', boxShadow: '0 10px 30px rgba(212, 175, 55, 0.45)' }}
        >
          <span>Begin Round 1: Aptitude & Reasoning</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
