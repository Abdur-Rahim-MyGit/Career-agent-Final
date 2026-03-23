import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const font = { fontFamily: 'var(--font-sans)' };

function Metric({ label, value, sub }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '12px 16px' }}>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 2px' }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{sub}</p>}
    </div>
  );
}

function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, flex: 1, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(pct * 3, 100)}%`, background: color || '#378ADD', borderRadius: 3 }} />
    </div>
  );
}

function Card({ children }) {
  return (
    <div style={{ background: 'var(--bg-primary)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 12 }}>
      {children}
    </div>
  );
}

function SecHead({ title, sub }) {
  return (
    <div style={{ margin: '20px 0 12px' }}>
      <p style={{ fontSize: 16, fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>{title}</p>
      {sub && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{sub}</p>}
    </div>
  );
}

export default function PODashboard() {
  const { collegeCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const code = collegeCode || 'DEMO01';
        const res = await axios.get(`/api/po/${code}/dashboard`);
        setData(res.data);
      } catch { /* use mock */ }
      setLoading(false);
    })();
  }, [collegeCode]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', ...font }}>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading placement officer dashboard…</p>
    </div>
  );

  /* mock data from company mockup */
  const college = data?.collegeName || `College ${collegeCode || 'Demo'}`;
  const batch = data?.batch || 'B.Com, BA, BBA — 2027 and 2028 batches';
  const totalStudents = data?.totalStudents || 290;
  const activeStudents = data?.activeStudents || 234;
  const activePct = Math.round((activeStudents / totalStudents) * 100);
  const avgCoverage = data?.avgFoundationCoverage || 47;
  const fiveSkills = data?.fiveOrMoreSkills || 89;
  const fiveSkillsPct = Math.round((fiveSkills / totalStudents) * 100);

  const engagement = data?.engagement || [
    { n: 142, label: '✓ Green (49%)', type: 'success' },
    { n: 103, label: '⚠ Amber (35%)', type: 'warning' },
    { n: 45,  label: '✗ Red (16%)',   type: 'danger' },
  ];

  const directions = data?.topDirections || [
    { n: 'Software Development',   c: 67, p: 23 },
    { n: 'Corporate Finance',      c: 52, p: 18 },
    { n: 'Digital Marketing',      c: 41, p: 14 },
    { n: 'Business Operations',    c: 38, p: 13 },
    { n: 'Education and Training', c: 29, p: 10 },
  ];

  const locations = data?.locationBreakdown || [
    { p: 'Home City Only',      c: 78, w: 27, type: 'danger' },
    { p: 'Home State',          c: 45, w: 16, type: 'warning' },
    { p: 'Open to Metros',      c: 89, w: 31, type: 'info' },
    { p: 'Anywhere in India',   c: 67, w: 23, type: 'success' },
    { p: 'Not specified',       c: 11, w:  4, type: 'secondary' },
  ];

  const salaryGaps = data?.salaryExpectationVsMarket || [
    { d: 'Software Dev',     ex: '6-8L', mk: '4-7L',   g: 'slight' },
    { d: 'Corporate Finance',ex: '6-8L', mk: '2.5-6L', g: 'high' },
    { d: 'Digital Marketing',ex: '4-6L', mk: '2.5-5L', g: 'moderate' },
  ];

  const certReady = data?.certificationReadiness || [
    { c: 'NCFM',                      r: 15, d: 'Finance' },
    { c: 'Google Analytics',           r: 23, d: 'Marketing' },
    { c: 'AWS Cloud Practitioner',     r: 12, d: 'Software' },
    { c: 'HubSpot Content Marketing',  r: 18, d: 'Marketing' },
  ];

  const redStudents = data?.redStudents || [
    { n: 'Rahul Patil',       d: 'Corporate Finance', f: '1 of 8', l: '42 days ago' },
    { n: 'Sneha Deshpande',   d: 'Software Dev',      f: '0 of 9', l: '38 days ago' },
    { n: 'Aditya Kumar',      d: 'Business Ops',      f: '2 of 7', l: '35 days ago' },
    { n: 'Meera Joshi',       d: 'Education',         f: '1 of 8', l: '29 days ago' },
    { n: 'Vikram Singh',      d: 'Digital Marketing', f: '0 of 8', l: '27 days ago' },
  ];

  const typeColors = {
    success:   { bg: 'var(--bg-success)',   fg: 'var(--text-success)' },
    warning:   { bg: 'var(--bg-warning)',   fg: 'var(--text-warning)' },
    danger:    { bg: 'var(--bg-danger)',    fg: 'var(--text-danger)' },
    info:      { bg: 'var(--bg-info)',      fg: 'var(--text-info)' },
    secondary: { bg: 'var(--bg-secondary)', fg: 'var(--text-secondary)' },
  };

  const gapColor = { high: 'danger', moderate: 'warning', slight: 'success' };

  return (
    <div style={{ maxWidth: 680, ...font }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Placement Officer dashboard</p>
        <p style={{ fontSize: 18, fontWeight: 500, margin: '4px 0 2px', color: 'var(--text-primary)' }}>{college}</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{batch}</p>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginBottom: 16 }}>
        <Metric label="Total students" value={totalStudents} />
        <Metric label="Active (30 days)" value={activeStudents} sub={`${activePct}%`} />
        <Metric label="Avg foundation coverage" value={`${avgCoverage}%`} sub="across all students" />
        <Metric label="5+ Foundation Skills" value={fiveSkills} sub={`${fiveSkillsPct}%`} />
      </div>

      {/* Engagement distribution */}
      <SecHead title="Engagement distribution" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {engagement.map((e, i) => {
          const { bg, fg } = typeColors[e.type] || typeColors.secondary;
          return (
            <div key={i} style={{ flex: 1, background: bg, borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 500, margin: 0, color: fg }}>{e.n}</p>
              <p style={{ fontSize: 12, margin: '2px 0 0', color: fg }}>{e.label}</p>
            </div>
          );
        })}
      </div>

      {/* Direction distribution */}
      <SecHead title="Direction distribution" sub="Top 5 directions" />
      <Card>
        {directions.map((d, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{d.n}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{d.c}</span>
            </div>
            <ProgressBar pct={d.p} color="#378ADD" />
          </div>
        ))}
      </Card>

      {/* Location preference */}
      <SecHead title="Location preference" />
      <Card>
        {locations.map((l, i) => {
          const { fg } = typeColors[l.type] || typeColors.secondary;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 13, width: 150, color: 'var(--text-primary)' }}>{l.p}</span>
              <ProgressBar pct={l.w} color={fg} />
              <span style={{ fontSize: 13, fontWeight: 500, width: 36, textAlign: 'right', color: 'var(--text-primary)' }}>{l.c}</span>
            </div>
          );
        })}
        <p style={{ fontSize: 12, color: 'var(--text-warning)', margin: '8px 0 0', fontWeight: 500 }}>
          78 students (27%) prefer Home City Only — consider a session on remote opportunities.
        </p>
      </Card>

      {/* Salary expectation vs market reality */}
      <SecHead title="Salary expectation vs market reality" />
      <Card>
        {salaryGaps.map((s, i) => {
          const gType = gapColor[s.g] || 'secondary';
          const { bg, fg } = typeColors[gType];
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, paddingBottom: 10, borderBottom: i < salaryGaps.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: 13, width: 140, color: 'var(--text-primary)' }}>{s.d}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>
                  <span>Expect: {s.ex}</span>
                  <span>Market: {s.mk}</span>
                </div>
                <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: '50%', background: 'var(--text-info)' }} />
                  <div style={{ width: s.g === 'high' ? '50%' : s.g === 'moderate' ? '35%' : '20%', background: fg }} />
                </div>
              </div>
              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 8, background: bg, color: fg, fontSize: 11, fontWeight: 500 }}>
                {s.g} gap
              </span>
            </div>
          );
        })}
        <p style={{ fontSize: 12, color: 'var(--text-danger)', margin: '4px 0 0', fontWeight: 500 }}>
          Corporate Finance shows largest gap — organise a salary expectations session.
        </p>
      </Card>

      {/* Experience tracking */}
      <SecHead title="Experience tracking" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10, marginBottom: 16 }}>
        <Metric label="Internship experience" value={data?.internshipCount || 87} sub="30%" />
        <Metric label="Completed projects" value={data?.projectCount || 124} sub="43%" />
        <Metric label="No experience" value={data?.noExpCount || 112} sub="39% — need support" />
      </div>

      {/* Certification readiness */}
      <SecHead title="Certification readiness" sub="Students with 5+ Foundation Skills" />
      <Card>
        {certReady.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--border)' }}>
            <div>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{c.c}</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 6 }}>({c.d})</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c.r} ready</span>
          </div>
        ))}
        <p style={{ fontSize: 12, color: 'var(--text-info)', margin: '8px 0 0' }}>
          Consider group study circles or campus certification sessions.
        </p>
      </Card>

      {/* Students needing attention */}
      <SecHead title="Students needing attention" sub="Red engagement" />
      <Card>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '0.5px solid var(--border)' }}>
              {['Name', 'Direction', 'Foundation', 'Last active'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-secondary)', fontWeight: 500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {redStudents.map((s, i) => (
              <tr key={i} style={{ borderBottom: '0.5px solid var(--border)' }}>
                <td style={{ padding: 8, color: 'var(--text-info)', cursor: 'pointer' }}>{s.n}</td>
                <td style={{ padding: 8, color: 'var(--text-primary)' }}>{s.d}</td>
                <td style={{ padding: 8, color: 'var(--text-primary)' }}>{s.f}</td>
                <td style={{ padding: 8, color: 'var(--text-danger)' }}>{s.l}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '8px 0 0' }}>
          5 of 45 Red students shown. Engagement indicators identify students needing support.
        </p>
      </Card>

      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '8px 0', fontStyle: 'italic' }}>
        All data filtered to {college} only. PO cannot see other colleges.
      </p>
    </div>
  );
}
