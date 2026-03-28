import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Building2, Users, Activity, Award, TrendingUp, MapPin,
  DollarSign, Briefcase, ShieldCheck, AlertTriangle,
  ChevronDown, Search, Download, RefreshCw, GraduationCap,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   DESIGN TOKENS — glassmorphism + landing-page alignment
═══════════════════════════════════════════════════════════════════ */
const glass = {
  background: 'rgba(var(--nav-glass-rgb, 255,255,255), 0.06)',
  backdropFilter: 'blur(20px) saturate(1.6)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
  border: '0.5px solid rgba(var(--nav-glass-rgb, 255,255,255), 0.10)',
  borderRadius: 16,
};

const typeTokens = {
  success: { bg: 'var(--bg-success)', fg: 'var(--text-success)', icon: '✓' },
  warning: { bg: 'var(--bg-warning)', fg: 'var(--text-warning)', icon: '⚠' },
  danger: { bg: 'var(--bg-danger)', fg: 'var(--text-danger)', icon: '✗' },
  info: { bg: 'var(--bg-info)', fg: 'var(--text-info)', icon: 'ℹ' },
  secondary: { bg: 'var(--bg-secondary)', fg: 'var(--text-secondary)', icon: '—' },
};
const gapTypeMap = { high: 'danger', moderate: 'warning', slight: 'success' };

const fadeUp = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35 } };
const stagger = (i) => ({ ...fadeUp, transition: { ...fadeUp.transition, delay: 0.04 * i } });

