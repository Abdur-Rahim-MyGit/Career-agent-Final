import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, Share2, ExternalLink, CheckCircle2, AlertTriangle, Clock, Target, Sparkles, ChevronDown, ChevronUp, Briefcase, BookOpen } from 'lucide-react';

const font = { fontFamily: "'Manrope', 'Inter', var(--font-sans)" };

/* ── Stitch MCP Design Tokens ──────────────────────── */
const C = {
  card: { background: 'var(--card-bg, var(--bg-primary))', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '0.5px solid rgba(72,72,71,0.20)', borderRadius: 16, padding: '20px 24px', marginBottom: 12, transition: 'box-shadow 0.3s ease' },
};

/* ── Animated Circular Progress ──────────────────────── */
function ProgressRing({ percent, size = 100, stroke = 8, color = '#85adff' }) {
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
          style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}
        >{percent}</motion.span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: -2 }}>%</span>
      </div>
    </div>
  );
}

/* ── Badge Component ──────────────────────── */
function Badge({ text, bg, fg }) {
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 10, background: bg, color: fg, fontSize: 11, fontWeight: 600 }}>{text}</span>;
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', ...font }}>
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
    <div style={{ maxWidth: 680, ...font }}>
      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="print:hidden"
        style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleShare}
          style={{ padding: '8px 16px', fontSize: 13, border: '0.5px solid var(--border)', borderRadius: 10, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}
        >
          <Share2 size={14} /> {copied ? '✓ Copied!' : 'Share'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handlePrint}
          style={{ padding: '8px 18px', fontSize: 13, border: 'none', borderRadius: 10, background: 'linear-gradient(135deg, #85adff, #6e9eff)', color: '#fff', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(133,173,255,0.3)', fontFamily: "'Inter', sans-serif" }}
        >
          <Download size={14} /> Download as PDF
        </motion.button>
      </motion.div>

      {/* Main Passport Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={C.card}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: '0.5px solid var(--border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #85adff, #6e9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', boxShadow: '0 2px 6px rgba(133,173,255,0.3)' }}>S</div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>SMAART Career Passport</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, margin: '0 0 2px', color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>{name}</p>
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
            <p style={{ fontSize: 17, fontWeight: 600, margin: 0, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>{primaryRole}</p>
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

        {/* Readiness Score — Circular Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, background: 'var(--bg-secondary)', borderRadius: 14, marginBottom: 20, backgroundImage: 'linear-gradient(135deg, rgba(133,173,255,0.06) 0%, rgba(155,255,206,0.03) 100%)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ProgressRing percent={coveragePct} color={zc.ringColor} />
            <div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 2px' }}>Career Readiness</p>
              <p style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>{zc.label}</p>
              <Badge text={`${zone} Zone`} bg={zc.bg} fg={zc.fg} />
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Est. preparation time</p>
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--text-primary)', fontFamily: "'Manrope', sans-serif" }}>{prepTime}</p>
          </div>
        </motion.div>

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
                    style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 10, background: 'var(--bg-success)', color: 'var(--text-success)', fontSize: 12, fontWeight: 500, border: '0.5px solid rgba(155,255,206,0.15)' }}
                  >
                    ✓ {sk}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
            {matched.length > 8 && (
              <button
                onClick={() => setShowAllSkills(!showAllSkills)}
                style={{ background: 'none', border: 'none', color: 'var(--text-info)', fontSize: 12, cursor: 'pointer', padding: '8px 0 0', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}
              >
                {showAllSkills ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Show all {matched.length} skills</>}
              </button>
            )}
          </div>
        )}

        {/* Missing Skills */}
        {missing.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <AlertTriangle size={14} style={{ color: 'var(--text-warning)' }} />
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
                  style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 10, background: 'var(--bg-warning)', color: 'var(--text-warning)', fontSize: 12, fontWeight: 500, border: '0.5px solid rgba(248,160,16,0.15)' }}
                >
                  ○ {sk}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Roadmap */}
        {roadmap.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => setShowRoadmap(!showRoadmap)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 10, width: '100%' }}
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
                  {roadmap.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      style={{ display: 'flex', gap: 12, padding: '8px 0' }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 24 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #85adff, #6e9eff)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0, boxShadow: '0 2px 6px rgba(133,173,255,0.3)' }}>{i + 1}</div>
                        {i < roadmap.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', borderRadius: 1 }} />}
                      </div>
                      <div style={{ flex: 1, paddingBottom: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: '2px 0 0' }}>{step.step || step.title}</p>
                        {step.duration && <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>⏱ {step.duration}</p>}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Action Buttons */}
        <div className="print:hidden" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/dashboard"
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: 'linear-gradient(135deg, #85adff, #6e9eff)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 2px 8px rgba(133,173,255,0.3)' }}
          >
            <Briefcase size={14} /> View Full Dashboard
          </motion.a>
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="/onboarding"
            style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <Sparkles size={14} /> Update Profile
          </motion.a>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 14, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Award size={12} style={{ color: 'var(--text-info)' }} />
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Generated by SMAART Career Intelligence Platform · smaart.careers</p>
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', paddingLeft: 18 }}>
            This is a self-reported competency profile. Results are guidance, not a guarantee of employment outcomes.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
