import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, Search, Trash2, ArrowRight, ShieldCheck, Award, Calendar, FileText } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useApp } from '../context/AppContext';
import ScoreBadge from '../components/common/ScoreBadge';

export default function HistoryPage() {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const [historyList, setHistoryList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const list = storageService.getResultsIndex();
    setHistoryList(list || []);
  };

  const handleDelete = (e, resultId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this assessment attempt from local history?")) {
      storageService.deleteResult(resultId);
      loadHistory();
    }
  };

  const handleOpenResult = (resultId) => {
    const full = storageService.getResultById(resultId);
    if (full) {
      dispatch({ type: 'LOAD_SAVED_RESULT', payload: full });
      navigate(`/results/${resultId}/report`);
    }
  };

  const filtered = historyList.filter(item => {
    const query = searchTerm.toLowerCase();
    const nameMatch = (item.candidateName || '').toLowerCase().includes(query);
    const roleMatch = (item.jobRole?.title || '').toLowerCase().includes(query);
    return nameMatch || roleMatch;
  });

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingTop: '1rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge-gold">
              <History size={14} /> LOCAL STORAGE ARCHIVE
            </span>
          </div>
          <h1 className="font-royal" style={{ fontSize: '2rem', color: '#fff', fontWeight: 800 }}>
            Past Assessment Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            All evaluations are stored privately inside this browser's localStorage.
          </p>
        </div>

        <Link to="/" className="btn-gold" style={{ padding: '0.75rem 1.4rem' }}>
          <span>New Resume Evaluation</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          position: 'relative',
          maxWidth: '480px',
          width: '100%'
        }}>
          <Search size={18} color="var(--gold-light)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by candidate name or target role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.8rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(10, 13, 20, 0.85)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              color: '#fff',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="royal-glass-card solid-border" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <FileText size={28} color="var(--gold-light)" />
          </div>
          <h3 className="font-royal" style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem' }}>
            No Assessment History Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
            You haven't run any candidate interview assessments yet. Upload a resume or try a demo profile to start!
          </p>
          <Link to="/" className="btn-gold">
            <span>Upload Resume Now</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(item => (
            <div
              key={item.resultId}
              onClick={() => handleOpenResult(item.resultId)}
              className="royal-glass-card"
              style={{
                padding: '1.4rem 1.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem'
              }}
            >
              {/* Left Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  background: 'rgba(212, 175, 55, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Award size={26} color="var(--gold-light)" />
                </div>

                <div>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {item.candidateName || "Candidate Profile"}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {item.jobRole?.title || "Software Engineer"}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>•</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Score & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div className="font-royal" style={{ fontSize: '1.4rem', color: 'var(--gold-light)', fontWeight: 800 }}>
                    {item.fitnessPercent}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Role Fitness</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.resultId)}
                    title="Delete record"
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      color: '#fb7185',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="btn-gold" style={{ padding: '0.55rem 1rem', fontSize: '0.82rem' }}>
                    <span>View Dossier</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
