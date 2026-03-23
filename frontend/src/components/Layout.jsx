import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  // Build nav links based on auth state
  const navLinks = [
    { to: '/', label: 'Home', show: true },
    { to: '/dashboard', label: 'Dashboard', show: isAuthenticated },
    { to: '/passport', label: 'Skills Passport', show: isAuthenticated },
    { to: '/insights', label: 'Market Insights', show: true },
    { to: '/admin', label: 'Admin', show: isAdmin },
  ].filter(l => l.show);

  // User initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

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
        <div style={{ maxWidth: 1440, width: '100%', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

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

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggleTheme}
              style={{ padding: '5px 8px', border: '0.5px solid var(--border)', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {isAuthenticated ? (
              /* ── Logged in: User menu ── */
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 10px', borderRadius: 8,
                    border: '0.5px solid var(--border)',
                    background: menuOpen ? 'var(--bg-secondary)' : 'transparent',
                    cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)',
                  }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'var(--bg-info)', border: '1px solid var(--border-info)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 600, color: 'var(--text-info)',
                  }}>{initials}</div>
                  <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown size={12} style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 6,
                    background: 'var(--bg-primary)', border: '0.5px solid var(--border)',
                    borderRadius: 10, padding: 4, minWidth: 160,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  }}>
                    <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-secondary)', borderBottom: '0.5px solid var(--border)' }}>
                      {user?.email || 'No email'}
                      {user?.role && <span style={{ marginLeft: 6, fontSize: 10, background: 'var(--bg-info)', color: 'var(--text-info)', padding: '1px 6px', borderRadius: 6 }}>{user.role}</span>}
                      {user?.isDemo && <span style={{ marginLeft: 4, fontSize: 10, background: 'var(--bg-warning)', color: 'var(--text-warning)', padding: '1px 6px', borderRadius: 6 }}>DEMO</span>}
                    </div>
                    <button onClick={() => { setMenuOpen(false); navigate('/passport'); }}
                      style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-primary)', cursor: 'pointer', borderRadius: 6, textAlign: 'left' }}>
                      <User size={13} /> Profile
                    </button>
                    <button onClick={handleLogout}
                      style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-danger)', cursor: 'pointer', borderRadius: 6, textAlign: 'left' }}>
                      <LogOut size={13} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── Not logged in: Sign In + Get Started ── */
              <>
                <NavLink to="/login" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', padding: '4px 8px' }}>Sign In</NavLink>
                <NavLink to="/onboarding" style={{ fontSize: 13, fontWeight: 500, background: '#185FA5', color: '#fff', borderRadius: 8, padding: '6px 16px', textDecoration: 'none', display: 'inline-block' }}>Get Started</NavLink>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main style={{ flexGrow: 1, width: '100%', padding: '0' }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '0.5px solid var(--border)', padding: '16px 24px', marginTop: 32 }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-secondary)' }}>
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
