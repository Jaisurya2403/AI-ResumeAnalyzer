import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Archive, Mail, CheckCircle2, AlertCircle, ArrowRight, Trophy, Sparkles, RefreshCw, FileText, Building2, Briefcase, Calendar, Clock } from 'lucide-react';

export default function RecruiterUploadPage() {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [expiryDate, setExpiryDate] = useState(() => {
    // Default to 3 days from now, format yyyy-MM-ddTHH:mm
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(23, 59, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!companyName.trim()) {
      setErrorMsg("Please enter the Company Name before uploading candidate resumes.");
      return;
    }

    if (!targetRole.trim()) {
      setErrorMsg("Please enter the Target Job Role before uploading candidate resumes.");
      return;
    }

    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErrorMsg("Please upload a valid .ZIP archive containing candidate PDF resumes.");
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);
    setProgressStage('Uploading and extracting ZIP archive for ' + companyName + '...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('companyName', companyName.trim());
    formData.append('targetRole', targetRole.trim());
    if (expiryDate) {
      formData.append('expiryDate', expiryDate);
    }

    try {
      const res = await fetch('http://localhost:8085/api/resumes/upload-zip', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error("Failed to process ZIP file on backend. Ensure Spring Boot backend is active.");
      }

      const data = await res.json();
      setResults(data);
      setProgressStage('All candidate resumes parsed & assessment invitation emails dispatched!');
    } catch (err) {
      console.error("Backend error processing ZIP archive:", err);
      setErrorMessage(err.message || "Failed to process candidate ZIP archive. Please ensure backend is running.");
      setProgressStage('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ width: '100%', padding: '0 0.5rem', paddingTop: '1rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(212, 175, 55, 0.12)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          marginBottom: '1.25rem'
        }}>
          <Archive size={16} color="var(--gold-light)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--gold-light)', fontWeight: 600, letterSpacing: '0.05em' }}>
            BATCH RECRUITMENT AUTOMATION
          </span>
        </div>

        <h1 className="font-royal" style={{ fontSize: '2.4rem', color: '#fff', fontWeight: 800, marginBottom: '0.75rem' }}>
          Upload Candidate <span className="gold-text-gradient">ZIP Archive</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
          Upload a ZIP containing multiple candidate PDF resumes. Specify hiring company, target role, and assessment expiration date to organize candidate leaderboards into the archive.
        </p>
      </div>

      {/* Cohort Details Input Form */}
      <div className="royal-glass-card solid-border" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 className="font-royal" style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={20} color="var(--gold-light)" />
          <span>Hiring Campaign Configuration</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {/* Company Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--gold-light)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Company Name <span style={{ color: 'var(--accent-crimson)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Building2 size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="e.g. Google, Microsoft, Zoho, Tesla"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.75rem',
                  background: 'rgba(5, 7, 10, 0.7)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--gold-light)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
              />
            </div>
          </div>

          {/* Job Role */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--gold-light)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Target Job Role <span style={{ color: 'var(--accent-crimson)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="e.g. Fullstack Developer, Software Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.75rem',
                  background: 'rgba(5, 7, 10, 0.7)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--gold-light)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
              />
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--gold-light)', fontWeight: 600, marginBottom: '0.5rem' }}>
              Assessment Link Expiry Date & Time <span style={{ color: 'var(--accent-crimson)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.75rem',
                  background: 'rgba(5, 7, 10, 0.7)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  colorScheme: 'dark'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--gold-light)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(212, 175, 55, 0.3)'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]); }}
        onClick={() => fileInputRef.current?.click()}
        className="royal-glass-card solid-border"
        style={{
          padding: '3.5rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragging ? 'rgba(212, 175, 55, 0.12)' : 'rgba(14, 18, 28, 0.75)',
          borderColor: isDragging ? 'var(--gold-light)' : 'rgba(212, 175, 55, 0.35)',
          boxShadow: isDragging ? '0 0 35px rgba(212, 175, 55, 0.4)' : 'var(--shadow-lg)',
          marginBottom: '2.5rem',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".zip,application/zip,application/x-zip-compressed"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />

        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          background: 'var(--grad-gold-subtle)',
          border: '2px dashed var(--gold-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 0 20px rgba(212, 175, 55, 0.25)'
        }}>
          <Archive size={32} color="var(--gold-light)" />
        </div>

        <h3 className="font-royal" style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
          {isProcessing ? "Processing ZIP Archive..." : "Drop Candidate ZIP Archive (.zip) here"}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Analyzes any resume format (PDF, Word docx/doc, Images, Text, etc.) • Auto AI ATS Scoring • JavaMailSender Email Dispatch
        </p>

        <button
          type="button"
          className="btn-gold"
          disabled={isProcessing}
          style={{ padding: '0.85rem 2rem', pointerEvents: 'none' }}
        >
          <Upload size={18} />
          <span>{isProcessing ? "Processing..." : "Select .ZIP File"}</span>
        </button>

        {progressStage && (
          <div style={{ marginTop: '1.25rem', color: 'var(--gold-light)', fontSize: '0.85rem', fontWeight: 500 }}>
            {progressStage}
          </div>
        )}

        {errorMsg && (
          <div style={{
            marginTop: '1.5rem',
            color: 'var(--accent-crimson)',
            background: 'rgba(244, 63, 94, 0.1)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            display: 'inline-block',
            fontSize: '0.85rem',
            border: '1px solid rgba(244, 63, 94, 0.3)'
          }}>
            {errorMsg}
          </div>
        )}
      </div>

      {/* Batch Results Table */}
      {results && results.candidates && results.candidates.length > 0 && (
        <div className="royal-glass-card solid-border" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={22} color="var(--accent-emerald)" />
              <div>
                <h3 className="font-royal" style={{ fontSize: '1.25rem', color: '#fff' }}>
                  Successfully Processed {results.processedCount} Candidates
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Invitations sent from alonewarrior123456@gmail.com with unique assessment tokens
                </p>
              </div>
            </div>

            <Link to="/leaderboard" className="btn-gold" style={{ fontSize: '0.85rem', padding: '0.65rem 1.4rem' }}>
              <Trophy size={16} />
              <span>Go to Live Leaderboard</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(212, 175, 55, 0.2)', background: 'rgba(5, 7, 10, 0.5)' }}>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--gold-light)' }}>CANDIDATE</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--gold-light)' }}>TARGET ROLE</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--gold-light)', textAlign: 'center' }}>ATS RESUME SCORE</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--gold-light)', textAlign: 'center' }}>INVITE EMAIL</th>
                  <th style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--gold-light)', textAlign: 'center' }}>ASSESSMENT LINK</th>
                </tr>
              </thead>
              <tbody>
                {results.candidates.map((cand, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{cand.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{cand.email}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {cand.targetRole}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <span style={{ color: 'var(--gold-light)', fontWeight: 700, fontSize: '0.95rem' }}>
                        {cand.resumeScore}%
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <span className="badge-emerald" style={{ fontSize: '0.7rem' }}>
                        <Mail size={11} /> Sent
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <Link
                        to={`/assessment/${cand.token}`}
                        target="_blank"
                        className="btn-dark"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                      >
                        <span>Open Assessment</span>
                        <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
