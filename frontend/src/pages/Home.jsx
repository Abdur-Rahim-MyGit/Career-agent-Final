import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Target, Zap, BarChart3, Award, Clock, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const S = {
  wrap: { fontFamily: 'var(--font-sans)', padding: '32px 0' },
  hero: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 64 },
  tag: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 6, background: 'var(--bg-info)', color: 'var(--text-info)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 20 },
  h1: { fontSize: 40, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px', lineHeight: 1.2, letterSpacing: '-0.02em' },
  sub: { fontSize: 14, color: 'var(--text-secondary)', maxWidth: 560, lineHeight: 1.7, margin: '0 auto 32px' },
  btnRow: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 8, background: '#185FA5', color: '#fff', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer', textDecoration: 'none' },
  btnGhost: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '0.5px solid var(--border)', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  mockWrap: { marginTop: 48, width: '100%', maxWidth: 800 },
  mockOuter: { background: 'var(--bg-primary)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 8, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
  mockBar: { height: 32, borderBottom: '0.5px solid var(--border)', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', padding: '0 14px', gap: 6, background: 'var(--bg-secondary)' },
  dot: { width: 10, height: 10, borderRadius: '50%', background: 'var(--border)' },
  mockGrid: { padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, background: 'var(--bg-primary)' },
  mockCard: { height: 88, borderRadius: 8, background: 'var(--bg-secondary)', border: '0.5px solid var(--border)', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 },
  mockLine: { height: 8, borderRadius: 4, background: 'var(--border)' },
  mockRow2: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, padding: '0 16px 16px' },
  mockTall: { height: 160, borderRadius: 8, background: 'var(--bg-secondary)', border: '0.5px solid var(--border)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 },
};

const Home = () => {
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const [historyEntries, setHistoryEntries] = useState([]);

  useEffect(() => {
    setHistoryEntries(JSON.parse(localStorage.getItem('careerHistory') || '[]'));
  }, [showHistory]);

  const loadEntry = (entry) => {
    /* Store the full analysis data so Dashboard can find it without API call */
    if (entry.data) {
      localStorage.setItem('careerMatch', JSON.stringify(entry.data));
      /* smaart_last_analysis is the key Dashboard falls back to */
      localStorage.setItem('smaart_last_analysis', JSON.stringify(entry.data));
    }
    if (entry.analysisId) {
      localStorage.setItem('smaart_analysis_id', String(entry.analysisId));
    }
    /* Store the role as interest hint */
    if (entry.role) {
      localStorage.setItem('smaart_interest', entry.role);
    }
    setShowHistory(false);
    navigate('/dashboard');
  };

  return (
    <div style={S.wrap}>
      {/* Hero */}
      <motion.section style={S.hero} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={S.tag}><Zap size={12} /> AI Career Intelligence</div>
        <h1 style={S.h1}>Architecting Your<br /><span style={{ color: 'var(--text-secondary)' }}>Future Career</span></h1>
        <p style={S.sub}>Stop guessing your professional trajectory. SMAART analyses your academic profile, matches industry-verified roles, and gives you a clear roadmap to employment.</p>

        <div style={S.btnRow}>
          <Link to="/onboarding" style={S.btnPrimary}>
            Build Your Career Profile <ChevronRight size={15} />
          </Link>
          <button onClick={() => setShowHistory(true)} style={S.btnGhost}>
            <Clock size={15} /> View History
          </button>
        </div>

        {/* Mock dashboard preview */}
        <div style={S.mockWrap}>
          <div style={S.mockOuter}>
            <div style={S.mockBar}>
              <div style={S.dot} /><div style={S.dot} /><div style={S.dot} />
            </div>
            <div style={S.mockGrid}>
              {[1, 2, 3].map(i => (
                <div key={i} style={S.mockCard}>
                  <div style={{ ...S.mockLine, width: 32, height: 32, borderRadius: 6 }} />
                  <div style={{ ...S.mockLine, width: '80%' }} />
                  <div style={{ ...S.mockLine, width: '60%' }} />
                </div>
              ))}
            </div>
            <div style={S.mockRow2}>
              <div style={S.mockTall}>
                <div style={{ ...S.mockLine, width: '40%', height: 10 }} />
                <div style={{ ...S.mockLine, width: '100%', height: 40, borderRadius: 6 }} />
                <div style={{ ...S.mockLine, width: '70%' }} />
              </div>
              <div style={S.mockTall}>
                <div style={{ ...S.mockLine, width: '60%', height: 10, marginBottom: 4 }} />
                {[1, 2, 3, 4].map(i => <div key={i} style={{ ...S.mockLine, width: '100%', height: 14, borderRadius: 6 }} />)}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, maxWidth: 800, margin: '0 auto' }}>
        {[
          { icon: <Target size={18} color="var(--text-info)" />, title: 'Algorithmic Matching', desc: 'Cross-references your academic profile to find your optimal career direction.' },
          { icon: <BarChart3 size={18} color="var(--text-info)" />, title: 'Gap Synthesis', desc: 'Pinpoints exactly which skills are missing from your profile with priority tiers.' },
          { icon: <Award size={18} color="var(--text-info)" />, title: 'Verified Identity', desc: 'Consolidates your achievements into a recognised digital career passport.' },
        ].map((f, i) => (
          <motion.div key={i} whileHover={{ y: -2 }}
            style={{ background: 'var(--bg-primary)', border: '0.5px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {f.icon}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px', color: 'var(--text-primary)' }}>{f.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowHistory(false)} />

            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              style={{ position: 'fixed', top: 0, right: 0, width: 320, height: '100%', background: 'var(--bg-primary)', borderLeft: '0.5px solid var(--border)', zIndex: 2001, display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)' }}>

              <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color="var(--text-info)" /> Analysis History
                </span>
                <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                {historyEntries.length === 0 ? (
                  <div style={{ textAlign: 'center', marginTop: 48 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 8px' }}>No past analyses yet.</p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Complete onboarding to see your history here.</p>
                  </div>
                ) : historyEntries.map((entry, i) => (
                  <div key={entry.id} onClick={() => loadEntry(entry)}
                    style={{ padding: '14px 16px', background: 'var(--bg-secondary)', border: '0.5px solid var(--border)', borderRadius: 10, marginBottom: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-info)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--bg-info)', color: 'var(--text-info)', padding: '2px 8px', borderRadius: 8, textTransform: 'uppercase' }}>
                        RUN {String(historyEntries.length - i).padStart(2, '0')}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: '4px 0 2px', color: 'var(--text-primary)' }}>{entry.role || 'Career Analysis'}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>{new Date(entry.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>

              <div style={{ padding: 16, borderTop: '0.5px solid var(--border)' }}>
                <button onClick={() => { setShowHistory(false); navigate('/onboarding'); }}
                  style={{ width: '100%', padding: '10px 0', border: 'none', borderRadius: 8, background: '#185FA5', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Plus size={14} /> Start New Analysis
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
