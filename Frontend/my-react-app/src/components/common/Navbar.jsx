import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Key, History, FileText, ArrowRight, ShieldCheck, Archive, Trophy } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { state, dispatch } = useApp();
  const location = useLocation();

  const isInterview = location.pathname.startsWith('/interview');

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(7, 8, 12, 0.88)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.22)',
      padding: '0.85rem 2rem'
    }}>
      <div style={{
        maxWidth: '1560px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(212, 175, 55, 0.45)',
            border: '1px solid rgba(255, 235, 160, 0.4)'
          }}>
            <Sparkles size={22} color="#07080c" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="font-royal" style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#fff',
                letterSpacing: '0.06em'
              }}>
                EVAL<span style={{ color: 'var(--gold-primary)' }}>AI</span>
              </span>
              
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              Resume Intelligence & Interview Agent
            </p>
          </div>
        </Link>

        {/* Navigation Links & Action Controls */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link
            to="/"
            style={{
              color: location.pathname === '/' ? 'var(--gold-light)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s'
            }}
          >
            <FileText size={16} />
            <span>Analyzer</span>
          </Link>

          <Link
            to="/recruiter/upload"
            style={{
              color: location.pathname === '/recruiter/upload' ? 'var(--gold-light)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s'
            }}
          >
            <Archive size={16} />
            <span>Batch ZIP</span>
          </Link>

          <Link
            to="/leaderboard"
            style={{
              color: location.pathname === '/leaderboard' ? 'var(--gold-light)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s'
            }}
          >
            <Trophy size={16} color="var(--gold-light)" />
            <span style={{ color: 'var(--gold-light)', fontWeight: 600 }}>Leaderboard</span>
          </Link>

          <Link
            to="/history"
            style={{
              color: location.pathname === '/history' ? 'var(--gold-light)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s'
            }}
          >
            <History size={16} />
            <span>Archive</span>
          </Link>

          {/* AI Settings Trigger */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_API_MODAL', payload: true })}
            className="btn-dark"
            style={{
              padding: '0.55rem 1rem',
              fontSize: '0.85rem',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              background: 'rgba(212, 175, 55, 0.05)'
            }}
            title="Configure Gemini, Groq (Qwen), Claude or Smart Simulation"
          >
            <Key size={15} color="var(--gold-light)" />
            <span style={{ color: 'var(--gold-light)' }}>AI Settings</span>
          </button>

          {state.resumeProfile && !isInterview && (
            <Link
              to="/interview/setup"
              className="btn-gold"
              style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
            >
              <span>Live Interview</span>
              <ArrowRight size={15} />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
