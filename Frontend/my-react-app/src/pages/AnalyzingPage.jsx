import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, CheckCircle2, Cpu, Github, Layers, FileCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { aiClient } from '../services/aiClient';
import { mlClient } from '../services/mlClient';
import { githubClient } from '../services/githubClient';
import BackButton from '../components/common/BackButton';

export default function AnalyzingPage() {
  const { state, dispatch } = useApp();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [currentStage, setCurrentStage] = useState(1);
  const [stages, setStages] = useState([
    { id: 1, title: "Extracting Resume Content & Tokens", status: "running", icon: FileCheck },
    { id: 2, title: "Synthesizing AI Skill Vector & Projects", status: "pending", icon: Cpu },
    { id: 3, title: "Supervised ML Random Forest Suitability Prediction", status: "pending", icon: Layers },
    { id: 4, title: "Querying Public GitHub Repository Telemetry", status: "pending", icon: Github }
  ]);
  useEffect(() => {
    let cancelled = false;

    async function runAnalysis() {
      try {
        // Stage 1 -> 2
        await new Promise(r => setTimeout(r, 600));
        if (cancelled) return;
        setStages(prev => prev.map(s => s.id === 1 ? { ...s, status: 'done' } : (s.id === 2 ? { ...s, status: 'running' } : s)));
        setCurrentStage(2);

        // Call AI Parser with Text & Image/PDF Base64
        const resumeProfile = await aiClient.parseResume(state.rawResumeText || "Candidate Fullstack Engineer", state.pdfBase64);
        dispatch({ type: 'SET_RESUME_PROFILE', payload: resumeProfile });

        // Stage 2 -> 3 (Machine Learning Suitability Prediction)
        setStages(prev => prev.map(s => s.id === 2 ? { ...s, status: 'done' } : (s.id === 3 ? { ...s, status: 'running' } : s)));
        setCurrentStage(3);

        // Run Supervised Random Forest Classifier Model
        let mlResult = null;
        try {
          mlResult = await mlClient.predictSuitability(resumeProfile, state.jobRole, state.rawResumeText);
          if (mlResult) {
            dispatch({ type: 'SET_ML_PREDICTION', payload: mlResult });
          }
        } catch (mlErr) {
          console.warn('[AnalyzingPage] ML Suitability prediction error:', mlErr);
        }

        // Calculate ATS Score from parsed skills or profile
        const atsScore = Math.round(
          resumeProfile?.skills && resumeProfile.skills.length > 0
            ? resumeProfile.skills.reduce((acc, s) => acc + (s.percent || 75), 0) / resumeProfile.skills.length
            : 85
        );

        // Persist Candidate Evaluation to Oracle Database as a fresh record for the active user
        const userEmail = user?.email || resumeProfile?.email || state.userEmail || 'candidate@evalai.com';
        const userName = resumeProfile?.candidateName && resumeProfile.candidateName !== 'Candidate' 
          ? resumeProfile.candidateName 
          : (user?.name || state.userName || 'Candidate');
        const targetRole = state.jobRole?.title || 'Fullstack Software Engineer';
        const companyName = state.jobRole?.company || 'Standard Corporate Track';

        try {
          const saveRes = await fetch('http://localhost:8085/api/resumes/save-evaluation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
              candidateId: null, // Always create a brand new distinct record for a new resume analysis
              name: userName,
              email: userEmail,
              targetRole: targetRole,
              companyName: companyName,
              resumeScore: atsScore,
              status: 'INVITED',
              skills: (resumeProfile?.skills || []).map(s => s.name || s),
              summary: resumeProfile?.summary || '',
              mlPrediction: mlResult?.prediction || 'Suitable',
              mlSuitabilityScore: mlResult?.suitability_score || 85.0,
              mlMatchedSkills: mlResult?.matched_skills || [],
              mlMissingSkills: mlResult?.missing_skills || [],
              mlFeatureImportances: mlResult?.feature_importances || [],
              mlFeatures: mlResult?.features || {},
              pdfBase64: state.pdfBase64 || null,
              pdfFileName: state.pdfFileName || null
            })
          });
          if (saveRes.ok) {
            const saveData = await saveRes.json();
            if (saveData?.candidateId) {
              sessionStorage.setItem('eval_candidate_id', String(saveData.candidateId));
              if (saveData.token) {
                sessionStorage.setItem('eval_candidate_token', saveData.token);
              }
              dispatch({ type: 'SET_CANDIDATE_ID', payload: saveData.candidateId });
              dispatch({ type: 'SET_CANDIDATE_TOKEN', payload: saveData.token });
            }
          }
        } catch (dbErr) {
          console.warn('Evaluation persistence warning:', dbErr);
        }

        // Stage 3 -> 4
        setStages(prev => prev.map(s => s.id === 3 ? { ...s, status: 'done' } : (s.id === 4 ? { ...s, status: 'running' } : s)));
        setCurrentStage(4);

        // Fetch GitHub / Web Profile Data
        if (resumeProfile?.links?.github) {
          const ghData = await githubClient.fetchUserData(resumeProfile.links.github, {
            candidateName: resumeProfile.candidateName || user?.name || "Candidate",
            skills: resumeProfile.skills || [],
            projects: resumeProfile.projects || []
          });
          if (ghData) {
            dispatch({ type: 'SET_GITHUB_DATA', payload: ghData });
          }
        }

        await new Promise(r => setTimeout(r, 600));
        setStages(prev => prev.map(s => ({ ...s, status: 'done' })));

        // Navigate to results
        setTimeout(() => {
          navigate(`/results/${state.resultId || 'latest'}`);
        }, 400);

      } catch (err) {
        console.error("Analysis pipeline failed:", err);
        navigate(`/results/${state.resultId || 'latest'}`);
      }
    }

    runAnalysis();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{
      maxWidth: '650px',
      margin: '2rem auto',
      textAlign: 'center',
      padding: '2rem 1.5rem'
    }}>
      {/* Top Left Navigation */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1.25rem' }}>
        <BackButton to="/" label="Cancel Analysis" />
      </div>

      {/* Royal Pulsing Orb */}
      <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0 auto 2.5rem' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, rgba(170, 130, 10, 0.1) 70%, transparent 100%)',
          animation: 'goldPulse 2s infinite ease-in-out'
        }} />
        <div style={{
          position: 'absolute',
          inset: '10px',
          borderRadius: '50%',
          border: '2px dashed var(--gold-light)',
          animation: 'spinSlow 12s linear infinite'
        }} />
        <div style={{
          position: 'absolute',
          inset: '20px',
          borderRadius: '50%',
          background: 'var(--grad-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(212, 175, 55, 0.7)'
        }}>
          <Sparkles size={36} color="#07080c" />
        </div>
      </div>

      <h2 className="font-royal" style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '0.5rem' }}>
        Analyzing Candidate Resume
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
        Extracting deep semantic skills, verifiable metrics, and preparing adaptive interview tracks...
      </p>

      {/* Stage Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left' }}>
        {stages.map((stage) => {
          const Icon = stage.icon;
          const isDone = stage.status === 'done';
          const isRunning = stage.status === 'running';

          return (
            <div
              key={stage.id}
              className="royal-glass-card"
              style={{
                padding: '1.1rem 1.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderColor: isRunning ? 'var(--gold-light)' : (isDone ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.08)'),
                background: isRunning ? 'rgba(212, 175, 55, 0.12)' : 'rgba(12, 15, 23, 0.7)',
                boxShadow: isRunning ? '0 0 16px rgba(212, 175, 55, 0.25)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: isDone ? 'rgba(16, 185, 129, 0.15)' : (isRunning ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.04)'),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={18} color={isDone ? '#34d399' : (isRunning ? 'var(--gold-light)' : 'var(--text-muted)')} />
                </div>
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: isRunning ? 600 : 500,
                  color: isDone ? '#fff' : (isRunning ? 'var(--gold-light)' : 'var(--text-secondary)')
                }}>
                  {stage.title}
                </span>
              </div>

              <div>
                {isDone && <CheckCircle2 size={20} color="#34d399" />}
                {isRunning && (
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '2px solid rgba(212, 175, 55, 0.3)',
                    borderTopColor: 'var(--gold-light)',
                    animation: 'spinSlow 1s linear infinite'
                  }} />
                )}
                {stage.status === 'pending' && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Waiting</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