/* ─── Reusable sub-components ─── */
function GlassCard({ children, style, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      style={{ ...glass, padding: '20px 24px', marginBottom: 14, ...style }}>
      {children}
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent, delay }) {
  return (
    <motion.div {...stagger(delay)}
      style={{
        ...glass, padding: '18px 20px', position: 'relative', overflow: 'hidden', minWidth: 0,
      }}>
      {/* Accent orb */}
      <div style={{
        position: 'absolute', top: -16, right: -16, width: 60, height: 60,
        background: `radial-gradient(circle, ${accent || 'rgba(133,173,255,0.15)'} 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: accent ? `${accent}22` : 'var(--bg-info)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon size={15} color={accent || 'var(--text-info)'} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      </div>
      <p style={{
        fontSize: 26, fontWeight: 700, margin: 0, color: 'var(--text-primary)',
        fontFamily: "'Manrope', var(--font-sans)", letterSpacing: '-0.02em'
      }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{sub}</p>}
    </motion.div>
  );
}

function SectionHeader({ icon: Icon, title, sub, delay = 0 }) {
  return (
    <motion.div {...stagger(delay)}
      style={{ margin: '26px 0 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      {Icon && (
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(133,173,255,0.15), rgba(24,95,165,0.08))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '0.5px solid rgba(133,173,255,0.2)'
        }}>
          <Icon size={15} color="var(--text-info)" />
        </div>
      )}
      <div>
        <p style={{
          fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--text-primary)',
          fontFamily: "'Manrope', var(--font-sans)"
        }}>{title}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '1px 0 0' }}>{sub}</p>}
      </div>
    </motion.div>
  );
}

function Bar({ pct, color, height = 7 }) {
  return (
    <div style={{
      height, background: 'rgba(var(--nav-glass-rgb, 255,255,255), 0.08)',
      borderRadius: height / 2, flex: 1, overflow: 'hidden'
    }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ height: '100%', background: color || '#378ADD', borderRadius: height / 2 }} />
    </div>
  );
}

function Badge({ text, type = 'info' }) {
  const t = typeTokens[type] || typeTokens.info;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 20,
      background: t.bg, color: t.fg, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', letterSpacing: '0.01em'
    }}>
      {text}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function PODashboard() {
  const { collegeCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const code = collegeCode || 'DEMO01';
        const res = await axios.get(`/api/po/${code}/dashboard`);
        setData(res.data);
      } catch { /* use mock data */ }
      setLoading(false);
    })();
  }, [collegeCode]);

  /* ── Loading state ── */
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 10 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
        <RefreshCw size={18} color="var(--text-info)" />
      </motion.div>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>Loading placement officer dashboard…</p>
    </div>
  );

  /* ── Mock / Live data ── */
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
    { n: 45, label: '✗ Red (16%)', type: 'danger' },
  ];

  const directions = data?.topDirections || [
    { n: 'Software Development', c: 67, p: 23 },
    { n: 'Corporate Finance', c: 52, p: 18 },
    { n: 'Digital Marketing', c: 41, p: 14 },
    { n: 'Business Operations', c: 38, p: 13 },
    { n: 'Education and Training', c: 29, p: 10 },
  ];

  const locations = data?.locationBreakdown || [
    { p: 'Home City Only', c: 78, w: 27, type: 'danger' },
    { p: 'Home State', c: 45, w: 16, type: 'warning' },
    { p: 'Open to Metros', c: 89, w: 31, type: 'info' },
    { p: 'Anywhere in India', c: 67, w: 23, type: 'success' },
    { p: 'Not specified', c: 11, w: 4, type: 'secondary' },
  ];

  const salaryGaps = data?.salaryExpectationVsMarket || [
    { d: 'Software Dev', ex: '6-8L', mk: '4-7L', g: 'slight' },
    { d: 'Corporate Finance', ex: '6-8L', mk: '2.5-6L', g: 'high' },
    { d: 'Digital Marketing', ex: '4-6L', mk: '2.5-5L', g: 'moderate' },
  ];

  const certReady = data?.certificationReadiness || [
    { c: 'NCFM', r: 15, d: 'Finance' },
    { c: 'Google Analytics', r: 23, d: 'Marketing' },
    { c: 'AWS Cloud Practitioner', r: 12, d: 'Software' },
    { c: 'HubSpot Content Marketing', r: 18, d: 'Marketing' },
  ];

  const redStudents = data?.redStudents || [
    { n: 'Rahul Patil', d: 'Corporate Finance', f: '1 of 8', l: '42 days ago' },
    { n: 'Sneha Deshpande', d: 'Software Dev', f: '0 of 9', l: '38 days ago' },
    { n: 'Aditya Kumar', d: 'Business Ops', f: '2 of 7', l: '35 days ago' },
    { n: 'Meera Joshi', d: 'Education', f: '1 of 8', l: '29 days ago' },
    { n: 'Vikram Singh', d: 'Digital Marketing', f: '0 of 8', l: '27 days ago' },
  ];

  /* ── Filtered students for search ── */
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return redStudents;
    const q = searchQuery.toLowerCase();
    return redStudents.filter(s =>
      s.n.toLowerCase().includes(q) || s.d.toLowerCase().includes(q));
  }, [searchQuery, redStudents]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Ambient gradient orbs — matching landing page */}
      <div style={{
        position: 'fixed', top: -120, left: '10%', width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(24,95,165,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(60px)'
      }} />
      <div style={{
        position: 'fixed', top: 200, right: '5%', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(29,158,117,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(50px)'
      }} />
      <div style={{
        position: 'fixed', bottom: -80, left: '40%', width: 600, height: 300,
        background: 'radial-gradient(circle, rgba(133,173,255,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', filter: 'blur(50px)'
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '20px 24px 60px' }}>

        {/* ── Hero Header ── */}
        <motion.div {...fadeUp} style={{
          ...glass, padding: '28px 32px', marginBottom: 24,
          background: 'linear-gradient(135deg, rgba(15,43,74,0.85) 0%, rgba(27,58,92,0.75) 50%, rgba(26,77,110,0.65) 100%)',
          border: '0.5px solid rgba(133,173,255,0.18)', position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative orb */}
          <div style={{
            position: 'absolute', top: -30, right: -30, width: 140, height: 140,
            background: 'radial-gradient(circle, rgba(29,158,117,0.2) 0%, transparent 70%)', pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', bottom: -20, left: -20, width: 100, height: 100,
            background: 'radial-gradient(circle, rgba(133,173,255,0.15) 0%, transparent 70%)', pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}>
                  <Building2 size={18} color="#9bffce" />
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: 'rgba(255,255,255,0.5)'
                }}>Placement Officer Dashboard</span>
              </div>
              <h1 style={{
                fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: '#fff',
                fontFamily: "'Manrope', var(--font-sans)", letterSpacing: '-0.02em'
              }}>{college}</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{batch}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginTop: 4 }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                style={{
                  padding: '8px 16px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}>
                <Download size={14} /> Export
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 8 }}>
          <StatCard icon={Users} label="Total Students" value={totalStudents} accent="#85adff" delay={0} />
          <StatCard icon={Activity} label="Active (30 days)" value={activeStudents} sub={`${activePct}% engagement`} accent="#1D9E75" delay={1} />
          <StatCard icon={GraduationCap} label="Avg Foundation" value={`${avgCoverage}%`} sub="across all students" accent="#BA7517" delay={2} />
          <StatCard icon={Award} label="5+ Foundation Skills" value={fiveSkills} sub={`${fiveSkillsPct}% of cohort`} accent="#9b59b6" delay={3} />
        </div>

        {/* ── Engagement Distribution ── */}
        <SectionHeader icon={Activity} title="Engagement Distribution" delay={4} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 8 }}>
          {engagement.map((e, i) => {
            const t = typeTokens[e.type] || typeTokens.secondary;
            return (
              <motion.div key={i} {...stagger(i + 5)} style={{
                ...glass, padding: '20px 18px', textAlign: 'center',
                background: `linear-gradient(135deg, ${t.bg}, rgba(var(--nav-glass-rgb),0.04))`,
                border: `0.5px solid ${t.fg}22`,
              }}>
                <p style={{
                  fontSize: 32, fontWeight: 700, margin: 0, color: t.fg,
                  fontFamily: "'Manrope', var(--font-sans)"
                }}>{e.n}</p>
                <p style={{ fontSize: 13, margin: '4px 0 0', color: t.fg, fontWeight: 500 }}>{e.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Direction Distribution ── */}
        <SectionHeader icon={TrendingUp} title="Direction Distribution" sub="Top 5 career directions chosen by students" delay={8} />
        <GlassCard delay={0.3}>
          {directions.map((d, i) => (
            <div key={i} style={{ marginBottom: i < directions.length - 1 ? 14 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{d.n}</span>
                <span style={{
                  fontSize: 14, fontWeight: 700, color: 'var(--text-info)',
                  fontFamily: "'Manrope', var(--font-sans)"
                }}>{d.c}</span>
              </div>
              <Bar pct={d.p * 3} color="linear-gradient(90deg, #378ADD, #85adff)" />
            </div>
          ))}
        </GlassCard>

        {/* ── Location Preference ── */}
        <SectionHeader icon={MapPin} title="Location Preference" delay={9} />
        <GlassCard delay={0.35}>
          {locations.map((l, i) => {
            const t = typeTokens[l.type] || typeTokens.secondary;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < locations.length - 1 ? 10 : 0 }}>
                <span style={{ fontSize: 13, width: 150, color: 'var(--text-primary)', flexShrink: 0 }}>{l.p}</span>
                <Bar pct={l.w * 3} color={t.fg} />
                <span style={{
                  fontSize: 13, fontWeight: 600, width: 40, textAlign: 'right', color: 'var(--text-primary)',
                  fontFamily: "'Manrope', var(--font-sans)"
                }}>{l.c}</span>
              </div>
            );
          })}
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 10,
            background: 'var(--bg-warning)', border: '0.5px solid rgba(186,117,23,0.15)'
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-warning)', margin: 0, fontWeight: 500 }}>
              ⚠ 78 students (27%) prefer Home City Only — consider a session on remote opportunities.
            </p>
          </div>
        </GlassCard>

        {/* ── Salary Expectation vs Market Reality ── */}
        <SectionHeader icon={DollarSign} title="Salary Expectation vs Market Reality" delay={10} />
        <GlassCard delay={0.4}>
          {salaryGaps.map((s, i) => {
            const gType = gapTypeMap[s.g] || 'secondary';
            const t = typeTokens[gType];
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
                borderBottom: i < salaryGaps.length - 1 ? '0.5px solid rgba(var(--nav-glass-rgb), 0.08)' : 'none',
              }}>
                <span style={{ fontSize: 13, width: 140, color: 'var(--text-primary)', flexShrink: 0, fontWeight: 500 }}>{s.d}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <span>Expect: <strong>{s.ex}</strong></span>
                    <span>Market: <strong>{s.mk}</strong></span>
                  </div>
                  <div style={{ display: 'flex', height: 7, borderRadius: 4, overflow: 'hidden', gap: 1 }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: '50%' }}
                      transition={{ duration: 0.5 }}
                      style={{ background: 'var(--text-info)', borderRadius: '4px 0 0 4px' }} />
                    <motion.div initial={{ width: 0 }}
                      animate={{ width: s.g === 'high' ? '50%' : s.g === 'moderate' ? '35%' : '20%' }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      style={{ background: t.fg, borderRadius: '0 4px 4px 0' }} />
                  </div>
                </div>
                <Badge text={`${s.g} gap`} type={gType} />
              </div>
            );
          })}
          <div style={{
            marginTop: 10, padding: '10px 14px', borderRadius: 10,
            background: 'var(--bg-danger)', border: '0.5px solid rgba(163,45,45,0.15)'
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-danger)', margin: 0, fontWeight: 500 }}>
              ⚠ Corporate Finance shows largest gap — organise a salary expectations session.
            </p>
          </div>
        </GlassCard>

        {/* ── Experience Tracking ── */}
        <SectionHeader icon={Briefcase} title="Experience Tracking" delay={11} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 8 }}>
          <StatCard icon={Briefcase} label="Internship Experience" value={data?.internshipCount || 87} sub="30% of cohort" accent="#1D9E75" delay={12} />
          <StatCard icon={Award} label="Completed Projects" value={data?.projectCount || 124} sub="43% of cohort" accent="#378ADD" delay={13} />
          <StatCard icon={AlertTriangle} label="No Experience" value={data?.noExpCount || 112} sub="39% — need support" accent="#e74c3c" delay={14} />
        </div>

        {/* ── Certification Readiness ── */}
        <SectionHeader icon={ShieldCheck} title="Certification Readiness" sub="Students with 5+ Foundation Skills" delay={15} />
        <GlassCard delay={0.5}>
          {certReady.map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '0.5px solid rgba(var(--nav-glass-rgb), 0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-info)' }} />
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{c.c}</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>({c.d})</span>
              </div>
              <Badge text={`${c.r} ready`} type="info" />
            </div>
          ))}
          <div style={{
            marginTop: 10, padding: '10px 14px', borderRadius: 10,
            background: 'var(--bg-info)', border: '0.5px solid rgba(24,95,165,0.12)'
          }}>
            <p style={{ fontSize: 12, color: 'var(--text-info)', margin: 0, fontWeight: 500 }}>
              💡 Consider group study circles or campus certification sessions.
            </p>
          </div>
        </GlassCard>

        {/* ── Students Needing Attention ── */}
        <SectionHeader icon={AlertTriangle} title="Students Needing Attention" sub="Red engagement — inactive or struggling" delay={16} />
        <GlassCard delay={0.55}>
          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
            padding: '8px 12px', borderRadius: 10,
            background: 'rgba(var(--nav-glass-rgb), 0.06)', border: '0.5px solid rgba(var(--nav-glass-rgb), 0.08)'
          }}>
            <Search size={14} color="var(--text-secondary)" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search students by name or direction…"
              style={{
                flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)',
                fontSize: 13, outline: 'none', fontFamily: 'var(--font-sans)'
              }} />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Name', 'Direction', 'Foundation', 'Last Active'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 10px',
                      color: 'var(--text-secondary)', fontWeight: 600, fontSize: 12,
                      borderBottom: '0.5px solid rgba(var(--nav-glass-rgb), 0.1)',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => (
                  <motion.tr key={i} {...stagger(i + 17)}
                    style={{ borderBottom: '0.5px solid rgba(var(--nav-glass-rgb), 0.06)' }}>
                    <td style={{ padding: '10px', color: 'var(--text-info)', fontWeight: 500, cursor: 'pointer' }}>{s.n}</td>
                    <td style={{ padding: '10px', color: 'var(--text-primary)' }}>{s.d}</td>
                    <td style={{ padding: '10px' }}>
                      <Badge text={s.f} type="warning" />
                    </td>
                    <td style={{ padding: '10px', color: 'var(--text-danger)', fontWeight: 500 }}>{s.l}</td>
                  </motion.tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)' }}>No students match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '10px 0 0' }}>
            5 of 45 Red students shown. Engagement indicators identify students needing support.
          </p>
        </GlassCard>

        {/* Footer note */}
        <motion.p {...stagger(22)}
          style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '16px 0 0', fontStyle: 'italic', textAlign: 'center', opacity: 0.7 }}>
          All data filtered to {college} only. PO cannot see other colleges.
        </motion.p>
      </div>
    </div>
  );
}
