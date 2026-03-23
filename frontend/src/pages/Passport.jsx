import React, { useEffect, useState } from 'react';

const font = { fontFamily: 'var(--font-sans)' };

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

export default function Passport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const id = localStorage.getItem('smaart_analysis_id');
        if (id) {
          const res = await fetch(`/api/dashboard/${id}`);
          const json = await res.json();
          if (json.success && json.data) {
            setData(json.data.output_data || json.data.analysis || json.data);
            setLoading(false); return;
          }
        }
        const fb = localStorage.getItem('smaart_last_analysis');
        if (fb) { setData(JSON.parse(fb)); setLoading(false); return; }
        setLoading(false);
      } catch {
        const fb = localStorage.getItem('smaart_last_analysis');
        if (fb) { setData(JSON.parse(fb)); setLoading(false); return; }
        setLoading(false);
      }
    })();
  }, []);

  const handlePrint = () => window.print();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', ...font }}>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading your career passport…</p>
    </div>
  );

  /* derive data */
  const pv = (data && data.preVerified) || {};
  const sg = pv.primarySkillGap || {};
  const matched = sg.matched || [];
  const missing = sg.missing || [];
  const coveragePct = sg.coveragePct || 0;
  const totalSkills = matched.length + missing.length;

  const name = data?.input_user_data?.personalDetails?.name
    || data?.personalDetails?.name || 'Student';
  const degree = data?.input_user_data?.education?.[0]?.degreeGroup
    || localStorage.getItem('smaart_degree') || 'Degree';
  const primaryRole = data?.input_user_data?.preferences?.primary?.jobRole
    || data?.preferences?.primary?.jobRole || 'Target Role';
  const zone = pv.primaryZone?.employer_zone || 'Amber';
  const prepTime = zone === 'Green' ? '1-2 months' : zone === 'Amber' ? '3-5 months' : '6+ months';

  const zoneColors = {
    Green: { bg: 'var(--bg-success)', fg: 'var(--text-success)' },
    Amber: { bg: 'var(--bg-warning)', fg: 'var(--text-warning)' },
    Red:   { bg: 'var(--bg-danger)',  fg: 'var(--text-danger)' },
  };
  const { bg: zoneBg, fg: zoneFg } = zoneColors[zone] || zoneColors.Amber;

  const roadmap = data?.combined_tab4?.learning_roadmap || [];

  const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ maxWidth: 680, ...font }}>
      {/* Action buttons */}
      <div className="print:hidden" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        <button
          onClick={handleShare}
          style={{ padding: '6px 14px', fontSize: 13, border: '0.5px solid var(--border)', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          {copied ? '✓ Link copied!' : 'Share'}
        </button>
        <button
          onClick={handlePrint}
          style={{ padding: '6px 16px', fontSize: 13, border: 'none', borderRadius: 8, background: 'var(--bg-info)', color: 'var(--text-info)', cursor: 'pointer', fontWeight: 500 }}
        >
          Download as PDF
        </button>
      </div>

      {/* Passport card */}
      <Card>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 12, borderBottom: '0.5px solid var(--border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-info)', border: '1px solid var(--border-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-info)' }}>S</div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>SMAART Career Passport</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 500, margin: '0 0 2px', color: 'var(--text-primary)' }}>{name}</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{degree}</p>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, textAlign: 'right' }}>Generated {date}</p>
        </div>

        {/* Zone section */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Primary target role</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>{primaryRole}</p>
            <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 8, background: zoneBg, color: zoneFg, fontSize: 12, fontWeight: 500 }}>{zone}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
            <span>Skill coverage</span>
            <span>{coveragePct}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${coveragePct}%`, background: '#1D9E75', borderRadius: 3 }} />
          </div>
        </div>

        {/* Skills section */}
        {matched.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 8px', color: 'var(--text-primary)' }}>
              Verified Skills —{' '}
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-secondary)' }}>
                {matched.length} of {totalSkills} required skills
              </span>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {matched.map((sk, i) => (
                <span key={i} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 8, background: 'var(--bg-success)', color: 'var(--text-success)', fontSize: 12, fontWeight: 500 }}>
                  {sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Readiness section */}
        <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 2px' }}>Career Readiness Score</p>
              <p style={{ fontSize: 28, fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>{coveragePct}<span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>%</span></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 2px' }}>Estimated time to job-ready</p>
              <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: 'var(--text-primary)' }}>{prepTime}</p>
            </div>
          </div>
        </div>

        {/* Roadmap */}
        {roadmap.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 8px', color: 'var(--text-primary)' }}>Learning Roadmap</p>
            {roadmap.map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--bg-info)', color: 'var(--text-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>{i + 1}</div>
                <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{step.step || step.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 2px' }}>Generated by SMAART Career Intelligence Platform · smaart.careers</p>
          <p style={{ fontSize: 10, color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
            This is a self-reported competency profile. Results are guidance, not a guarantee of employment outcomes.
          </p>
        </div>
      </Card>
    </div>
  );
}
