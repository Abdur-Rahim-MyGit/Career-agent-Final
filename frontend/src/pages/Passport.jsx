import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Share2, CheckCircle2, AlertTriangle, AlertCircle, Clock, Target, Sparkles, ChevronDown, ChevronUp, Briefcase, BookOpen } from 'lucide-react';

/* ── Passport Responsive CSS (injected once) ──────────────────────── */
const PASSPORT_CSS = `
  .passport-page {
    max-width: 1100px; margin: 0 auto; padding: 0 16px;
    font-family: 'Manrope', 'Inter', var(--font-sans);
  }
  .passport-actions { display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 20px; }
  .passport-grid { display: grid; grid-template-columns: 1fr; gap: 18px; }
  .passport-full { grid-column: 1 / -1; }

  @media (min-width: 768px) {
    .passport-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (min-width: 1024px) {
    .passport-grid { grid-template-columns: 3fr 2fr; }
  }

  .passport-card {
    background: var(--card-bg, var(--bg-primary));
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 0.5px solid rgba(72,72,71,0.15);
    border-radius: 18px;
    padding: 24px 28px;
    transition: box-shadow 0.3s ease, border-color 0.3s ease, transform 0.2s ease;
    position: relative;
    overflow: hidden;
  }
  .passport-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg, #85adff 0%, #6e9eff 40%, #9bffce 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .passport-card:hover {
    box-shadow: 0 8px 32px rgba(133,173,255,0.12), 0 2px 8px rgba(0,0,0,0.04);
    border-color: rgba(133,173,255,0.3);
    transform: translateY(-1px);
  }
  .passport-card:hover::before { opacity: 1; }

  .passport-btn {
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Inter', sans-serif;
  }
  .passport-btn:focus-visible { outline: 2px solid var(--text-info); outline-offset: 2px; }
  .passport-btn:hover { transform: translateY(-0.5px); }

  .skill-tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 5px 12px; border-radius: 10px;
    font-size: 12px; font-weight: 500;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .skill-tag:hover { transform: translateY(-1px); box-shadow: 0 3px 12px rgba(0,0,0,0.06); }

  .roadmap-btn {
    display: flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer;
    padding: 6px 0; margin-bottom: 10px; width: 100%;
    font-family: 'Manrope', sans-serif;
  }
  .roadmap-btn:focus-visible { outline: 2px solid var(--text-info); outline-offset: 2px; }
  .roadmap-btn:hover span { color: var(--text-info) !important; }

  .readiness-section {
    display: flex; flex-direction: column; align-items: center;
    padding: 24px 12px 16px;
    border-radius: 14px;
    background: linear-gradient(160deg,
      rgba(133,173,255,0.08) 0%,
      rgba(110,158,255,0.04) 50%,
      rgba(155,255,206,0.06) 100%
    );
    position: relative;
    overflow: hidden;
  }
  .readiness-section::after {
    content: '';
    position: absolute; top: -50%; right: -50%;
    width: 120%; height: 120%;
    background: radial-gradient(circle, rgba(133,173,255,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  @media print {
    .passport-actions, .passport-cta-row { display: none !important; }
    .passport-grid { grid-template-columns: 1fr 1fr !important; }
    .passport-page { max-width: 100% !important; }
    .passport-card::before { display: none; }
  }
`;

/* ── Inject CSS once ──────────────────────── */
if (typeof document !== 'undefined' && !document.getElementById('passport-responsive-css')) {
  const style = document.createElement('style');
  style.id = 'passport-responsive-css';
  style.textContent = PASSPORT_CSS;
  document.head.appendChild(style);
}

/* ── Animated Circular Progress ──────────────────────── */
function ProgressRing({ percent, size = 110, stroke = 9, color = '#85adff' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}
        >{percent}</motion.span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: -2 }}>%</span>
      </div>
    </div>
  );
}

/* ── Badge Component ──────────────────────── */
function Badge({ text, bg, fg }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 12px', borderRadius: 20, background: bg, color: fg, fontSize: 11, fontWeight: 600 }}>{text}</span>;
}

/* ── Stat Mini Card ──────────────────────── */
function StatCard({ label, value, sub, icon }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--text-secondary)', marginBottom: 4 }}>
        {icon}
        <span style={{ fontSize: 11 }}>{label}</span>
      </div>
      <p style={{ fontSize: 20, fontWeight: 700, margin: '0 0 2px', color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>{sub}</p>}
    </div>
  );
}

