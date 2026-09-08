import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Sparkles, Shield, ArrowRight, CheckCircle2, Cpu, BarChart2, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { pdfParser } from '../services/pdfParser';

export default function UploadPage() {
  const { dispatch } = useApp();
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const processFile = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage("Please upload a valid PDF resume document.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const extractedText = await pdfParser.extractTextFromPDF(file);
      
      const fileToBase64 = (f) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(f);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      let pdfBase64 = null;
      try {
        pdfBase64 = await fileToBase64(file);
      } catch (b64Err) {
        console.warn("Base64 conversion notice:", b64Err);
      }

      dispatch({
        type: 'START_NEW_ANALYSIS',
        payload: { 
          rawResumeText: extractedText,
          pdfBase64: pdfBase64,
          pdfFileName: file.name,
          userEmail: user?.email || null,
          userName: user?.name || null
        }
      });
      navigate('/analyzing');
    } catch (err) {
      console.error("PDF Parsing error:", err);
      setErrorMessage(err.message || "Failed to parse PDF resume. Please try another PDF resume file.");
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!isAuthenticated) {
      openAuthModal('login', () => {
        processFile(file);
      });
      return;
    }

    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUploadBoxClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login', () => {
        fileInputRef.current?.click();
      });
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <div style={{ width: '100%', padding: '0 0.5rem', paddingTop: '1rem' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={16} color="var(--gold-light)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--gold-light)', fontWeight: 600, letterSpacing: '0.05em' }}>
            NEXT-GEN AI RESUME & INTERVIEW SIMULATION
          </span>
        </div>

        <h1 className="font-royal" style={{
          fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
          fontWeight: 800,
          color: '#fff',
          lineHeight: '1.2',
          marginBottom: '1.25rem'
        }}>
          Transform Your Resume Into a <br />
          <span className="gold-text-gradient">Live AI Interview Evaluation</span>
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          maxWidth: '720px',
          margin: '0 auto 2rem',
          lineHeight: '1.6'
        }}>
          Upload your PDF resume to extract deep competency metrics, pull live GitHub telemetry, and experience an adaptive 4-round technical & voice interview simulator.
        </p>
      </div>

      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadBoxClick}
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
          accept="application/pdf"
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
          <Upload size={32} color="var(--gold-light)" />
        </div>

        <h3 className="font-royal" style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>
          {isLoading ? "Reading and Extracting PDF..." : "Drop your PDF Resume here"}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Supports clean standard PDF resumes • Secure client-side parsing {!isAuthenticated && "• Sign-in required on upload"}
        </p>

        <button
          type="button"
          className="btn-gold"
          disabled={isLoading}
          style={{ padding: '0.85rem 2rem', pointerEvents: 'none' }}
        >
          {isAuthenticated ? <FileText size={18} /> : <Lock size={18} />}
          <span>{isLoading ? "Analyzing..." : (isAuthenticated ? "Browse PDF File" : "Sign In & Upload Resume")}</span>
        </button>

        {errorMessage && (
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
            {errorMessage}
          </div>
        )}
      </div>

      {/* Feature Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {[
          {
            icon: BarChart2,
            title: "Dynamic Skill Extraction",
            desc: "Parses technical proficiencies, project depth, and repository metrics into a visual radar profile."
          },
          {
            icon: Cpu,
            title: "4-Round Multi-Modal AI",
            desc: "Progresses from Aptitude to Domain MCQs, Adaptive Practical Scenarios, and Voice Communication."
          },
          {
            icon: Sparkles,
            title: "Live Speech-to-Text",
            desc: "Real-time speech recognition evaluates verbal clarity, structure, and project articulation."
          },
          {
            icon: Shield,
            title: "Role-Fitness Certification",
            desc: "Synthesizes an executive scorecard with ranked improvement targets and alternate role matches."
          }
        ].map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div key={idx} className="royal-glass-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(212, 175, 55, 0.12)',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Icon size={20} color="var(--gold-light)" />
              </div>
              <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                {feat.title}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.5' }}>
                {feat.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
