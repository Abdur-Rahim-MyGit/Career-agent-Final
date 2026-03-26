import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Target, Zap, BarChart3, Award, Clock, Plus, X, Shield, Sparkles, TrendingUp, Globe, Users, ArrowRight, Star, Layers, Code2, BookOpen, Briefcase } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

/* ── Live Stats Counter ── */
function Counter({ end, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let i = 0; const step = end / 40;
    const t = setInterval(() => { i += step; if (i >= end) { setVal(end); clearInterval(t); } else setVal(Math.floor(i)); }, 30);
    return () => clearInterval(t);
  }, [end]);
  return <>{val.toLocaleString()}{suffix}</>;
}

const Home = () => {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const [historyEntries, setHistoryEntries] = useState([]);
  const [stats, setStats] = useState({ totalRolesWithSkills: 1177, totalJobTitles: 53561, totalDegrees: 104 });

  useEffect(() => {
    setHistoryEntries(JSON.parse(localStorage.getItem('careerHistory') || '[]'));
  }, [showHistory]);

  useEffect(() => {
    fetch('/api/data-stats')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data); })
      .catch(() => {});
  }, []);

  const loadEntry = (entry) => {
    if (entry.data) {
      localStorage.setItem('careerMatch', JSON.stringify(entry.data));
      localStorage.setItem('smaart_last_analysis', JSON.stringify(entry.data));
    }
    if (entry.analysisId) localStorage.setItem('smaart_analysis_id', String(entry.analysisId));
    if (entry.role) localStorage.setItem('smaart_interest', entry.role);
    setShowHistory(false);
    navigate('/dashboard');
  };

  return (
    <div style={{ fontFamily: "'Inter', var(--font-sans)", overflow: 'hidden', width: '100%' }}>

      {/* ═══ HERO SECTION — FULL WIDTH ═══ */}
      <section style={{ position: 'relative', padding: '72px 48px 56px', overflow: 'hidden', width: '100%' }}>
        {/* Background gradient orbs — spread across full width */}
        <div style={{ position: 'absolute', top: -120, left: '10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(24,95,165,0.10) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: 40, right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(29,158,117,0.08) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '40%', width: 600, height: 300, background: 'radial-gradient(circle, rgba(133,173,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', top: 120, left: '60%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(186,117,23,0.06) 0%, transparent 70%)', pointerEvents: 'none', filter: 'blur(40px)' }} />

        {/* Hero grid: left copy + right preview */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center', maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* LEFT — Hero Copy */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 20, background: 'linear-gradient(135deg, rgba(133,173,255,0.12), rgba(29,158,117,0.08))', border: '0.5px solid rgba(133,173,255,0.2)', color: 'var(--text-info)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>
              <Sparkles size={13} /> AI-Powered Career Intelligence
            </div>

            <h1 style={{ fontSize: 52, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 18px', lineHeight: 1.08, letterSpacing: '-0.035em', fontFamily: "'Manrope', 'Inter', sans-serif" }}>
              Architect Your<br />
              <span style={{ background: 'linear-gradient(135deg, #85adff 0%, #1D9E75 50%, #9bffce 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Future Career
              </span>
            </h1>

            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, lineHeight: 1.75, margin: '0 0 32px', fontWeight: 400 }}>
              Stop guessing your professional trajectory. SMAART analyses your academic profile, matches industry-verified roles, and builds a clear roadmap to employment — powered by real Indian market data.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 30px', borderRadius: 14, background: 'linear-gradient(135deg, #185FA5, #1D6FB5)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', boxShadow: '0 6px 24px rgba(24,95,165,0.3), 0 0 0 0.5px rgba(255,255,255,0.1) inset', transition: 'transform 0.2s', letterSpacing: '-0.01em' }}>
                Build Career Profile <ArrowRight size={16} />
              </Link>
              <Link to="/insights" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 24px', borderRadius: 14, background: 'rgba(29,158,117,0.06)', color: 'var(--text-success, #1D9E75)', border: '0.5px solid rgba(29,158,117,0.15)', fontSize: 14, fontWeight: 500, cursor: 'pointer', textDecoration: 'none', transition: 'all 0.2s' }}>
                <BarChart3 size={15} /> Market Insights
              </Link>
              <button onClick={() => setShowHistory(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 20px', borderRadius: 14, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '0.5px solid rgba(72,72,71,0.12)', fontSize: 14, fontWeight: 500, cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                <Clock size={15} /> History
              </button>
            </div>

            {/* Quick Stats — under the CTA */}
            <div style={{ display: 'flex', gap: 32, marginTop: 36 }}>
              {[
                { n: stats.totalRolesWithSkills || 1177, l: 'Career Roles', icon: <Briefcase size={13} /> },
                { n: stats.totalJobTitles || 53561, l: 'Job Titles', icon: <Globe size={13} /> },
                { n: stats.totalDegrees || 104, l: 'Degree Paths', icon: <BookOpen size={13} /> },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-info)', marginBottom: 2 }}>{s.icon}</div>
                  <p style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif", letterSpacing: '-0.02em' }}><Counter end={s.n} /></p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '1px 0 0', fontWeight: 500 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Glass Dashboard Preview */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <div style={{ background: 'var(--bg-primary)', border: '0.5px solid rgba(72,72,71,0.12)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(255,255,255,0.04) inset' }}>
              {/* Browser bar */}
              <div style={{ height: 36, borderBottom: '0.5px solid rgba(72,72,71,0.06)', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 6, background: 'var(--bg-secondary)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fdbc40' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                <div style={{ flex: 1, height: 20, background: 'var(--bg-primary)', borderRadius: 5, marginLeft: 10, border: '0.5px solid rgba(72,72,71,0.06)' }} />
              </div>
              {/* Mock grid */}
              <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { gradient: 'linear-gradient(135deg, rgba(29,158,117,0.1), rgba(29,158,117,0.03))', label: 'Skill Coverage', val: '85%' },
                  { gradient: 'linear-gradient(135deg, rgba(133,173,255,0.1), rgba(133,173,255,0.03))', label: 'Market Demand', val: 'High' },
                  { gradient: 'linear-gradient(135deg, rgba(186,117,23,0.1), rgba(186,117,23,0.03))', label: 'AI Risk', val: 'Low' },
                ].map((c, i) => (
                  <div key={i} style={{ background: c.gradient, borderRadius: 10, padding: 12, border: '0.5px solid rgba(72,72,71,0.04)' }}>
                    <p style={{ fontSize: 9, color: 'var(--text-secondary)', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</p>
                    <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>{c.val}</p>
                  </div>
                ))}
              </div>
              {/* Animated bar chart + skills list */}
              <div style={{ padding: '0 14px 14px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 8 }}>
                <div style={{ height: 120, borderRadius: 10, background: 'var(--bg-secondary)', border: '0.5px solid rgba(72,72,71,0.04)', padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ height: 6, width: '25%', borderRadius: 3, background: 'rgba(133,173,255,0.15)' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 60 }}>
                    {[45, 65, 35, 80, 55, 70, 90, 50, 75, 40].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                        style={{ flex: 1, borderRadius: 3, background: `linear-gradient(180deg, rgba(133,173,255,${0.35 + h / 200}), rgba(29,158,117,${0.15 + h / 300}))` }} />
                    ))}
                  </div>
                </div>
                <div style={{ height: 120, borderRadius: 10, background: 'var(--bg-secondary)', border: '0.5px solid rgba(72,72,71,0.04)', padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 6, width: '45%', borderRadius: 3, background: 'rgba(29,158,117,0.15)', marginBottom: 4 }} />
                  {[85, 72, 60, 45, 35].map((w, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 5, height: 5, borderRadius: 2, background: i < 2 ? 'rgba(29,158,117,0.5)' : i < 3 ? 'rgba(133,173,255,0.4)' : 'rgba(186,117,23,0.4)' }} />
                      <motion.div initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ delay: 0.6 + i * 0.06, duration: 0.4 }}
                        style={{ height: 5, borderRadius: 3, background: 'rgba(72,72,71,0.06)' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FEATURES GRID — FULL WIDTH ═══ */}
      <section style={{ width: '100%', padding: '48px 48px 56px', background: 'linear-gradient(180deg, transparent, rgba(133,173,255,0.015), transparent)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-info)', margin: '0 0 6px' }}>Why SMAART</p>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', fontFamily: "'Manrope', sans-serif" }}>Intelligence at Every Step</h2>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, maxWidth: 300, textAlign: 'right', lineHeight: 1.5 }}>
              From academic profile to employment — every stage is powered by data-driven intelligence.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { icon: <Target size={20} />, color: '#85adff', bg: 'rgba(133,173,255,0.08)', title: 'Algorithmic Role Matching', desc: 'Cross-references your academic profile against 254 career roles with multi-axis scoring to find your optimal direction.' },
              { icon: <Layers size={20} />, color: '#1D9E75', bg: 'rgba(29,158,117,0.08)', title: 'Skill Gap Synthesis', desc: 'Identifies exactly which skills are missing with priority tiers — Critical, High, and Recommended — with learning resources.' },
              { icon: <Award size={20} />, color: '#BA7517', bg: 'rgba(186,117,23,0.08)', title: 'Digital Skill Passport', desc: 'Consolidates your achievements into a verifiable digital career passport that employers and recruiters can validate.' },
              { icon: <Shield size={20} />, color: '#85adff', bg: 'rgba(133,173,255,0.08)', title: 'AI Automation Risk', desc: 'Evaluates how exposed each career path is to AI automation so you invest in future-proof, high-value skills.' },
              { icon: <TrendingUp size={20} />, color: '#1D9E75', bg: 'rgba(29,158,117,0.08)', title: 'Live Market Intelligence', desc: 'Real-time salary ranges, hiring demand levels, layoff analysis, and industry trends across the Indian job market.' },
              { icon: <Code2 size={20} />, color: '#BA7517', bg: 'rgba(186,117,23,0.08)', title: 'AI Tools Stack', desc: 'Role-specific AI tools (must-have & nice-to-have) curated per profession — SEO tools for marketers, design tools for creators.' },
            ].map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
                style={{ background: 'var(--bg-primary)', border: '0.5px solid rgba(72,72,71,0.08)', borderRadius: 16, padding: 24, cursor: 'default', transition: 'all 0.3s cubic-bezier(.4,0,.2,1)' }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 14 }}>
                  {f.icon}
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{f.title}</p>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — FULL WIDTH ═══ */}
      <section style={{ width: '100%', padding: '48px 48px 56px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-success)', margin: '0 0 6px' }}>How It Works</p>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em', fontFamily: "'Manrope', sans-serif" }}>4 Steps to Your Career Roadmap</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { step: '01', title: 'Academic Profile', desc: 'Enter your degree, specialization, and CGPA', color: '#85adff', bg: 'rgba(133,173,255,0.06)' },
              { step: '02', title: 'AI Analysis', desc: 'Groq-powered engine matches you against 254 roles', color: '#1D9E75', bg: 'rgba(29,158,117,0.06)' },
              { step: '03', title: 'Skill Gaps', desc: 'See exactly what skills to build — with course links', color: '#BA7517', bg: 'rgba(186,117,23,0.06)' },
              { step: '04', title: 'Career Passport', desc: 'Get your verified digital passport & market insights', color: '#85adff', bg: 'rgba(133,173,255,0.06)' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                style={{ padding: 24, borderRadius: 16, background: s.bg, border: `0.5px solid ${s.color}15`, position: 'relative' }}>
                <p style={{ fontSize: 32, fontWeight: 900, color: `${s.color}25`, margin: '0 0 12px', fontFamily: "'Manrope', sans-serif" }}>{s.step}</p>
                <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>{s.title}</p>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
                {i < 3 && <div style={{ position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text-secondary)', zIndex: 1 }}>→</div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA BANNER — FULL WIDTH ═══ */}
      <motion.section
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ width: '100%', padding: '0 48px', marginBottom: 32 }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', background: 'linear-gradient(135deg, rgba(24,95,165,0.08) 0%, rgba(29,158,117,0.06) 50%, rgba(186,117,23,0.04) 100%)', border: '0.5px solid rgba(133,173,255,0.12)', borderRadius: 22, padding: '36px 42px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em', fontFamily: "'Manrope', sans-serif" }}>
              Ready to map your career?
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, fontWeight: 400, maxWidth: 480, lineHeight: 1.6 }}>
              Join students across India who've found their career direction with SMAART. It takes less than 5 minutes to build your profile.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 14, background: 'linear-gradient(135deg, #185FA5, #1D6FB5)', color: '#fff', fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: '0 6px 24px rgba(24,95,165,0.25)', whiteSpace: 'nowrap' }}>
              Get Started <ArrowRight size={16} />
            </Link>
            <Link to="/insights" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '14px 20px', borderRadius: 14, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '0.5px solid rgba(72,72,71,0.1)', fontSize: 14, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              <TrendingUp size={14} /> Explore Market Data
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ width: '100%', padding: '24px 48px', borderTop: '0.5px solid rgba(72,72,71,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1280, margin: '0 auto' }}>
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>© {new Date().getFullYear()} SMAART Minds · AI Career Intelligence · India</p>
        <div style={{ display: 'flex', gap: 20 }}>
          {['About', 'Contact', 'Privacy'].map(l => (
            <span key={l} style={{ fontSize: 11, color: 'var(--text-secondary)', cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
      </footer>

      {/* ═══ HISTORY SIDEBAR ═══ */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
              onClick={() => setShowHistory(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              style={{ position: 'fixed', top: 0, right: 0, width: 360, height: '100%', background: 'var(--bg-primary)', borderLeft: '0.5px solid rgba(72,72,71,0.1)', zIndex: 2001, display: 'flex', flexDirection: 'column', fontFamily: "'Inter', var(--font-sans)" }}>
              <div style={{ padding: '18px 22px', borderBottom: '0.5px solid rgba(72,72,71,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={15} color="var(--text-info)" /> Analysis History
                </span>
                <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}><X size={16} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
                {historyEntries.length === 0 ? (
                  <div style={{ textAlign: 'center', marginTop: 56 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(133,173,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--text-info)' }}><Clock size={22} /></div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 4px', fontWeight: 500 }}>No analyses yet</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Complete onboarding to see results.</p>
                  </div>
                ) : historyEntries.map((entry, i) => (
                  <motion.div key={entry.id || i} whileHover={{ borderColor: 'rgba(133,173,255,0.3)' }} onClick={() => loadEntry(entry)}
                    style={{ padding: '14px 16px', background: 'var(--bg-secondary)', border: '0.5px solid rgba(72,72,71,0.06)', borderRadius: 14, marginBottom: 10, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(133,173,255,0.08)', color: 'var(--text-info)', padding: '2px 8px', borderRadius: 8, textTransform: 'uppercase' }}>Run {String(historyEntries.length - i).padStart(2, '0')}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: '4px 0 2px', color: 'var(--text-primary)' }}>{entry.role || 'Career Analysis'}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>{new Date(entry.timestamp).toLocaleDateString()}</p>
                  </motion.div>
                ))}
              </div>
              <div style={{ padding: 18, borderTop: '0.5px solid rgba(72,72,71,0.06)' }}>
                <button onClick={() => { setShowHistory(false); navigate('/onboarding'); }}
                  style={{ width: '100%', padding: '13px 0', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg, #185FA5, #1D6FB5)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(24,95,165,0.25)' }}>
                  <Plus size={15} /> Start New Analysis
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