export default function Passport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(true);

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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        style={{ width: 24, height: 24, border: '2.5px solid var(--border)', borderTopColor: 'var(--text-info)', borderRadius: '50%' }}
      />
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

  const zoneConfig = {
    Green: { bg: 'var(--bg-success)', fg: 'var(--text-success)', icon: <CheckCircle2 size={14} />, label: 'Job Ready', ringColor: '#9bffce' },
    Amber: { bg: 'var(--bg-warning)', fg: 'var(--text-warning)', icon: <Clock size={14} />, label: 'Almost Ready', ringColor: '#f8a010' },
    Red: { bg: 'var(--bg-danger)', fg: 'var(--text-danger)', icon: <AlertTriangle size={14} />, label: 'Needs Work', ringColor: '#ff716c' },
  };
  const zc = zoneConfig[zone] || zoneConfig.Amber;

  const roadmap = data?.combined_tab4?.learning_roadmap || [];
  const date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const visibleSkills = showAllSkills ? matched : matched.slice(0, 8);

  return (
    <div className="passport-page">
      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="passport-actions"
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          className="passport-btn"
          style={{ padding: '8px 16px', fontSize: 13, border: '0.5px solid var(--border)', borderRadius: 10, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
        >
          <Share2 size={14} /> {copied ? '✓ Copied!' : 'Share'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handlePrint}
          className="passport-btn"
          style={{ padding: '8px 18px', fontSize: 13, border: 'none', borderRadius: 10, background: 'linear-gradient(135deg, #85adff, #6e9eff)', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(133,173,255,0.3)', fontFamily: "'Inter', sans-serif" }}
        >
          <Download size={14} /> Download as PDF
        </motion.button>
      </motion.div>

      {/* ═══ GRID LAYOUT ═══ */}
      <div className="passport-grid">

        {/* ── LEFT COLUMN: Identity Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="passport-card"
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: '0.5px solid var(--border)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #85adff, #6e9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', boxShadow: '0 2px 6px rgba(133,173,255,0.3)' }}>S</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>SMAART Career Passport</span>
              </div>
              <p style={{ fontSize: 24, fontWeight: 700, margin: '0 0 2px', color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>{name}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{degree}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Generated</p>
              <p style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>{date}</p>
            </div>
          </div>

          {/* Target Role + Zone */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Target size={14} style={{ color: 'var(--text-info)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Primary target role</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>{primaryRole}</p>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 10, background: zc.bg, color: zc.fg, fontSize: 12, fontWeight: 600 }}
              >
                {zc.icon} {zone}
              </motion.span>
            </div>

            {/* Skill Coverage Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
              <span>Skill coverage</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{coveragePct}%</span>
            </div>
            <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${coveragePct}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ height: '100%', background: `linear-gradient(90deg, ${zc.ringColor}, ${zc.ringColor}88)`, borderRadius: 4 }}
              />
            </div>
          </div>

          {/* Verified Skills */}
          {matched.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--text-success)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>
                    Verified Skills
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {matched.length} of {totalSkills} required
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <AnimatePresence>
                  {visibleSkills.map((sk, i) => (
                    <motion.span
                      key={sk}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="skill-tag"
                      style={{ background: 'var(--bg-success)', color: 'var(--text-success)', border: '0.5px solid rgba(155,255,206,0.15)' }}
                    >
                      <CheckCircle2 size={11} /> {sk}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              {matched.length > 8 && (
                <button
                  onClick={() => setShowAllSkills(!showAllSkills)}
                  className="passport-btn"
                  style={{ background: 'none', border: 'none', color: 'var(--text-info)', fontSize: 12, padding: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}
                >
                  {showAllSkills ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show all {matched.length} skills</>}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* ── RIGHT COLUMN: Readiness Score ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="passport-card"
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          {/* Readiness Ring */}
          <div className="readiness-section">
            <ProgressRing percent={coveragePct} color={zc.ringColor} />
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '12px 0 2px' }}>Career Readiness</p>
            <p style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>{zc.label}</p>
            <Badge text={`${zone} Zone`} bg={zc.bg} fg={zc.fg} />
          </div>

          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <StatCard label="Preparation" value={prepTime} icon={<Clock size={12} />} />
            <StatCard label="Skills" value={`${matched.length}/${totalSkills}`} sub="matched" icon={<Target size={12} />} />
          </div>

          {/* Missing Skills */}
          {missing.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <AlertCircle size={14} style={{ color: 'var(--text-warning)' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>Skills to Develop</span>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{missing.length} skills</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {missing.slice(0, 10).map((sk, i) => (
                  <motion.span
                    key={sk}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="skill-tag"
                    style={{ background: 'var(--bg-warning)', color: 'var(--text-warning)', border: '0.5px solid rgba(248,160,16,0.15)' }}
                  >
                    <AlertCircle size={11} /> {sk}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* ── FULL-WIDTH: Learning Roadmap ── */}
        {roadmap.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="passport-card passport-full"
          >
            <button
              onClick={() => setShowRoadmap(!showRoadmap)}
              className="roadmap-btn"
            >
              <BookOpen size={14} style={{ color: 'var(--text-info)' }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif", flex: 1, textAlign: 'left' }}>Learning Roadmap</span>
              {showRoadmap ? <ChevronUp size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />}
            </button>
            <AnimatePresence>
              {showRoadmap && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                    {roadmap.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        style={{ display: 'flex', gap: 10, padding: 10, background: 'var(--bg-secondary)', borderRadius: 12, border: '0.5px solid rgba(72,72,71,0.08)' }}
                      >
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #85adff, #6e9eff)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0, boxShadow: '0 2px 6px rgba(133,173,255,0.3)' }}>{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: '2px 0 0' }}>{step.step || step.title}</p>
                          {step.duration && <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>⏱ {step.duration}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── FULL-WIDTH: Action Buttons ── */}
        <div className="passport-full passport-cta-row" style={{ display: 'flex', gap: 10 }}>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/dashboard"
            className="passport-btn"
            style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'linear-gradient(135deg, #85adff, #6e9eff)', color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 2px 8px rgba(133,173,255,0.3)' }}
          >
            <Briefcase size={14} /> View Full Dashboard
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/onboarding"
            className="passport-btn"
            style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: '0.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Sparkles size={14} /> Update Profile
          </motion.a>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 14, marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Award size={12} style={{ color: 'var(--text-info)' }} />
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Generated by SMAART Career Intelligence Platform · smaart.careers</p>
        </div>
        <p style={{ fontSize: 10, color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', paddingLeft: 18 }}>
          This is a self-reported competency profile. Results are guidance, not a guarantee of employment outcomes.
        </p>
      </div>
    </div>
  );
}
