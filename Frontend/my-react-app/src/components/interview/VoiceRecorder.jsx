import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, Edit3, CheckCircle } from 'lucide-react';
import { speechService } from '../../services/speechService';

export default function VoiceRecorder({ onTranscriptUpdate, initialTranscript = "", disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [isInterim, setIsInterim] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isManualEdit, setIsManualEdit] = useState(!speechService.isSupported);

  useEffect(() => {
    setTranscript(initialTranscript);
  }, [initialTranscript]);

  const toggleRecording = () => {
    if (disabled) return;

    if (isRecording) {
      speechService.stop();
      setIsRecording(false);
    } else {
      setErrorMsg("");
      speechService.start(
        (text, interim) => {
          setTranscript(text);
          setIsInterim(interim);
          if (onTranscriptUpdate) onTranscriptUpdate(text);
        },
        (err) => {
          console.warn("Speech recognition error:", err);
          if (err === 'not-allowed') {
            setErrorMsg("Microphone access blocked. Please enable mic permissions or type your answer below.");
          } else {
            setErrorMsg("Voice input interrupted. You can continue speaking or edit manually.");
          }
          setIsRecording(false);
        },
        (listening) => {
          setIsRecording(listening);
        }
      );
    }
  };

  const handleManualTextChange = (e) => {
    const val = e.target.value;
    setTranscript(val);
    if (onTranscriptUpdate) onTranscriptUpdate(val);
  };

  return (
    <div style={{
      background: 'rgba(9, 12, 18, 0.85)',
      border: isRecording ? '1px solid var(--gold-light)' : '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      boxShadow: isRecording ? '0 0 25px rgba(212, 175, 55, 0.25)' : 'var(--shadow-md)',
      transition: 'all 0.3s'
    }}>
      {/* Voice Controls Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            onClick={toggleRecording}
            disabled={disabled}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: 'none',
              background: isRecording ? 'var(--grad-gold)' : 'rgba(255, 255, 255, 0.08)',
              color: isRecording ? '#07080c' : 'var(--gold-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              boxShadow: isRecording ? '0 0 22px rgba(212, 175, 55, 0.6)' : '0 4px 12px rgba(0,0,0,0.5)',
              transition: 'all 0.2s',
              transform: isRecording ? 'scale(1.06)' : 'scale(1)'
            }}
          >
            {isRecording ? <Mic size={26} strokeWidth={2.5} /> : <MicOff size={24} />}
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>
                {isRecording ? "Live Voice Recording Active..." : "Click Mic to Speak Answer"}
              </span>
              {isRecording && (
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--accent-crimson)',
                  boxShadow: '0 0 8px var(--accent-crimson)',
                  display: 'inline-block'
                }} />
              )}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {isRecording ? "Transcribing speech in real time with Web Speech API" : "Clear speech ensures maximum clarity and structure points"}
            </p>
          </div>
        </div>

        {/* Audio Wave Visualizer or Mode Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isRecording && (
            <div className="audio-visualizer-wave">
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
              <span className="wave-bar" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsManualEdit(!isManualEdit)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.45rem 0.85rem',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Edit3 size={13} />
            {isManualEdit ? "Focus Voice Mode" : "Type/Edit Response"}
          </button>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMsg && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          color: '#fb7185',
          fontSize: '0.82rem'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Transcript Textarea or Live Preview */}
      <div>
        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
          <span>Your Spoken Transcript:</span>
          <span>{transcript.split(/\s+/).filter(Boolean).length} words</span>
        </label>
        <textarea
          rows={5}
          value={transcript}
          onChange={handleManualTextChange}
          placeholder="Your speech transcript will appear here live as you speak... You can also type or refine your answer directly."
          style={{
            width: '100%',
            padding: '0.9rem 1rem',
            background: 'rgba(4, 5, 8, 0.85)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: 'var(--radius-md)',
            color: '#f8fafc',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit'
          }}
        />
      </div>
    </div>
  );
}
