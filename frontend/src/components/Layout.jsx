import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

const Layout = ({ children }) => {
  // Read saved theme — default to light. Apply immediately to avoid flash.
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark');

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/passport', label: 'Skills Passport' },
    { to: '/insights', label: 'Market Insights' },
    { to: '/admin', label: 'Admin' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--bg-primary)',
        borderBottom: '0.5px solid var(--border)',
        height: 48,
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ maxWidth: 960, width: '100%', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Brand */}
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--bg-info)', border: '1px solid var(--border-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-info)', flexShrink: 0 }}>S</div>
            <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>SMAART</span>
          </NavLink>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {navLinks.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                style={({ isActive }) => ({
                  fontSize: 13, fontWeight: 400,
                  color: isActive ? 'var(--text-info)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid var(--text-info)' : '2px solid transparent',
                  paddingBottom: 2, transition: 'color 0.15s',
                })}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggleTheme}
              style={{ padding: '5px 8px', border: '0.5px solid var(--border)', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <NavLink to="/login" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', padding: '4px 8px' }}>Sign In</NavLink>
            <NavLink to="/onboarding" style={{ fontSize: 13, fontWeight: 500, background: '#185FA5', color: '#fff', borderRadius: 8, padding: '6px 16px', textDecoration: 'none', display: 'inline-block' }}>Get Started</NavLink>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main style={{ flexGrow: 1, maxWidth: 960, width: '100%', margin: '0 auto', padding: '16px 24px' }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '0.5px solid var(--border)', padding: '16px 24px', marginTop: 32 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-info)', border: '1px solid var(--border-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: 'var(--text-info)' }}>S</div>
            SMAART © 2026. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Privacy</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
