import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Sparkles, CheckCircle2, Zap, AlertCircle, Cpu, Eye } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { storageService } from '../../services/storageService';

export default function ApiKeyModal() {
  const { state, dispatch } = useApp();
  const [provider, setProvider] = useState('groq');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('Qwen/Qwen2.5-VL-32B-Instruct');
  const [customModel, setCustomModel] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const config = storageService.getApiConfig();
    if (config) {
      const p = config.provider || 'groq';
      setProvider(p);
      setApiKey(config.apiKey || '');
      const m = config.model || 'Qwen/Qwen2.5-VL-32B-Instruct';
      setModel(m);
      setCustomModel(m);
    }
  }, [state.apiConfigModalOpen]);

  if (!state.apiConfigModalOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const activeModel = customModel.trim() || model;
    storageService.saveApiConfig({
      provider,
      apiKey: apiKey.trim(),
      model: activeModel
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      dispatch({ type: 'TOGGLE_API_MODAL', payload: false });
    }, 900);
  };

  const handleProviderChange = (p) => {
    setProvider(p);
    if (p === 'groq') {
      setModel('Qwen/Qwen2.5-VL-32B-Instruct');
      setCustomModel('Qwen/Qwen2.5-VL-32B-Instruct');
    } else if (p === 'openrouter') {
      setModel('qwen/qwen-2.5-vl-72b-instruct:free');
      setCustomModel('qwen/qwen-2.5-vl-72b-instruct:free');
    } else if (p === 'gemini') {
      setModel('gemini-1.5-flash');
      setCustomModel('gemini-1.5-flash');
    } else if (p === 'claude') {
      setModel('claude-3-5-sonnet-20241022');
      setCustomModel('claude-3-5-sonnet-20241022');
    } else if (p === 'openai') {
      setModel('gpt-4o-mini');
      setCustomModel('gpt-4o-mini');
    }
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
        maxWidth: '590px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 35px rgba(212, 175, 55, 0.35)',
        background: '#0e111a'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
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
                Powered by Qwen 2.5 Vision & Multimodal LLMs
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
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
            Select AI Provider
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {[
              { id: 'groq', label: 'Groq (Qwen / Llama)', tag: 'Ultra Fast' },
              { id: 'openrouter', label: 'OpenRouter', tag: 'Qwen-VL' },
              { id: 'gemini', label: 'Gemini', tag: 'Multimodal' },
              { id: 'openai', label: 'OpenAI / Other', tag: 'GPT-4o' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleProviderChange(item.id)}
                style={{
                  padding: '0.7rem 0.4rem',
                  borderRadius: 'var(--radius-md)',
                  background: provider === item.id ? 'rgba(212, 175, 55, 0.18)' : 'rgba(255,255,255,0.03)',
                  border: provider === item.id ? '1px solid var(--gold-light)' : '1px solid rgba(255,255,255,0.08)',
                  color: provider === item.id ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--gold-light)', marginTop: '0.2rem' }}>{item.tag}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Preset Model Selection */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 500 }}>
            Model Selection / Recommended Presets
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {[
              { id: 'Qwen/Qwen2.5-VL-32B-Instruct', name: 'Qwen 2.5 VL 32B', desc: 'Vision + Text' },
              { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', desc: 'Groq Active' },
              { id: 'llama-3.2-11b-vision-preview', name: 'Llama 3.2 Vision', desc: 'Image OCR' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setModel(m.id); setCustomModel(m.id); }}
                style={{
                  padding: '0.6rem 0.4rem',
                  borderRadius: '8px',
                  background: (customModel === m.id || model === m.id) ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.04)',
                  border: (customModel === m.id || model === m.id) ? '1px solid var(--gold-light)' : '1px solid rgba(255,255,255,0.1)',
                  color: (customModel === m.id || model === m.id) ? '#ffd700' : 'var(--text-muted)',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Target Model ID (Editable)
            </label>
            <input
              type="text"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              placeholder="e.g. Qwen/Qwen2.5-VL-32B-Instruct or llama-3.3-70b-versatile"
              style={{
                width: '100%',
                padding: '0.65rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(5, 7, 10, 0.8)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                color: '#ffd700',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              API Key ({provider.toUpperCase()})
            </label>
            <input
              type="password"
              placeholder={apiKey ? "••••••••••••••••••••••••" : (provider === 'groq' ? "Enter your Groq API key (gsk_...)" : provider === 'openrouter' ? "Enter OpenRouter key (sk-or-...)" : `Enter your ${provider} API key`)}
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

          {/* Info Banner */}
          <div style={{
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.85rem',
            marginBottom: '1.25rem',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Eye size={14} color="var(--gold-light)" />
            <span>Multimodal Vision Active: Supports PDF, PNG, JPG, and DOCX resumes with auto-failover to active Groq/Qwen models.</span>
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
