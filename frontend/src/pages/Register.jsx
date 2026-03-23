import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles, Shield, Target, BookOpen, Award } from 'lucide-react';

/* ── Stitch MCP "Digital Oracle — Luminous Insight" ─────────────── */
const glass = {
  background: 'rgba(26,26,26,0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '0.5px solid rgba(72,72,71,0.30)',
  borderRadius: 24,
};

const steps = [
  { icon: BookOpen, label: 'Academic Baseline', desc: 'Your degree & specialization' },
  { icon: Target,   label: 'Career Interests',  desc: 'Industry & role preferences' },
  { icon: Shield,   label: 'Skill Assessment',   desc: 'Verified skills mapping' },
  { icon: Sparkles, label: 'AI Analysis',        desc: 'Personalized career path' },
  { icon: Award,    label: 'Your Dashboard',     desc: 'Recommendations & roadmap' },
];

export default function Register() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary, #0e0e0e)',
      backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(155,255,206,0.06) 0%, transparent 60%)',
      fontFamily: "'Inter', var(--font-sans)", padding: '24px 16px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 480 }}
      >
        {/* Logo + header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #9bffce, #5dc093)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 32px rgba(155,255,206,0.2)',
          }}>
            <Sparkles size={28} color="#003825" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontFamily: "'Manrope', var(--font-sans)", fontWeight: 800, fontSize: 28,
            color: 'var(--text-primary, #fff)', margin: '0 0 6px', letterSpacing: '-0.02em',
          }}>Create your SMAART account</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary, #adaaaa)', margin: 0, lineHeight: 1.5 }}>
            Complete the 5-step onboarding to get your personalized career intelligence
          </p>
        </div>

        {/* Glass card */}
        <div style={{ ...glass, padding: '32px 28px 28px' }}>
          {/* Timeline steps */}
          <div style={{ marginBottom: 28 }}>
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0',
                    position: 'relative',
                  }}
                >
                  {/* Timeline line */}
                  {i < steps.length - 1 && (
                    <div style={{
                      position: 'absolute', left: 17, top: 40, width: 1, height: 20,
                      background: 'rgba(72,72,71,0.40)',
                    }} />
                  )}
                  {/* Node */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: i === 0
                      ? 'linear-gradient(135deg, #b1c9ff, #85adff)'
                      : 'var(--surface-high, #2a2a2a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: i === 0 ? 'none' : '0.5px solid rgba(72,72,71,0.30)',
                  }}>
                    <Icon size={16} color={i === 0 ? '#002e6a' : '#8d909c'} />
                  </div>
                  {/* Text */}
                  <div>
                    <div style={{
                      fontSize: 14, fontWeight: 600, color: 'var(--text-primary, #fff)',
                      fontFamily: "'Manrope', sans-serif",
                    }}>{step.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary, #adaaaa)', marginTop: 1 }}>
                      {step.desc}
                    </div>
                  </div>
                  {/* Step number */}
                  <div style={{
                    marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#8d909c',
                    fontFamily: "'Manrope', sans-serif",
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA — capsule button */}
          <Link to="/onboarding" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.01, boxShadow: '0 4px 24px rgba(155,255,206,0.3)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 9999,
                background: 'linear-gradient(135deg, #9bffce, #5dc093)',
                color: '#003825', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Manrope', sans-serif", display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, border: 'none',
              }}>
              Start Onboarding <ChevronRight size={18} />
            </motion.div>
          </Link>

          {/* Footer */}
          <div style={{
            marginTop: 24, paddingTop: 20,
            borderTop: '0.5px solid rgba(72,72,71,0.30)',
            textAlign: 'center', fontSize: 13, color: 'var(--text-secondary, #adaaaa)',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: '#85adff', fontWeight: 700, textDecoration: 'none',
              borderBottom: '1px solid rgba(133,173,255,0.3)',
            }}>
              Sign In
            </Link>
          </div>
        </div>

        <div style={{
          textAlign: 'center', marginTop: 24, fontSize: 12,
          color: 'var(--text-secondary, #adaaaa)', opacity: 0.6,
        }}>
          SMAART Career Intelligence Platform
        </div>
      </motion.div>
    </div>
  );
}
