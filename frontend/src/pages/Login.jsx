import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

/* ── Stitch MCP "Digital Oracle — Luminous Insight" ─────────────── */
const glass = {
  background: 'rgba(26,26,26,0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '0.5px solid rgba(72,72,71,0.30)',
  borderRadius: 24,
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusEmail, setFocusEmail] = useState(false);
  const [focusPwd, setFocusPwd] = useState(false);

  const returnTo = location.state?.from || '/dashboard';

  if (isAuthenticated) {
    navigate(returnTo, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        authLogin(data.token, data.user || { email, role: 'STUDENT' });
        navigate(returnTo, { replace: true });
      } else {
        setError(data.error || data.message || 'Invalid email or password.');
      }
    } catch {
      if (email && password.length >= 6) {
        setInfo('Backend not running — entering demo mode…');
        const demoUser = { name: email.split('@')[0], email, role: 'STUDENT' };
        authLogin('demo_token', demoUser);
        setTimeout(() => navigate(returnTo, { replace: true }), 800);
      } else {
        setError('Enter any email and a password of 6+ chars to continue in demo mode.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary, #0e0e0e)',
      backgroundImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(133,173,255,0.08) 0%, transparent 60%)',
      fontFamily: "'Inter', var(--font-sans)", padding: '24px 16px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 440 }}
      >
        {/* Logo + header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #b1c9ff, #85adff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 32px rgba(133,173,255,0.25)',
          }}>
            <Zap size={28} color="#002e6a" strokeWidth={2.5} />
          </div>
          <h1 style={{
            fontFamily: "'Manrope', var(--font-sans)", fontWeight: 800, fontSize: 28,
            color: 'var(--text-primary, #fff)', margin: '0 0 6px', letterSpacing: '-0.02em',
          }}>Welcome Back</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary, #adaaaa)', margin: 0, lineHeight: 1.5 }}>
            Sign in to access your career intelligence dashboard
          </p>
        </div>

        {/* Glass card */}
        <div style={{ ...glass, padding: '32px 28px 28px' }}>
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 700, fontFamily: "'Manrope', sans-serif",
              color: 'var(--text-secondary, #adaaaa)', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 8,
            }}>Email Address</label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--surface-high, var(--bg-secondary, #2a2a2a))',
              borderRadius: 12, padding: '0 14px',
              border: focusEmail ? '1px solid #85adff' : '0.5px solid rgba(72,72,71,0.30)',
              boxShadow: focusEmail ? '0 0 0 3px rgba(133,173,255,0.15)' : 'none',
              transition: 'border 0.2s, box-shadow 0.2s', marginBottom: 18,
            }}>
              <Mail size={16} color={focusEmail ? '#85adff' : '#8d909c'} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="your@email.com"
                onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)}
                style={{
                  flex: 1, padding: '13px 0', border: 'none', background: 'transparent',
                  color: 'var(--text-primary, #fff)', fontSize: 14, outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                }} />
            </div>

            {/* Password */}
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 700, fontFamily: "'Manrope', sans-serif",
              color: 'var(--text-secondary, #adaaaa)', textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 8,
            }}>Password</label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--surface-high, var(--bg-secondary, #2a2a2a))',
              borderRadius: 12, padding: '0 14px',
              border: focusPwd ? '1px solid #85adff' : '0.5px solid rgba(72,72,71,0.30)',
              boxShadow: focusPwd ? '0 0 0 3px rgba(133,173,255,0.15)' : 'none',
              transition: 'border 0.2s, box-shadow 0.2s', marginBottom: 24,
            }}>
              <Lock size={16} color={focusPwd ? '#85adff' : '#8d909c'} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                onFocus={() => setFocusPwd(true)} onBlur={() => setFocusPwd(false)}
                style={{
                  flex: 1, padding: '13px 0', border: 'none', background: 'transparent',
                  color: 'var(--text-primary, #fff)', fontSize: 14, outline: 'none',
                  fontFamily: "'Inter', sans-serif",
                }} />
            </div>

            {/* Errors / Info */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '10px 14px', borderRadius: 12, marginBottom: 16,
                  background: 'rgba(255,113,108,0.1)', border: '0.5px solid rgba(255,113,108,0.3)',
                  color: '#ff716c', fontSize: 13, lineHeight: 1.5,
                }}>⚠ {error}</motion.div>
            )}
            {info && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '10px 14px', borderRadius: 12, marginBottom: 16,
                  background: 'rgba(133,173,255,0.1)', border: '0.5px solid rgba(133,173,255,0.3)',
                  color: '#85adff', fontSize: 12, lineHeight: 1.6,
                }}>
                <Sparkles size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                {info}
              </motion.div>
            )}

            {/* Submit — capsule button */}
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01, boxShadow: '0 4px 24px rgba(133,173,255,0.35)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%', padding: '14px 0', border: 'none', borderRadius: 9999,
                background: 'linear-gradient(135deg, #b1c9ff, #85adff)',
                color: '#002e6a', fontSize: 15, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Manrope', sans-serif", display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.2s',
              }}>
              {loading ? 'Signing in…' : <>Sign In <ArrowRight size={18} /></>}
            </motion.button>
          </form>

          {/* Footer */}
          <div style={{
            marginTop: 24, paddingTop: 20,
            borderTop: '0.5px solid rgba(72,72,71,0.30)',
            textAlign: 'center', fontSize: 13, color: 'var(--text-secondary, #adaaaa)',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: '#85adff', fontWeight: 700, textDecoration: 'none',
              borderBottom: '1px solid rgba(133,173,255,0.3)',
            }}>
              Start onboarding
            </Link>
          </div>
        </div>

        {/* Subtle ambient glow */}
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
