import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, AlertTriangle, Shield, BarChart3, Users, Briefcase, Sparkles, ChevronDown, ChevronUp, ExternalLink, Newspaper, Globe, Zap, ArrowUpRight, Radio, Activity, Target, Layers, Bookmark, BookmarkCheck, RefreshCw } from 'lucide-react';
import axios from 'axios';

const YEAR = new Date().getFullYear();

/* ═══ Premium Design Tokens ═══ */
const cs = {
  card: { background: 'var(--bg-primary)', backdropFilter: 'blur(24px)', border: '0.5px solid rgba(72,72,71,0.10)', borderRadius: 18, padding: '22px 26px', marginBottom: 14, transition: 'box-shadow 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.02)' },
  badge: (bg, fg) => ({ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 20, background: bg, color: fg, fontSize: 10.5, fontWeight: 600, whiteSpace: 'nowrap' }),
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 8px', borderBottom: '0.5px solid rgba(72,72,71,0.05)', transition: 'background 0.2s', borderRadius: 8, margin: '0 -8px' },
  iconWrap: (bg) => ({ width: 34, height: 34, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
};

/* ── Animated Counter ── */
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return; let s = 0; const step = value / (duration / 16);
    const t = setInterval(() => { s += step; if (s >= value) { setDisplay(value); clearInterval(t); } else setDisplay(Math.floor(s)); }, 16);
    return () => clearInterval(t);
  }, [value, duration]);
  return <span>{display}</span>;
}

/* ── Salary Bar ── */
function SalaryBar({ min, max, maxScale = 50 }) {
  const pct = Math.min((max / maxScale) * 100, 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 140 }}>
      <div style={{ height: 7, flex: 1, background: 'rgba(128,128,128,0.06)', borderRadius: 20, overflow: 'hidden', maxWidth: 90 }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #85adff, #9bffce)', borderRadius: 20, boxShadow: '0 0 6px rgba(133,173,255,0.25)' }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700, whiteSpace: 'nowrap', fontFamily: "'Manrope', sans-serif" }}>
        {min && max ? `₹${min}–${max}L` : max ? `up to ₹${max}L` : ''}
      </span>
    </div>
  );
}

/* ── Role Row ── */
function RoleRow({ name, salMin, salMax, badge, badgeBg, badgeFg, index }) {
  return (
    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03, duration: 0.2 }}
      style={{ ...cs.row, cursor: 'default' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(133,173,255,0.03)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{name}</span>
      <SalaryBar min={salMin} max={salMax} />
      <span style={{ ...cs.badge(badgeBg, badgeFg), marginLeft: 12 }}>{badge}</span>
    </motion.div>
  );
}

/* ── Mini Bar Chart ── */
function MiniBarChart({ data, color, maxVal }) {
  const mx = maxVal || Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', width: 90, textAlign: 'right', flexShrink: 0, fontWeight: 500 }}>{d.label}</span>
          <div style={{ flex: 1, height: 22, background: 'rgba(128,128,128,0.05)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${(d.value / mx) * 100}%` }} transition={{ delay: 0.3 + i * 0.06, duration: 0.5 }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${color}cc, ${color}66)`, borderRadius: 6 }} />
            <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 700, color: 'var(--text-primary)' }}>{d.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Donut Chart ── */
function DonutChart({ segments, size = 130 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let cumAngle = -90; const radius = 46, cx = size / 2, cy = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => {
        const angle = (seg.value / total) * 360; const startAngle = cumAngle; cumAngle += angle;
        const s = (startAngle * Math.PI) / 180, e = (cumAngle * Math.PI) / 180;
        return <motion.path key={i} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ delay: 0.4 + i * 0.12, duration: 0.5 }}
          d={`M${cx + radius * Math.cos(s)},${cy + radius * Math.sin(s)} A${radius},${radius} 0 ${angle > 180 ? 1 : 0},1 ${cx + radius * Math.cos(e)},${cy + radius * Math.sin(e)}`}
          fill="none" stroke={seg.color} strokeWidth={15} strokeLinecap="round" />;
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontSize: 18, fontWeight: 800, fill: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 9, fill: 'var(--text-secondary)', fontWeight: 500 }}>ROLES</text>
    </svg>
  );
}

