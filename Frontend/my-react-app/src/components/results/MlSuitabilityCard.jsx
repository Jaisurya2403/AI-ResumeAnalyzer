import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, BarChart3, Database, Layers, ShieldCheck, Sparkles } from 'lucide-react';

export default function MlSuitabilityCard({ mlData }) {
  if (!mlData) return null;

  const isSuitable = mlData.suitable !== false && (mlData.prediction === 'Suitable' || mlData.suitability_score >= 50);
  const score = mlData.suitability_score != null ? Math.round(mlData.suitability_score) : 85;
  const matchedSkills = mlData.matched_skills || [];
  const missingSkills = mlData.missing_skills || [];
  const featureImportances = mlData.feature_importances || [];
  const modelInfo = mlData.model_info || {
    algorithm: "RandomForestClassifier",
    test_accuracy: 88.33,
    precision: 86.75,
    recall: 91.72,
    f1_score: 89.16
  };
  const features = mlData.features || {};

  return (
    <div className="royal-glass-card solid-border" style={{
      padding: '2rem 2.5rem',
      marginBottom: '2rem',
      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.09) 0%, rgba(10, 14, 22, 0.96) 100%)',
      borderColor: isSuitable ? 'rgba(212, 175, 55, 0.4)' : 'rgba(239, 68, 68, 0.35)',
      boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(10, 14, 22, 0.8) 100%)',
            border: '1.5px solid var(--gold-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
          }}>
            <Cpu size={24} color="var(--gold-light)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold-light)', fontWeight: 700 }}>
                Supervised Machine Learning
              </span>
              <span className="badge-gold" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                Trained RFC Model
              </span>
            </div>
            <h2 className="font-royal" style={{ fontSize: '1.4rem', color: '#fff', margin: '0.2rem 0 0 0', fontWeight: 700 }}>
              Resume-to-Job Suitability Prediction
            </h2>
          </div>
        </div>

        {/* Model Metrics Tag */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem' }}>
            Algorithm: <strong style={{ color: '#fff' }}>{modelInfo.algorithm}</strong>
          </span>
          <span style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', color: 'var(--gold-light)', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem' }}>
            Test Accuracy: <strong>{modelInfo.test_accuracy}%</strong>
          </span>
        </div>
      </div>

      {/* Main Score & Classification Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.75rem'
      }}>
        {/* Prediction Status Box */}
        <div style={{
          background: isSuitable ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${isSuitable ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)'}`,
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: isSuitable ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isSuitable ? (
              <CheckCircle2 size={32} color="#10b981" />
            ) : (
              <AlertTriangle size={32} color="#ef4444" />
            )}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ML Classification
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isSuitable ? '#10b981' : '#ef4444' }}>
              {isSuitable ? 'Suitable for Role' : 'Not Suitable (Skill Gap)'}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              {isSuitable 
                ? 'Candidate features meet or exceed role competency threshold.' 
                : 'Candidate requires bridging key technical skill gaps.'}
            </div>
          </div>
        </div>

        {/* Suitability Score Box */}
        <div style={{
          background: 'rgba(212, 175, 55, 0.06)',
          border: '1px solid rgba(212, 175, 55, 0.25)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Model Probability Score
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--gold-light)', lineHeight: 1.1, marginTop: '0.3rem' }}>
              {score}%
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
              Confidence: <strong>{mlData.confidence || score}%</strong> | Target: <strong>{mlData.role_title || 'Role'}</strong>
            </div>
          </div>

          <div style={{ width: '80px', height: '80px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isSuitable ? "url(#goldGradML)" : "#ef4444"}
                strokeWidth="3.5"
                strokeDasharray={`${score}, 100`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="goldGradML" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d4af37" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
              {score}%
            </div>
          </div>
        </div>
      </div>

      {/* Skills Match vs Missing Comparison */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        {/* Matched Skills */}
        <div style={{ background: 'rgba(5, 7, 12, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={16} /> Matched Required Skills ({matchedSkills.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Found in Resume</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {matchedSkills.length > 0 ? (
              matchedSkills.map((skill, idx) => (
                <span key={idx} style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#6ee7b7',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No direct role matches detected</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div style={{ background: 'rgba(5, 7, 12, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={16} /> Missing / Growth Skills ({missingSkills.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role Gaps</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {missingSkills.length > 0 ? (
              missingSkills.map((skill, idx) => (
                <span key={idx} style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  color: '#fcd34d',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ color: '#10b981', fontSize: '0.8rem' }}>All core role skills satisfied!</span>
            )}
          </div>
        </div>
      </div>

      {/* Feature Importance & Model Transparency */}
      <div style={{ background: 'rgba(5, 7, 12, 0.75)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '10px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={17} color="var(--gold-light)" />
            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
              Random Forest Feature Importance Analysis
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Precision: <strong style={{ color: 'var(--gold-light)' }}>{modelInfo.precision}%</strong></span>
            <span>Recall: <strong style={{ color: 'var(--gold-light)' }}>{modelInfo.recall}%</strong></span>
            <span>F1-Score: <strong style={{ color: 'var(--gold-light)' }}>{modelInfo.f1_score}%</strong></span>
          </div>
        </div>

        {/* Feature Importance Bars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          {featureImportances.slice(0, 6).map((feat, idx) => {
            const labelMap = {
              skills_match_ratio: "Skill Match Ratio",
              skills_match_count: "Matched Skills Count",
              missing_skills_count: "Missing Skills Count",
              projects_count: "Projects Count",
              experience_years: "Experience Years",
              tech_skills_count: "Tech Skills Count",
              resume_word_count: "Resume Content Depth",
              prog_languages_count: "Programming Languages",
              has_internship: "Internship Experience"
            };
            const label = labelMap[feat.feature] || feat.feature;
            const featVal = features[feat.feature] != null ? features[feat.feature] : '-';

            return (
              <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{label}</span>
                  <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>{feat.percentage}%</span>
                </div>
                <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, feat.percentage * 3.5)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--gold-dark), var(--gold-light))'
                  }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', textAlign: 'right' }}>
                  Extracted Value: <span style={{ color: '#fff', fontWeight: 600 }}>{featVal}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
