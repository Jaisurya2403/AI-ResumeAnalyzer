import React, { useState } from 'react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { Radar as RadarIcon, BarChart3 } from 'lucide-react';

export default function SkillRadarChart({ skills = [] }) {
  const [chartType, setChartType] = useState('radar'); // 'radar' or 'bar'

  const formattedData = (skills || []).map(s => ({
    skill: s.name,
    score: s.percent || 75,
    fullMark: 100
  }));

  const goldColors = ['#d4af37', '#f5df88', '#aa820a', '#ffd700', '#c5a059', '#e6a817'];

  return (
    <div className="royal-glass-card" style={{ padding: '1.75rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h3 className="font-royal" style={{ fontSize: '1.15rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--gold-light)' }}>◆</span>
            Skills Competency Profile
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            AI-extracted proficiency rating across technical disciplines
          </p>
        </div>

        <div style={{
          display: 'flex',
          background: 'rgba(5, 7, 10, 0.7)',
          borderRadius: 'var(--radius-md)',
          padding: '3px',
          border: '1px solid rgba(212, 175, 55, 0.2)'
        }}>
          <button
            onClick={() => setChartType('radar')}
            style={{
              background: chartType === 'radar' ? 'rgba(212, 175, 55, 0.25)' : 'transparent',
              color: chartType === 'radar' ? 'var(--gold-light)' : 'var(--text-muted)',
              border: 'none',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem'
            }}
          >
            <RadarIcon size={14} />
            Radar
          </button>
          <button
            onClick={() => setChartType('bar')}
            style={{
              background: chartType === 'bar' ? 'rgba(212, 175, 55, 0.25)' : 'transparent',
              color: chartType === 'bar' ? 'var(--gold-light)' : 'var(--text-muted)',
              border: 'none',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.75rem'
            }}
          >
            <BarChart3 size={14} />
            Bar
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: '300px', width: '100%', position: 'relative' }}>
        {formattedData.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            No skill telemetry available.
          </div>
        ) : chartType === 'radar' ? (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={formattedData}>
              <PolarGrid stroke="rgba(212, 175, 55, 0.18)" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: 'var(--text-muted)', fontSize: 9 }}
                stroke="rgba(255,255,255,0.1)"
              />
              <Radar
                name="Proficiency"
                dataKey="score"
                stroke="#d4af37"
                fill="rgba(212, 175, 55, 0.35)"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis
                dataKey="skill"
                type="category"
                width={120}
                tick={{ fill: '#cbd5e1', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: '#0c0f17',
                  borderColor: 'rgba(212, 175, 55, 0.4)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
                formatter={(val) => [`${val}%`, 'Proficiency']}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={goldColors[index % goldColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Skill Pill badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
        {skills.map((s, i) => (
          <span key={i} className="badge-gold" style={{ fontSize: '0.78rem' }}>
            {s.name} <strong style={{ color: '#fff', marginLeft: '3px' }}>{s.percent}%</strong>
          </span>
        ))}
      </div>
    </div>
  );
}
