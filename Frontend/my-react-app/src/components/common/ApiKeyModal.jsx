import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Sparkles, CheckCircle2, Zap, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';

export default function ApiKeyModal() {
  const { state, dispatch } = useApp();
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const config = storageService.getApiConfig();
    if (config) {
      setProvider(config.provider || 'gemini');
      setApiKey(config.apiKey || '');
      setModel(config.model || (config.provider === 'openai' ? 'gpt-4o-mini' : (config.provider === 'claude' ? 'claude-3-5-sonnet-20241022' : 'gemini-1.5-flash')));
    }
  }, [state.apiConfigModalOpen]);

  if (!state.apiConfigModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    storageService.saveApiConfig({
      provider,
      apiKey: apiKey.trim(),
      model
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      dispatch({ type: 'TOGGLE_API_MODAL', payload: false });
    }, 900);
  };

  const handleProviderChange = (p) => {
    setProvider(p);
    if (p === 'gemini') setModel('gemini-1.5-flash');
    if (p === 'openai') setModel('gpt-4o-mini');
    if (p === 'claude') setModel('claude-3-5-sonnet-20241022');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(3, 4, 7, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="royal-glass-card solid-border" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(212, 175, 55, 0.35)',
        background: '#0e111a'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Key size={20} color="var(--gold-light)" />
            </div>
            <div>
              <h3 className="font-royal" style={{ fontSize: '1.25rem', color: '#fff' }}>
                AI Engine Settings
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Configure live LLM API access or high-fidelity simulation
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_API_MODAL', payload: false })}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
            Select AI Provider
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
            {[
              { id: 'gemini', label: 'Google Gemini', tag: 'Recommended' },
              { id: 'openai', label: 'OpenAI GPT-4o', tag: 'Fast' },
              { id: 'claude', label: 'Anthropic Claude', tag: 'Deep' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleProviderChange(item.id)}
                style={{
                  padding: '0.75rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: provider === item.id ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255,255,255,0.03)',
                  border: provider === item.id ? '1px solid var(--gold-light)' : '1px solid rgba(255,255,255,0.08)',
                  color: provider === item.id ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--gold-light)', marginTop: '0.2rem' }}>{item.tag}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              API Key ({provider.toUpperCase()})
            </label>
            <input
              type="password"
              placeholder={apiKey ? "••••••••••••••••••••••••" : `Enter your ${provider} API key (leave empty for smart demo mode)`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(5, 7, 10, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                fontFamily: 'monospace'
              }}
            />
          </div>

          {/* Smart Demo Guarantee Banner */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px dashed rgba(212, 175, 55, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <Sparkles size={18} color="var(--gold-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              <strong style={{ color: 'var(--gold-light)' }}>Zero Setup Friction:</strong> If no API key is entered, the app automatically runs an intelligent, realistic simulation engine tailored to the parsed resume.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => dispatch({ type: 'TOGGLE_API_MODAL', payload: false })}
              className="btn-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
