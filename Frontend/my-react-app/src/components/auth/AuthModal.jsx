import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Lock, User, ShieldCheck, ArrowRight, CheckCircle2, 
  AlertCircle, KeyRound, RefreshCw, Eye, EyeOff, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    authModalTab, 
    setAuthModalTab, 
    closeAuthModal, 
    login, 
    sendOtp, 
    verifyOtp, 
    register 
  } = useAuth();

  const [tab, setTab] = useState(authModalTab || 'login');
  const [signupStep, setSignupStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    setTab(authModalTab);
    setError('');
    setSuccessMsg('');
  }, [authModalTab, isAuthModalOpen]);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isAuthModalOpen) return null;

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&#^_-]/.test(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecial && passwordsMatch;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtpStep = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOtp(name.trim(), email.trim());
      setSuccessMsg(res.message || 'OTP sent successfully to your email!');
      setSignupStep(2);
      setResendTimer(60);
    } catch (err) {
      setError(err.message || 'Failed to send OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpStep = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email.trim(), otp.trim());
      setSuccessMsg('OTP verified successfully! Now set your secure password.');
      setSignupStep(3);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    setLoading(true);
    try {
      await sendOtp(name.trim(), email.trim());
      setSuccessMsg('A new OTP has been dispatched to your email.');
      setResendTimer(60);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isPasswordValid) {
      setError('Please satisfy all password criteria before completing registration.');
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), otp.trim(), password);
      setSignupStep(4);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOtp('');
    setError('');
    setSuccessMsg('');
    setSignupStep(1);
    setResendTimer(0);
  };

  const switchToLogin = () => {
    resetAll();
    setTab('login');
    setAuthModalTab('login');
  };

  const switchToSignup = () => {
    resetAll();
    setTab('signup');
    setAuthModalTab('signup');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 6, 10, 0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #13151f 0%, #0d0e15 100%)',
        border: '1px solid rgba(212, 175, 55, 0.35)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(212, 175, 55, 0.15)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '480px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header Ribbon */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%)',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #d4af37, #aa820a)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} color="#07080c" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>
                {tab === 'login' ? 'Sign In to EvalAI' : 'Create EvalAI Account'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {tab === 'login' ? 'Access your resume analyses & insights' : 'Verified OTP Registration with Role Access'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.25)'
        }}>
          <button
            onClick={switchToLogin}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: tab === 'login' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: tab === 'login' ? '2px solid var(--gold-primary)' : '2px solid transparent',
              color: tab === 'login' ? 'var(--gold-light)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            onClick={switchToSignup}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: tab === 'signup' ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: tab === 'signup' ? '2px solid var(--gold-primary)' : '2px solid transparent',
              color: tab === 'signup' ? 'var(--gold-light)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: '#f87171',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && !error && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: '#34d399',
              fontSize: '0.85rem'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LOGIN TAB */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--gold-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@gmail.com or admin@gmail.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--gold-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.6rem 0.75rem 2.5rem',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '11px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderRadius: '10px'
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div style={{
                marginTop: '1.25rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'center',
                fontSize: '0.82rem',
                color: 'var(--text-muted)'
              }}>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={switchToSignup}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--gold-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* SIGNUP TAB */}
          {tab === 'signup' && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                padding: '0 0.5rem'
              }}>
                {[
                  { step: 1, label: 'Details' },
                  { step: 2, label: 'OTP' },
                  { step: 3, label: 'Password' }
                ].map((s) => (
                  <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: signupStep >= s.step ? 'var(--gold-primary)' : 'rgba(255, 255, 255, 0.1)',
                      color: signupStep >= s.step ? '#07080c' : 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {signupStep > s.step ? '✓' : s.step}
                    </div>
                    <span style={{
                      fontSize: '0.78rem',
                      color: signupStep >= s.step ? 'var(--gold-light)' : 'var(--text-muted)',
                      fontWeight: signupStep === s.step ? 600 : 400
                    }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Step 1: Details */}
              {signupStep === 1 && (
                <form onSubmit={handleSendOtpStep}>
                  <div style={{ marginBottom: '1.1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} color="var(--gold-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.5rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(212, 175, 55, 0.25)',
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.4rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Email Address (Verification OTP will be sent)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="var(--gold-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. john@example.com"
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem 0.75rem 2.5rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(212, 175, 55, 0.25)',
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      * Duplicate emails are not permitted.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gold"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      borderRadius: '10px'
                    }}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification OTP</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: OTP */}
              {signupStep === 2 && (
                <form onSubmit={handleVerifyOtpStep}>
                  <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(212, 175, 55, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.75rem'
                    }}>
                      <KeyRound size={22} color="var(--gold-primary)" />
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Enter the 6-digit code dispatched to:
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--gold-light)', fontWeight: 600, margin: '0.2rem 0 0' }}>
                      {email}
                    </p>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      style={{
                        width: '100%',
                        padding: '0.85rem',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '2px solid rgba(212, 175, 55, 0.4)',
                        borderRadius: '12px',
                        color: 'var(--gold-primary)',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        letterSpacing: '0.5rem',
                        textAlign: 'center',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                    fontSize: '0.8rem'
                  }}>
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      ← Change Email
                    </button>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleResendOtp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--gold-primary)',
                        cursor: resendTimer > 0 ? 'default' : 'pointer',
                        fontWeight: 600,
                        padding: 0
                      }}
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="btn-gold"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      borderRadius: '10px',
                      opacity: otp.length !== 6 ? 0.6 : 1
                    }}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Continue</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 3: Password Configuration */}
              {signupStep === 3 && (
                <form onSubmit={handleRegisterSubmit}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Choose Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="var(--gold-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create strong password"
                        style={{
                          width: '100%',
                          padding: '0.75rem 2.6rem 0.75rem 2.5rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(212, 175, 55, 0.25)',
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '11px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="var(--gold-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        style={{
                          width: '100%',
                          padding: '0.75rem 2.6rem 0.75rem 2.5rem',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(212, 175, 55, 0.25)',
                          borderRadius: '10px',
                          color: '#fff',
                          fontSize: '0.9rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Rules Checklist */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px',
                    padding: '0.75rem 0.9rem',
                    marginBottom: '1.4rem'
                  }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gold-light)' }}>
                      Security Requirements:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.73rem', color: hasMinLength ? '#34d399' : 'var(--text-muted)' }}>
                        <span>{hasMinLength ? '✓' : '○'}</span>
                        <span>8+ Characters</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.73rem', color: hasUppercase ? '#34d399' : 'var(--text-muted)' }}>
                        <span>{hasUppercase ? '✓' : '○'}</span>
                        <span>Capital Letter</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.73rem', color: hasNumber ? '#34d399' : 'var(--text-muted)' }}>
                        <span>{hasNumber ? '✓' : '○'}</span>
                        <span>Number (0-9)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.73rem', color: hasSpecial ? '#34d399' : 'var(--text-muted)' }}>
                        <span>{hasSpecial ? '✓' : '○'}</span>
                        <span>Special Symbol</span>
                      </div>
                    </div>
                    {confirmPassword && (
                      <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.73rem', color: passwordsMatch ? '#34d399' : '#f87171' }}>
                        {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isPasswordValid}
                    className="btn-gold"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      borderRadius: '10px',
                      opacity: !isPasswordValid ? 0.6 : 1
                    }}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Registering Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Complete Registration</span>
                        <CheckCircle2 size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 4: Success */}
              {signupStep === 4 && (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '2px solid #10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem'
                  }}>
                    <CheckCircle2 size={32} color="#10b981" />
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 0.5rem' }}>
                    Registration Successful!
                  </h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.4', margin: '0 0 1.5rem' }}>
                    Your account has been created and verified. You can now sign in using your credentials.
                  </p>
                  <button
                    type="button"
                    onClick={switchToLogin}
                    className="btn-gold"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      borderRadius: '10px'
                    }}
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
