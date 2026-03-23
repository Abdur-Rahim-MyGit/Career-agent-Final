import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Direction data ──────────────────────────────────────────────────────────
const PRIMARY_DIRECTIONS = [
  {
    name: 'Research, Writing and Content',
    desc: 'Use research and analytical writing skills in content, journalism and research roles.',
    roles: ['Content Writer', 'Research Associate', 'Editorial Assistant', 'Journalism Associate'],
    sk: '7/9',
  },
  {
    name: 'Education and Training',
    desc: 'Apply subject knowledge and communication skills in teaching and training.',
    roles: ['Teacher (School)', 'Corporate Trainer', 'Academic Coordinator', 'Education Counsellor'],
    sk: '5/8',
  },
  {
    name: 'Policy, Governance and Administration',
    desc: 'Understanding of political and historical systems for policy and admin roles.',
    roles: ['Legal Researcher', 'Programme Coordinator', 'Regulatory Affairs Analyst'],
    sk: '4/7',
  },
  {
    name: 'Software and Technology',
    desc: 'Build products and systems using engineering and CS skills.',
    roles: ['Software Developer', 'Data Engineer', 'DevOps Engineer', 'QA Engineer'],
    sk: '6/10',
  },
];

const SECONDARY_DIRECTIONS = [
  {
    name: 'Business Operations',
    desc: 'Organisational and communication skills for general business operations.',
    roles: ['Operations Executive', 'Business Development Executive', 'Project Coordinator', 'CRM Executive'],
    extra: 'Data analysis, business software (Excel, CRM)',
    effort: '3-6 months',
  },
  {
    name: 'Digital Marketing and Social Media',
    desc: 'Writing and research skills transfer well to digital marketing roles.',
    roles: ['Digital Marketing Executive', 'Social Media Manager', 'Content Strategist'],
    extra: 'Social media tools, Google Analytics, SEO',
    effort: '3-6 months',
  },
  {
    name: 'Finance and Banking',
    desc: 'Analytical skills combined with financial knowledge open banking roles.',
    roles: ['Financial Analyst', 'Credit Analyst', 'Tax Consultant', 'Business Analyst'],
    extra: 'Excel advanced, Tally, Financial Modelling',
    effort: '3-6 months',
  },
];

const ALTERNATE_DIRECTIONS = [
  {
    name: 'Data and Analytics',
    desc: 'Build toward analytics roles with significant additional learning.',
    roles: ['Data Analyst', 'Market Research Analyst'],
    extra: 'Excel advanced, SQL, data visualisation, Python',
    effort: '6-12 months',
    note: 'Significant pivot. Requires dedicated self-study in technical skills.',
  },
  {
    name: 'Entrepreneurship',
    desc: 'Start or join a startup using research and communication strengths.',
    roles: ['Business Development Executive'],
    extra: 'Business fundamentals, financial literacy, digital tools',
    effort: '6-12 months',
  },
];

// ─── Helper styles ───────────────────────────────────────────────────────────
const S = {
  wrap: { maxWidth: 600, fontFamily: 'var(--font-sans)' },
  card: (borderLeft) => ({
    background: 'var(--bg-primary)',
    border: '0.5px solid var(--border)',
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 10,
    borderLeft: borderLeft ? `3px solid ${borderLeft}` : undefined,
  }),
  secHead: { fontSize: 14, fontWeight: 500, margin: '20px 0 2px' },
  secSub: { fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 8px' },
};

const TYPE_COLORS = {
  Primary:    ['#1D9E75', 'var(--bg-success)', 'var(--text-success)'],
  Secondary:  ['#BA7517', 'var(--bg-warning)', 'var(--text-warning)'],
  Alternate:  ['#888780', 'var(--bg-secondary)', 'var(--text-secondary)'],
};

function DirectionCard({ d, type, onSelect, selected }) {
  const [bdr, bg, fg] = TYPE_COLORS[type];
  const isSelected = selected === d.name;

  return (
    <div style={{ ...S.card(bdr), opacity: 1, transition: 'box-shadow 0.15s', boxShadow: isSelected ? `0 0 0 2px ${bdr}` : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 500, margin: '0 0 4px' }}>{d.name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 8px' }}>{d.desc}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {d.roles.map(r => (
              <span key={r} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{r}</span>
            ))}
          </div>
          {d.extra && (
            <p style={{ fontSize: 11, color: 'var(--text-warning)', margin: '0 0 4px' }}>Additional skills needed: {d.extra}</p>
          )}
          {d.effort && (
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Effort: {d.effort}</p>
          )}
          {d.note && (
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0', fontStyle: 'italic' }}>{d.note}</p>
          )}
        </div>

        <div style={{ textAlign: 'center', marginLeft: 12, flexShrink: 0 }}>
          {d.sk && (
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              border: `3px solid ${bdr}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 500,
              color: fg, marginBottom: 8,
            }}>{d.sk}</div>
          )}
          <button
            onClick={() => onSelect(d.name)}
            style={{
              padding: '5px 12px', fontSize: 11, cursor: 'pointer',
              border: `0.5px solid ${bdr}`,
              borderRadius: 8,
              background: isSelected ? bg : 'transparent',
              color: fg,
              fontWeight: isSelected ? 500 : 400,
            }}
          >
            {isSelected ? '✓ Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DirectionSelection() {
  const navigate = useNavigate();
  const degree = localStorage.getItem('smaart_degree') || 'your degree';
  const [selected, setSelected] = useState('');

  const handleSelect = (name) => setSelected(name);

  const handleContinue = () => {
    if (selected) localStorage.setItem('smaart_direction', selected);
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={S.wrap}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{degree}</p>
          <p style={{ fontSize: 18, fontWeight: 500, margin: '4px 0' }}>Choose your career direction</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>You can change your direction anytime.</p>
        </div>

        {/* Primary */}
        <div style={S.secHead}>Primary</div>
        <p style={S.secSub}>Directly aligned with your degree</p>
        {PRIMARY_DIRECTIONS.map(d => (
          <DirectionCard key={d.name} d={d} type="Primary" onSelect={handleSelect} selected={selected} />
        ))}

        {/* Secondary */}
        <div style={S.secHead}>Secondary</div>
        <p style={S.secSub}>Reachable with additional skills</p>
        {SECONDARY_DIRECTIONS.map(d => (
          <DirectionCard key={d.name} d={d} type="Secondary" onSelect={handleSelect} selected={selected} />
        ))}

        {/* Alternate */}
        <div style={S.secHead}>Alternate</div>
        <p style={S.secSub}>Possible with significant development</p>
        {ALTERNATE_DIRECTIONS.map(d => (
          <DirectionCard key={d.name} d={d} type="Alternate" onSelect={handleSelect} selected={selected} />
        ))}

        {/* Selected / Continue */}
        {selected && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-info)',
            borderRadius: 8,
            marginTop: 12,
          }}>
            <p style={{ fontSize: 13, color: 'var(--text-info)', margin: 0, fontWeight: 500 }}>
              Selected: {selected}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-info)', margin: '4px 0 0' }}>
              You can change your direction anytime.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '6px 14px', fontSize: 13,
              border: '0.5px solid var(--border)',
              borderRadius: 8,
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Skip — show all directions
          </button>
          <button
            onClick={handleContinue}
            style={{
              padding: '8px 20px', border: 'none',
              borderRadius: 8,
              background: 'var(--bg-info)',
              color: 'var(--text-info)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
