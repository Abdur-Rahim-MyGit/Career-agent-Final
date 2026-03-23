import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const S = {
  page:  { minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-sans)', padding: '32px 16px', background: 'var(--bg-primary)' },
  logo:  { width: 48, height: 48, borderRadius: 12, background: 'var(--bg-info)', border: '1px solid var(--border-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'var(--text-info)', marginBottom: 16 },
  h1:    { fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', textAlign: 'center' },
  sub:   { fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 28px', textAlign: 'center' },
  card:  { width: '100%', maxWidth: 400, background: 'var(--bg-primary)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '28px 28px 24px' },
  label: { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', border: '0.5px solid var(--border)', borderRadius: 8, fontSize: 14, background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-sans)', marginBottom: 16 },
  btn:   { width: '100%', padding: '11px 0', border: 'none', borderRadius: 8, background: '#185FA5', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  err:   { padding: '10px 14px', borderRadius: 8, background: 'var(--bg-danger)', border: '0.5px solid var(--text-danger)', color: 'var(--text-danger)', fontSize: 13, marginBottom: 12, lineHeight: 1.5 },
  info:  { padding: '10px 14px', borderRadius: 8, background: 'var(--bg-info)', border: '0.5px solid var(--border-info)', color: 'var(--text-info)', fontSize: 12, marginBottom: 12, lineHeight: 1.6 },
  foot:  { marginTop: 20, paddingTop: 16, borderTop: '0.5px solid var(--border)', textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' },
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

  // Where to go after login (from ProtectedRoute redirect, or /dashboard)
  const returnTo = location.state?.from || '/dashboard';

  // If already logged in, redirect away
  if (isAuthenticated) {
    navigate(returnTo, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
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
      /* Backend not running — demo mode */
      if (email && password.length >= 6) {
        setInfo('Backend not running — entering demo mode…');
        const demoUser = { name: email.split('@')[0], email, role: 'STUDENT' };
        authLogin('demo_token', demoUser);
        setTimeout(() => navigate(returnTo, { replace: true }), 800);
      } else {
        setError('Backend not reachable. Enter any email and a password of 6+ characters to continue in demo mode.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.logo}>S</div>
      <h1 style={S.h1}>Welcome Back</h1>
      <p style={S.sub}>Enter your credentials to access your dashboard.</p>

      <div style={S.card}>
        <form onSubmit={handleSubmit}>
          <label style={S.label}>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="your@email.com"
            style={{ ...S.input, borderColor: focusEmail ? 'var(--border-info)' : 'var(--border)' }}
            onFocus={() => setFocusEmail(true)} onBlur={() => setFocusEmail(false)} />

          <label style={S.label}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
            placeholder="••••••••"
            style={{ ...S.input, borderColor: focusPwd ? 'var(--border-info)' : 'var(--border)' }}
            onFocus={() => setFocusPwd(true)} onBlur={() => setFocusPwd(false)} />

          {error && <div style={S.err}>⚠ {error}</div>}
          {info  && <div style={S.info}>ℹ {info}</div>}

          <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div style={S.foot}>
          Don't have an account?{' '}
          <Link to="/onboarding" style={{ color: 'var(--text-info)', fontWeight: 600, textDecoration: 'none' }}>
            Start onboarding
          </Link>
        </div>
      </div>
    </div>
  );
}
