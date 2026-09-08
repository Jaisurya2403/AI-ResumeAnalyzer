import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Key, 
  History, 
  FileText, 
  ArrowRight, 
  Archive, 
  LogIn, 
  LogOut, 
  User, 
  ChevronDown, 
  ShieldCheck, 
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { state, dispatch } = useApp();
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isInterview = location.pathname.startsWith('/interview');

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on navigation
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header style={{
      position: 'fixed',
      top: '0.85rem',
      left: 0,
      right: 0,
      zIndex: 1000,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '0 1.25rem',
      pointerEvents: 'none'
    }}>
      <div style={{
        pointerEvents: 'auto',
        maxWidth: '1320px',
        width: '100%',
        background: 'rgba(9, 12, 18, 0.86)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        borderRadius: 'var(--radius-full)',
        boxShadow: '0 12px 35px rgba(0, 0, 0, 0.75), 0 0 25px rgba(212, 175, 55, 0.16)',
        padding: '0.55rem 1.6rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(212, 175, 55, 0.5)',
            border: '1px solid rgba(255, 235, 160, 0.5)'
          }}>
            <Sparkles size={20} color="#07080c" />
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
          </div>
        </Link>

        {/* Navigation Links & Controls */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <Link
            to="/"
            style={{
              color: location.pathname === '/' ? 'var(--gold-light)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: location.pathname === '/' ? 600 : 500,
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              background: location.pathname === '/' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
              border: location.pathname === '/' ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease'
            }}
          >
            <FileText size={16} />
            <span>Analyzer</span>
          </Link>

          {/* Batch ZIP link for Admin */}
          {isAdmin && (
            <Link
              to="/recruiter/upload"
              style={{
                color: location.pathname === '/recruiter/upload' ? 'var(--gold-light)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: location.pathname === '/recruiter/upload' ? 600 : 500,
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                background: location.pathname === '/recruiter/upload' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                border: location.pathname === '/recruiter/upload' ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Archive size={16} />
              <span>Batch ZIP</span>
            </Link>
          )}

          <Link
            to="/history"
            style={{
              color: location.pathname === '/history' ? 'var(--gold-light)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: location.pathname === '/history' ? 600 : 500,
              padding: '0.45rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              background: location.pathname === '/history' ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
              border: location.pathname === '/history' ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.2s ease'
            }}
          >
            <History size={16} />
            <span>Archive</span>
          </Link>

          {/* AI Settings Button */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_API_MODAL', payload: true })}
            className="btn-dark"
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              background: 'rgba(212, 175, 55, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              cursor: 'pointer'
            }}
            title="Configure AI Models (Groq, Gemini, Claude)"
          >
            <Key size={14} color="var(--gold-light)" />
            <span style={{ color: 'var(--gold-light)' }}>AI Settings</span>
          </button>

          {/* Live Interview Action Pill */}
          {state.resumeProfile && !isInterview && (
            <Link
              to="/interview/setup"
              className="btn-gold"
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Live Interview</span>
              <ArrowRight size={15} />
            </Link>
          )}

          {/* User Profile / Auth Section */}
          {isAuthenticated ? (
            <div ref={dropdownRef} style={{ position: 'relative', marginLeft: '0.5rem' }}>
              {/* Avatar Trigger Button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  background: dropdownOpen ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  border: dropdownOpen ? '1px solid var(--gold-light)' : '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.3rem 0.6rem 0.3rem 0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: dropdownOpen ? '0 0 16px rgba(212, 175, 55, 0.3)' : 'none'
                }}
              >
                {/* Round Avatar with Initial */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isAdmin 
                    ? 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)' 
                    : 'linear-gradient(135deg, #d4af37 0%, #5e4604 100%)',
                  color: isAdmin ? '#07080c' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  border: '1.5px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 0 10px rgba(212, 175, 55, 0.35)'
                }}>
                  {isAdmin ? '👑' : getInitials(user?.name)}
                </div>

                {/* Name */}
                <span style={{
                  color: '#fff',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  maxWidth: '120px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user?.name || 'Account'}
                </span>

                <ChevronDown 
                  size={14} 
                  color="var(--gold-light)" 
                  style={{
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>

              {/* Floating Royal Glass Dropdown */}
              {dropdownOpen && (
                <div 
                  className="royal-glass-card solid-border"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    width: '270px',
                    background: 'rgba(11, 14, 22, 0.96)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 25px rgba(212, 175, 55, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    zIndex: 1001,
                    animation: 'fadeIn 0.15s ease-out'
                  }}
                >
                  {/* User Profile Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: isAdmin 
                        ? 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)' 
                        : 'linear-gradient(135deg, #d4af37 0%, #5e4604 100%)',
                      color: isAdmin ? '#07080c' : '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      border: '2px solid var(--gold-light)',
                      boxShadow: '0 0 14px rgba(212, 175, 55, 0.4)'
                    }}>
                      {isAdmin ? '👑' : getInitials(user?.name)}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.name || 'User'}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      background: isAdmin ? 'rgba(212, 175, 55, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: isAdmin ? 'var(--gold-light)' : 'var(--accent-emerald)',
                      border: isAdmin ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)'
                    }}>
                      {isAdmin ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
                      <span>{isAdmin ? 'ADMINISTRATOR' : 'VERIFIED CANDIDATE'}</span>
                    </span>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(212, 175, 55, 0.15)', margin: '0.75rem 0' }} />

                  {/* Dropdown Menu Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <Link
                      to="/history"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <History size={16} color="var(--gold-light)" />
                      <span>{isAdmin ? 'Recruitment Archive' : 'My Candidate Archive'}</span>
                    </Link>

                    <Link
                      to="/"
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <FileText size={16} color="var(--gold-light)" />
                      <span>Resume Analyzer</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/recruiter/upload"
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.6rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        <Archive size={16} color="var(--gold-light)" />
                        <span>Batch Candidate ZIP</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        dispatch({ type: 'TOGGLE_API_MODAL', payload: true });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '0.85rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(212, 175, 55, 0.12)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      <Key size={16} color="var(--gold-light)" />
                      <span>AI Model Settings</span>
                    </button>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(212, 175, 55, 0.15)', margin: '0.75rem 0' }} />

                  {/* Sign Out Action */}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#f87171',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                      e.currentTarget.style.borderColor = '#ef4444';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="btn-gold"
              style={{
                padding: '0.45rem 1.15rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginLeft: '0.5rem'
              }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
