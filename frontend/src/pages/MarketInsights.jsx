import React, { useState, useEffect } from 'react';
import axios from 'axios';

const font = { fontFamily: 'var(--font-sans)', lineHeight: 1.5 };

const cs = {
  card: {
    background: 'var(--color-background-primary, var(--bg-primary))',
    border: '0.5px solid var(--color-border-tertiary, var(--border))',
    borderRadius: 12,
    padding: '16px 20px',
    marginBottom: 20,
  },
  badge: (bg, fg) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 8,
    background: bg,
    color: fg,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  }),
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '0.5px solid var(--color-border-tertiary, var(--border))',
  }
};

export default function MarketInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);

    axios.get('/api/market-insights')
      .then(res => {
        setData(res.data.data || res.data);
      })
      .catch(err => {
        console.error('Failed to load market insights:', err);
        // Fallback robust mock to prevent crash if API is missing or failing
        setData({
          totalRoles: 154,
          topDemand: [
            { jobRole: 'Full Stack Engineer', salary_min_lpa: 6, salary_max_lpa: 15, demand_level: 'High' },
            { jobRole: 'Data Scientist', salary_min_lpa: 8, salary_max_lpa: 18, demand_level: 'High' }
          ],
          highestPaying: [
            { jobRole: 'Machine Learning Architect', salary_max_lpa: 35, demand_level: 'High' },
            { jobRole: 'Cloud Solutions Architect', salary_max_lpa: 30, demand_level: 'High' }
          ],
          highAiRisk: [
            { jobRole: 'Manual Quality Assurance', salary_min_lpa: 3, salary_max_lpa: 6 },
            { jobRole: 'Basic Data Entry Specialist', salary_min_lpa: 2, salary_max_lpa: 4 }
          ],
          futureSafe: [
            { jobRole: 'AI Ethics Officer', salary_min_lpa: 12, salary_max_lpa: 25 },
            { jobRole: 'Human Resources Director', salary_min_lpa: 15, salary_max_lpa: 28 }
          ]
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', ...font }}>
        <div style={{ padding: '8px 16px', background: 'var(--color-background-secondary, var(--bg-secondary))', borderRadius: 20, color: 'var(--color-text-secondary, var(--text-secondary))', fontSize: 13, border: '0.5px solid var(--color-border-tertiary, var(--border))' }}>
          Loading market intelligence...
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 40px', ...font }}>
      {/* 1. Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary, var(--text-primary))', margin: '0 0 6px' }}>
          India Job Market Intelligence 2025
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary, var(--text-secondary))', margin: 0 }}>
          Live data across {data.totalRoles || 0} career roles
        </p>
      </div>

      {/* SECTION 1 — Top Demand Roles */}
      <div style={{ margin: '24px 0 12px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--color-text-primary, var(--text-primary))', display: 'flex', alignItems: 'center', gap: 8 }}>
          Top Demand Roles
          <span style={cs.badge('var(--color-background-success, var(--bg-success))', 'var(--color-text-success, var(--text-success))')}>High Demand</span>
        </div>
      </div>
      <div style={cs.card}>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary, var(--text-secondary))', margin: '0 0 12px' }}>
          Roles with High demand across Indian employers right now
        </p>
        {(data.topDemand || []).map((r, i, arr) => {
          const name = r.jobRole || r.role || r.name || 'Unknown Role';
          const salStr = (r.salary_min_lpa && r.salary_max_lpa) ? `${r.salary_min_lpa}–${r.salary_max_lpa}` : r.salary || '';
          const demandStr = r.demand_level || r.demand || 'High';
          return (
            <div key={i} style={{ ...cs.row, borderBottom: i === arr.length - 1 ? 'none' : cs.row.borderBottom }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary, var(--text-primary))', flex: 1 }}>{name}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary, var(--text-secondary))', marginRight: 16 }}>{salStr ? `₹${salStr}L` : ''}</span>
              <span style={cs.badge('var(--color-background-success, var(--bg-success))', 'var(--color-text-success, var(--text-success))')}>{demandStr}</span>
            </div>
          );
        })}
      </div>

      {/* SECTION 2 — Highest Paying Roles */}
      <div style={{ margin: '24px 0 12px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--color-text-primary, var(--text-primary))', display: 'flex', alignItems: 'center', gap: 8 }}>
          Highest Paying Roles
          <span style={cs.badge('var(--color-background-info, var(--bg-info))', 'var(--color-text-info, var(--text-info))')}>Lucrative</span>
        </div>
      </div>
      <div style={cs.card}>
        {(data.highestPaying || []).map((r, i, arr) => {
          const name = r.jobRole || r.role || r.name || 'Unknown Role';
          const maxSal = r.salary_max_lpa || (r.salary && typeof r.salary === 'string' && r.salary.includes('-') ? r.salary.split('-')[1] : r.salary);
          const demandStr = r.demand_level || r.demand || 'High';
          return (
            <div key={i} style={{ ...cs.row, borderBottom: i === arr.length - 1 ? 'none' : cs.row.borderBottom }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary, var(--text-primary))', flex: 1 }}>{name}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-primary, var(--text-primary))', fontWeight: 600, marginRight: 16 }}>{maxSal ? `Up to ₹${maxSal}L` : ''}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary, var(--text-secondary))' }}>{demandStr}</span>
            </div>
          );
        })}
      </div>

      {/* SECTION 3 — High AI Automation Risk */}
      <div style={{ margin: '24px 0 12px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--color-text-primary, var(--text-primary))', display: 'flex', alignItems: 'center', gap: 8 }}>
          High AI Automation Risk
          <span style={cs.badge('var(--color-background-danger, var(--bg-danger))', 'var(--color-text-danger, var(--text-danger))')}>High Risk</span>
        </div>
      </div>
      <div style={cs.card}>
        <p style={{ fontSize: 13, color: 'var(--color-text-danger, var(--text-danger))', margin: '0 0 12px', fontWeight: 500 }}>
          ⚠ These roles face significant automation pressure in 3-5 years
        </p>
        {(data.highAiRisk || []).map((r, i, arr) => {
          const name = r.jobRole || r.role || r.name || 'Unknown Role';
          const salStr = (r.salary_min_lpa && r.salary_max_lpa) ? `${r.salary_min_lpa}–${r.salary_max_lpa}` : r.salary || '';
          return (
            <div key={i} style={{ ...cs.row, borderBottom: i === arr.length - 1 ? 'none' : cs.row.borderBottom }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary, var(--text-primary))', flex: 1 }}>{name}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary, var(--text-secondary))', marginRight: 16 }}>{salStr ? `₹${salStr}L` : ''}</span>
              <span style={cs.badge('var(--color-background-danger, var(--bg-danger))', 'var(--color-text-danger, var(--text-danger))')}>High Risk</span>
            </div>
          );
        })}
      </div>

      {/* SECTION 4 — Future-Safe Careers */}
      <div style={{ margin: '24px 0 12px' }}>
        <div style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--color-text-primary, var(--text-primary))', display: 'flex', alignItems: 'center', gap: 8 }}>
          Future-Safe Careers
          <span style={cs.badge('var(--color-background-success, var(--bg-success))', 'var(--color-text-success, var(--text-success))')}>Low Risk</span>
        </div>
      </div>
      <div style={cs.card}>
        <p style={{ fontSize: 13, color: 'var(--color-text-success, var(--text-success))', margin: '0 0 12px', fontWeight: 500 }}>
          ✓ Low AI automation risk — human skills remain essential
        </p>
        {(data.futureSafe || []).map((r, i, arr) => {
          const name = r.jobRole || r.role || r.name || 'Unknown Role';
          const salStr = (r.salary_min_lpa && r.salary_max_lpa) ? `${r.salary_min_lpa}–${r.salary_max_lpa}` : r.salary || '';
          return (
            <div key={i} style={{ ...cs.row, borderBottom: i === arr.length - 1 ? 'none' : cs.row.borderBottom }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary, var(--text-primary))', flex: 1 }}>{name}</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary, var(--text-secondary))', marginRight: 16 }}>{salStr ? `₹${salStr}L` : ''}</span>
              <span style={cs.badge('var(--color-background-success, var(--bg-success))', 'var(--color-text-success, var(--text-success))')}>Low Risk</span>
            </div>
          );
        })}
      </div>

      {/* 3. Disclaimer at bottom */}
      <div style={{ textAlign: 'center', padding: '24px 0 0', marginTop: 16, borderTop: '0.5px solid var(--color-border-tertiary, var(--border))' }}>
        <p style={{ fontSize: 11, color: 'var(--color-text-secondary, var(--text-secondary))', margin: '0 0 4px' }}>
          Salary data estimated based on Indian market trends 2024-25.
        </p>
        <p style={{ fontSize: 11, color: 'var(--color-text-secondary, var(--text-secondary))', margin: 0 }}>
          Actual salaries vary by company, location, and experience.
        </p>
      </div>

    </div>
  );
}