/* ── Section Header ── */
function SH({ icon, iconBg, title, badge, badgeBg, badgeFg, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 12px' }}>
      <div style={cs.iconWrap(iconBg)}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif", letterSpacing: '-0.01em' }}>{title}</span>
          <span style={cs.badge(badgeBg, badgeFg)}>{badge}</span>
        </div>
        {count !== undefined && <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500 }}>{count} roles analyzed</span>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   NEWS & TREND DATA
   ── Fetched via /api/career-news (Groq AI per user interest)
   ── Falls back to curated static news if API fails
══════════════════════════════════════════════════════════════════ */
const STATIC_NEWS = [
  { source: 'LinkedIn', icon: '💼', title: 'AI & ML roles grew 48% in India this quarter — demand outpaces supply', url: 'https://linkedin.com/feed/', tag: 'AI Hiring', tagColor: '#1D9E75' },
  { source: 'India Today', icon: '🇮🇳', title: 'IT layoffs impact 15,000+ in Q1 2026: Upskilling is the only defence', url: 'https://www.indiatoday.in/technology', tag: 'Layoffs', tagColor: '#A32D2D' },
  { source: 'The Hindu', icon: '📰', title: 'Govt launches National Skill Mission 2.0 with ₹5000 Cr for freshers', url: 'https://www.thehindu.com/education/', tag: 'Policy', tagColor: '#185FA5' },
  { source: 'X (Twitter)', icon: '𝕏', title: 'Tech CEOs predict 60% of entry-level coding to be AI-assisted by 2027', url: 'https://x.com/search?q=tech+jobs+india', tag: 'AI Impact', tagColor: '#BA7517' },
  { source: 'Economic Times', icon: '📊', title: 'Non-IT sectors — Healthcare and Green Energy — see 35% hiring surge', url: 'https://economictimes.indiatimes.com/jobs', tag: 'Emerging', tagColor: '#1D9E75' },
  { source: 'Naukri', icon: '🔍', title: 'Data Science, DevOps, Cloud remain top 3 most-searched skills on Naukri', url: 'https://www.naukri.com/career-advice', tag: 'Skills', tagColor: '#85adff' },
];

const LAYOFF_DATA = [
  { company: 'Major IT MNCs', affected: '~15,000', reason: 'AI automation replacing repetitive testing, support & BPO tasks', skills: 'Cloud Architecture, MLOps, Prompt Engineering', action: 'Transition from manual testing to AI-augmented QA and DevOps roles' },
  { company: 'Fintech Startups', affected: '~3,500', reason: 'Funding winter & cost-cutting via process automation', skills: 'Full Stack Development, Data Engineering, Analytics', action: 'Build portfolio demonstrating end-to-end delivery & product thinking' },
  { company: 'E-commerce Cos', affected: '~2,000', reason: 'Consolidation of operations via AI-powered logistics', skills: 'Supply Chain ML, Predictive Analytics, Automation', action: 'Upskill in predictive inventory systems and operations research' },
];

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function MarketInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({ topDemand: true, highestPaying: true, highAiRisk: true, futureSafe: true });
  const [activeTab, setActiveTab] = useState('overview');
  const [news, setNews] = useState(STATIC_NEWS);
  const [newsLoading, setNewsLoading] = useState(false);
  const [savedNews, setSavedNews] = useState(() => JSON.parse(localStorage.getItem('smaart_saved_news') || '[]'));

  const toggle = (k) => setExpanded(p => ({ ...p, [k]: !p[k] }));

  /* Fetch market data */
  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get('/api/market-insights')
      .then(res => {
        const d = res.data.data || res.data;
        setData({ totalRoles: d.totalRoles || 0, topDemand: d.topDemand || [], highestPaying: d.highestPaying || d.topPaying || [], highAiRisk: d.highAiRisk || d.highRisk || [], futureSafe: d.futureSafe || d.lowRisk || [] });
      })
      .catch(() => {
        setData({
          totalRoles: 254,
          topDemand: [
            { role: 'Full Stack Engineer', salary_min_lpa: 6, salary_max_lpa: 15, demand_level: 'High' },
            { role: 'Data Scientist', salary_min_lpa: 8, salary_max_lpa: 18, demand_level: 'High' },
            { role: 'Cloud Solutions Architect', salary_min_lpa: 12, salary_max_lpa: 30, demand_level: 'High' },
            { role: 'DevOps Engineer', salary_min_lpa: 8, salary_max_lpa: 20, demand_level: 'High' },
            { role: 'AI/ML Engineer', salary_min_lpa: 10, salary_max_lpa: 30, demand_level: 'High' },
          ],
          highestPaying: [
            { role: 'Chief AI Officer', salary_min_lpa: 15, salary_max_lpa: 50, demand_level: 'High' },
            { role: 'VP of Product', salary_min_lpa: 20, salary_max_lpa: 50, demand_level: 'High' },
            { role: 'CTO', salary_min_lpa: 20, salary_max_lpa: 40, demand_level: 'High' },
            { role: 'ML Architect', salary_min_lpa: 15, salary_max_lpa: 35, demand_level: 'High' },
          ],
          highAiRisk: [
            { role: 'Manual QA Tester', salary_min_lpa: 3, salary_max_lpa: 6 },
            { role: 'Data Entry Specialist', salary_min_lpa: 2, salary_max_lpa: 4 },
            { role: 'Basic Customer Support', salary_min_lpa: 2, salary_max_lpa: 5 },
          ],
          futureSafe: [
            { role: 'AI Ethics Officer', salary_min_lpa: 12, salary_max_lpa: 25 },
            { role: 'HR Director', salary_min_lpa: 15, salary_max_lpa: 28 },
            { role: 'Cybersecurity Architect', salary_min_lpa: 15, salary_max_lpa: 35 },
          ]
        });
      })
      .finally(() => setLoading(false));
  }, []);

  /* Fetch personalized news from backend (Groq-powered) */
  const fetchPersonalizedNews = async () => {
    setNewsLoading(true);
    const interest = localStorage.getItem('smaart_interest') || 'technology';
    try {
      const token = localStorage.getItem('smaart_token');
      const res = await axios.post('/api/career-news', { interest }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (res.data?.news?.length) setNews(res.data.news);
    } catch { /* keep static news */ }
    setNewsLoading(false);
  };

  /* Load personalized news on mount */
  useEffect(() => { fetchPersonalizedNews(); }, []);

  /* Save news item for training data */
  const saveNewsItem = (item) => {
    const entry = { ...item, savedAt: new Date().toISOString(), userInterest: localStorage.getItem('smaart_interest') || 'general' };
    const updated = [...savedNews, entry];
    setSavedNews(updated);
    localStorage.setItem('smaart_saved_news', JSON.stringify(updated));
    // Also send to backend for training data collection
    const token = localStorage.getItem('smaart_token');
    axios.post('/api/save-news-training', entry, { headers: token ? { Authorization: `Bearer ${token}` } : {} }).catch(() => {});
  };
  const isNewsSaved = (title) => savedNews.some(n => n.title === title);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', fontFamily: "'Inter', var(--font-sans)" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ padding: '14px 28px', background: 'var(--bg-secondary)', borderRadius: 20, color: 'var(--text-secondary)', fontSize: 13, border: '0.5px solid rgba(72,72,71,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 16, height: 16, border: '2px solid rgba(72,72,71,0.08)', borderTopColor: 'var(--text-info)', borderRadius: '50%' }} />
        Loading market intelligence...
      </motion.div>
    </div>
  );
  if (!data) return null;

  const getName = (r) => r.jobRole || r.role || r.name || 'Unknown';
  const demandChart = (data.topDemand || []).slice(0, 6).map(r => ({ label: getName(r).split(' ').slice(0, 2).join(' '), value: r.salary_max_lpa || 10 }));
  const riskDist = [
    { label: 'Future Safe', value: data.futureSafe?.length || 0, color: '#1D9E75' },
    { label: 'High Demand', value: data.topDemand?.length || 0, color: '#85adff' },
    { label: 'AI Risk', value: data.highAiRisk?.length || 0, color: '#ff716c' },
    { label: 'Top Paying', value: data.highestPaying?.length || 0, color: '#BA7517' },
  ];

  return (
    <div style={{ width: '100%', padding: '24px 48px 48px', fontFamily: "'Inter', var(--font-sans)" }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* ═══ HERO HEADER — FULL WIDTH ═══ */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -80, left: '30%', width: 400, height: 250, background: 'radial-gradient(circle, rgba(133,173,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(40px)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(133,173,255,0.1), rgba(29,158,117,0.06))', border: '0.5px solid rgba(133,173,255,0.15)', marginBottom: 12, fontSize: 11, fontWeight: 700, color: 'var(--text-info)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <Radio size={12} /> Live Intelligence
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', fontFamily: "'Manrope', sans-serif", letterSpacing: '-0.03em' }}>
              India Job Market Intelligence {YEAR}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
              Real-time data across <strong style={{ color: 'var(--text-info)', fontWeight: 700 }}><AnimatedNumber value={data.totalRoles || 0} /></strong> career roles · Updated daily
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={fetchPersonalizedNews} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'var(--bg-secondary)', border: '0.5px solid rgba(72,72,71,0.08)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
              <RefreshCw size={13} /> Refresh News
            </button>
          </div>
        </motion.div>

        {/* ═══ STATS BANNER — FULL WIDTH ═══ */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ ...cs.card, background: 'linear-gradient(135deg, rgba(133,173,255,0.05) 0%, rgba(155,255,206,0.03) 100%)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, textAlign: 'center', padding: '20px 28px' }}>
          {[
            { n: data.topDemand?.length || 0, l: 'High Demand', c: 'var(--text-success)', icon: <TrendingUp size={15} /> },
            { n: data.highestPaying?.length || 0, l: 'Top Paying', c: 'var(--text-info)', icon: <DollarSign size={15} /> },
            { n: data.highAiRisk?.length || 0, l: 'AI Risk', c: 'var(--text-danger)', icon: <AlertTriangle size={15} /> },
            { n: data.futureSafe?.length || 0, l: 'Future Safe', c: 'var(--text-success)', icon: <Shield size={15} /> },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ color: s.c, marginBottom: 4, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <p style={{ fontSize: 26, fontWeight: 800, margin: 0, color: s.c, fontFamily: "'Manrope', sans-serif" }}><AnimatedNumber value={s.n} duration={800} /></p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '3px 0 0', fontWeight: 500 }}>{s.l}</p>
            </div>
          ))}
        </motion.div>

        {/* ═══ TABS ═══ */}
        <div style={{ display: 'flex', gap: 6, margin: '20px 0', padding: 4, background: 'var(--bg-secondary)', borderRadius: 14, border: '0.5px solid rgba(72,72,71,0.04)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: <Layers size={13} /> },
            { id: 'charts', label: 'Charts & Data', icon: <BarChart3 size={13} /> },
            { id: 'news', label: 'Industry Pulse', icon: <Newspaper size={13} /> },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ padding: '10px 18px', border: 'none', borderRadius: 10, background: activeTab === t.id ? 'var(--bg-primary)' : 'transparent', boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: activeTab === t.id ? 600 : 400, color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', flex: 1, justifyContent: 'center' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>

            {/* ═══ TAB: OVERVIEW ═══ */}
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* LEFT column */}
                <div>
                  <SH icon={<TrendingUp size={16} color="#9bffce" />} iconBg="rgba(29,158,117,0.08)" title="Top Demand Roles" badge="Hot" badgeBg="rgba(29,158,117,0.08)" badgeFg="var(--text-success)" count={data.topDemand?.length} />
                  <div style={cs.card}>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 6px' }}>Roles with highest demand across Indian employers right now</p>
                    {expanded.topDemand && (data.topDemand || []).map((r, i) => (
                      <RoleRow key={i} index={i} name={getName(r)} salMin={r.salary_min_lpa} salMax={r.salary_max_lpa} badge={r.demand_level || 'High'} badgeBg="rgba(29,158,117,0.08)" badgeFg="var(--text-success)" />
                    ))}
                    {(data.topDemand?.length || 0) > 3 && (
                      <button onClick={() => toggle('topDemand')} style={{ background: 'none', border: 'none', color: 'var(--text-info)', fontSize: 12, cursor: 'pointer', padding: '6px 0 0', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                        {expanded.topDemand ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> Show all {data.topDemand.length}</>}
                      </button>
                    )}
                  </div>

                  <SH icon={<AlertTriangle size={16} color="#ff716c" />} iconBg="rgba(163,45,45,0.08)" title="AI Automation Risk" badge="⚠ Caution" badgeBg="rgba(163,45,45,0.08)" badgeFg="var(--text-danger)" count={data.highAiRisk?.length} />
                  <div style={cs.card}>
                    <p style={{ fontSize: 12, color: 'var(--text-danger)', margin: '0 0 8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}><AlertTriangle size={12} /> Significant automation pressure in 3–5 years</p>
                    {(data.highAiRisk || []).map((r, i) => (
                      <RoleRow key={i} index={i} name={getName(r)} salMin={r.salary_min_lpa} salMax={r.salary_max_lpa} badge="High Risk" badgeBg="rgba(163,45,45,0.08)" badgeFg="var(--text-danger)" />
                    ))}
                  </div>
                </div>

                {/* RIGHT column */}
                <div>
                  <SH icon={<DollarSign size={16} color="#85adff" />} iconBg="rgba(133,173,255,0.08)" title="Highest Paying" badge="Lucrative" badgeBg="rgba(133,173,255,0.08)" badgeFg="var(--text-info)" count={data.highestPaying?.length} />
                  <div style={cs.card}>
                    {(data.highestPaying || []).map((r, i) => (
                      <RoleRow key={i} index={i} name={getName(r)} salMin={r.salary_min_lpa} salMax={r.salary_max_lpa} badge={r.demand_level || 'High'} badgeBg="rgba(133,173,255,0.08)" badgeFg="var(--text-info)" />
                    ))}
                  </div>

                  <SH icon={<Shield size={16} color="#9bffce" />} iconBg="rgba(29,158,117,0.08)" title="Future-Safe Careers" badge="Low Risk" badgeBg="rgba(29,158,117,0.08)" badgeFg="var(--text-success)" count={data.futureSafe?.length} />
                  <div style={cs.card}>
                    <p style={{ fontSize: 12, color: 'var(--text-success)', margin: '0 0 8px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}><Shield size={12} /> Low AI risk — human skills essential</p>
                    {(data.futureSafe || []).map((r, i) => (
                      <RoleRow key={i} index={i} name={getName(r)} salMin={r.salary_min_lpa} salMax={r.salary_max_lpa} badge="Low Risk" badgeBg="rgba(29,158,117,0.08)" badgeFg="var(--text-success)" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ TAB: CHARTS ═══ */}
            {activeTab === 'charts' && (
              <div>
                {/* Top row: 2 charts side by side */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div style={cs.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <div style={cs.iconWrap('rgba(133,173,255,0.08)')}><BarChart3 size={16} color="#85adff" /></div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>Salary Comparison</p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Max salary (₹ LPA) by top demand role</p>
                      </div>
                    </div>
                    <MiniBarChart data={demandChart} color="#85adff" />
                  </div>
                  <div style={cs.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <div style={cs.iconWrap('rgba(29,158,117,0.08)')}><Activity size={16} color="#1D9E75" /></div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>Role Distribution</p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>By market risk category</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                      <DonutChart segments={riskDist} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {riskDist.map((s, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label} ({s.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Impact + Salary Trend — 2 columns */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={cs.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <div style={cs.iconWrap('rgba(186,117,23,0.08)')}><Zap size={16} color="#BA7517" /></div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>AI Impact Analysis</p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>How AI reshapes job categories</p>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {[
                        { label: 'Safe from AI', pct: 45, color: '#1D9E75', desc: 'Creative, strategic, leadership' },
                        { label: 'AI-Augmented', pct: 35, color: '#BA7517', desc: 'Enhanced by AI, still needs humans' },
                        { label: 'At Risk', pct: 20, color: '#A32D2D', desc: 'Repetitive, rule-based tasks' },
                      ].map((a, i) => (
                        <div key={i} style={{ padding: 14, borderRadius: 12, background: `${a.color}08`, border: `0.5px solid ${a.color}15`, textAlign: 'center' }}>
                          <p style={{ fontSize: 26, fontWeight: 800, margin: '0 0 2px', color: a.color, fontFamily: "'Manrope', sans-serif" }}>{a.pct}%</p>
                          <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 3px', color: 'var(--text-primary)' }}>{a.label}</p>
                          <p style={{ fontSize: 10.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{a.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={cs.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <div style={cs.iconWrap('rgba(133,173,255,0.08)')}><TrendingUp size={16} color="#85adff" /></div>
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>Salary by Seniority</p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Average ₹ LPA across tech roles</p>
                      </div>
                    </div>
                    <MiniBarChart data={[
                      { label: 'Fresher', value: 4 }, { label: 'Junior (1-3y)', value: 8 },
                      { label: 'Mid (3-6y)', value: 15 }, { label: 'Senior (6-10y)', value: 25 },
                      { label: 'Lead/Architect', value: 35 }, { label: 'Director+', value: 50 },
                    ]} color="#85adff" maxVal={55} />
                  </div>
                </div>
              </div>
            )}

            {/* ═══ TAB: INDUSTRY PULSE ═══ */}
            {activeTab === 'news' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* LEFT — News Feed */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 14px' }}>
                    <div style={cs.iconWrap('rgba(133,173,255,0.08)')}><Newspaper size={16} color="#85adff" /></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>
                        Industry News {newsLoading && <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-info)', marginLeft: 8 }}>Updating...</motion.span>}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Personalized by your career interest · Save items for future training data</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {news.map((n, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ ...cs.card, marginBottom: 0, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <span style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{n.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{n.source}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: `${n.tagColor}14`, color: n.tagColor }}>{n.tag}</span>
                          </div>
                          <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', lineHeight: 1.45, display: 'block', marginBottom: 6 }}>
                            {n.title}
                          </a>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--text-info)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
                              Read <ArrowUpRight size={11} />
                            </a>
                            <button onClick={() => !isNewsSaved(n.title) && saveNewsItem(n)}
                              style={{ background: 'none', border: 'none', cursor: isNewsSaved(n.title) ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 500, padding: 0, color: isNewsSaved(n.title) ? 'var(--text-success)' : 'var(--text-secondary)' }}>
                              {isNewsSaved(n.title) ? <><BookmarkCheck size={11} /> Saved</> : <><Bookmark size={11} /> Save</>}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Social & Job Boards */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0 12px' }}>
                    <div style={cs.iconWrap('rgba(133,173,255,0.08)')}><Globe size={16} color="#85adff" /></div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>Job Boards & Social</p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Quick links to live job feeds</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      { name: 'LinkedIn', url: 'https://linkedin.com/jobs', icon: '💼' },
                      { name: 'Naukri', url: 'https://naukri.com', icon: '🔍' },
                      { name: 'X (Twitter)', url: 'https://x.com/search?q=tech+layoffs+india', icon: '𝕏' },
                      { name: 'The Hindu', url: 'https://thehindu.com/education/careers', icon: '📰' },
                      { name: 'India Today', url: 'https://indiatoday.in/jobs', icon: '🇮🇳' },
                      { name: 'ET Jobs', url: 'https://economictimes.indiatimes.com/jobs', icon: '📊' },
                    ].map((s, i) => (
                      <motion.a key={i} href={s.url} target="_blank" rel="noopener noreferrer" whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                        style={{ ...cs.card, marginBottom: 0, padding: '12px 14px', textDecoration: 'none', textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                        <span style={{ fontSize: 16 }}>{s.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                        <ExternalLink size={10} color="var(--text-secondary)" />
                      </motion.a>
                    ))}
                  </div>
                </div>

                {/* RIGHT — Layoff Intelligence + Saved */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 14px' }}>
                    <div style={cs.iconWrap('rgba(163,45,45,0.08)')}><AlertTriangle size={16} color="#ff716c" /></div>
                    <div>
                      <p style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>Layoff Intelligence</p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Why layoffs happen & how to protect yourself</p>
                    </div>
                  </div>

                  {LAYOFF_DATA.map((lay, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08 }}
                      style={{ ...cs.card, borderLeft: '3px solid #A32D2D' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{lay.company}</span>
                        <span style={cs.badge('rgba(163,45,45,0.08)', 'var(--text-danger)')}>{lay.affected} affected</span>
                      </div>
                      {[
                        { label: 'Why?', text: lay.reason, bg: 'rgba(163,45,45,0.03)', labelColor: 'var(--text-danger)' },
                        { label: 'Skills to Build', text: lay.skills, bg: 'rgba(186,117,23,0.03)', labelColor: '#BA7517' },
                        { label: 'Action Plan', text: lay.action, bg: 'rgba(29,158,117,0.03)', labelColor: '#1D9E75' },
                      ].map((s, j) => (
                        <div key={j} style={{ padding: '9px 12px', borderRadius: 8, background: s.bg, marginBottom: j < 2 ? 6 : 0 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: s.labelColor, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
                          <p style={{ fontSize: 12.5, color: 'var(--text-primary)', margin: 0, lineHeight: 1.45 }}>{s.text}</p>
                        </div>
                      ))}
                    </motion.div>
                  ))}

                  {/* Saved News for Training */}
                  {savedNews.length > 0 && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '24px 0 12px' }}>
                        <div style={cs.iconWrap('rgba(29,158,117,0.08)')}><BookmarkCheck size={16} color="#1D9E75" /></div>
                        <div>
                          <p style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>Saved for Training Data</p>
                          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>{savedNews.length} items saved · Will be used for future AI model</p>
                        </div>
                      </div>
                      <div style={cs.card}>
                        {savedNews.slice(-5).reverse().map((s, i) => (
                          <div key={i} style={{ padding: '8px 0', borderBottom: i < Math.min(savedNews.length, 5) - 1 ? '0.5px solid rgba(72,72,71,0.04)' : 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BookmarkCheck size={12} color="var(--text-success)" />
                            <span style={{ fontSize: 12, color: 'var(--text-primary)', flex: 1, fontWeight: 500 }}>{s.title?.substring(0, 60)}...</span>
                            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s.userInterest}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* ═══ DISCLAIMER ═══ */}
        <div style={{ textAlign: 'center', padding: '24px 0 0', marginTop: 16, borderTop: '0.5px solid rgba(72,72,71,0.04)' }}>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 2px' }}>
            Salary data estimated for Indian market {YEAR}. Actuals vary by company, location & experience.
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
            News is AI-generated via Groq API based on your career interest. Saved items stored locally + backend for future model training.
          </p>
        </div>

      </div>
    </div>
  );
}
