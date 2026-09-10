import React from 'react';
import { Download, FileText, X, ShieldCheck, Eye, ExternalLink } from 'lucide-react';

export default function DownloadConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onView,
  title = "Document Actions",
  fileName = "Document.pdf",
  fileType = "Official Assessment Dossier (PDF)",
  details = []
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 7, 13, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 99999,
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
        animation: 'fadeInModal 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>
        {`
          @keyframes fadeInModal {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 25px rgba(212, 175, 55, 0.2); }
            50% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.45); }
          }
        `}
      </style>

      <div
        className="card-glass"
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: '1.75rem',
          borderRadius: 'var(--radius-lg, 16px)',
          background: 'linear-gradient(145deg, rgba(20, 24, 38, 0.96), rgba(10, 12, 20, 0.99))',
          border: '1px solid rgba(212, 175, 55, 0.45)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(212, 175, 55, 0.25)',
          position: 'relative',
          display: 'grid',
          gap: '1.25rem',
          boxSizing: 'border-box',
          overflow: 'hidden',
          animation: 'fadeInModal 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Close Corner Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary, #94a3b8)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
          title="Cancel and close"
        >
          <X size={16} />
        </button>

        {/* Centered Header with Glowing Badge */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.05) 70%)',
              border: '1px solid rgba(212, 175, 55, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-light, #ffd700)',
              animation: 'glowPulse 3s infinite'
            }}
          >
            <Download size={26} />
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
              {title}
            </h3>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary, #94a3b8)' }}>
              Choose whether to view the document online or download it to your device.
            </p>
          </div>
        </div>

        {/* Center Grid of Document Details - Strictly Constrained Inside Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '0.65rem',
            background: 'rgba(10, 13, 20, 0.85)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            borderRadius: 'var(--radius-md, 12px)',
            padding: '0.9rem 1.1rem',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', minWidth: 0, overflow: 'hidden' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(212, 175, 55, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-light, #ffd700)',
                flexShrink: 0
              }}
            >
              <FileText size={18} />
            </div>
            <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--gold-light, #ffd700)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {fileType}
              </div>
              <div
                style={{
                  fontSize: '0.84rem',
                  color: '#fff',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  display: 'block'
                }}
                title={fileName}
              >
                {fileName}
              </div>
            </div>
          </div>

          {details && details.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: details.length > 1 ? 'repeat(auto-fit, minmax(130px, 1fr))' : '1fr',
                gap: '0.6rem',
                paddingTop: '0.6rem',
                borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {details.map((item, idx) => (
                <div key={idx} style={{ fontSize: '0.78rem', minWidth: 0, overflow: 'hidden' }}>
                  <span style={{ color: 'var(--text-secondary, #94a3b8)', display: 'block', fontSize: '0.72rem' }}>{item.label}</span>
                  <span style={{ color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }} title={String(item.value)}>
                    {item.value || 'N/A'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'rgba(74, 222, 128, 0.9)', paddingTop: '0.2rem' }}>
            <ShieldCheck size={13} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Verified cryptographic export dossier</span>
          </div>
        </div>

        {/* 3 Action Buttons Grid: Cancel, View, Download */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1.25fr',
            gap: '0.65rem',
            width: '100%',
            boxSizing: 'border-box',
            marginTop: '0.25rem'
          }}
        >
          {/* 1. Cancel */}
          <button
            type="button"
            onClick={onClose}
            className="btn-dark"
            style={{
              padding: '0.7rem 0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-md, 10px)',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          {/* 2. View */}
          <button
            type="button"
            onClick={() => {
              if (onView) {
                onView();
              } else if (onConfirm) {
                onConfirm();
              }
              onClose();
            }}
            className="btn-gold-outline"
            style={{
              padding: '0.7rem 0.5rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              borderRadius: 'var(--radius-md, 10px)',
              cursor: 'pointer'
            }}
          >
            <Eye size={15} />
            <span>View</span>
          </button>

          {/* 3. Confirm Download */}
          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
            className="btn-gold"
            style={{
              padding: '0.7rem 0.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              borderRadius: 'var(--radius-md, 10px)',
              cursor: 'pointer'
            }}
          >
            <Download size={15} />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
