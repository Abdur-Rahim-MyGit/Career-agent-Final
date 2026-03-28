import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, LogOut, User, ChevronDown, Home, LayoutDashboard, Shield, BarChart3, Award, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Premium Navbar — Glassmorphism ─────────────────────────── */
const Layout = ({ children }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Scroll detection for elevation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={15} />, show: true },
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} />, show: isAuthenticated },
    { to: '/passport', label: 'Skills Passport', icon: <Award size={15} />, show: isAuthenticated },
    { to: '/insights', label: 'Market Insights', icon: <BarChart3 size={15} />, show: true },
    { to: '/admin', label: 'Admin', icon: <Shield size={15} />, show: isAdmin },
  ].filter(l => l.show);

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() || '?';

  /* ── Animated NavLink ── */
  const PremiumNavLink = ({ item }) => (
    <NavLink key={item.to} to={item.to} end={item.to === '/'}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: isActive ? 600 : 450,
        color: isActive ? 'var(--text-info)' : 'var(--text-secondary)',
        textDecoration: 'none', padding: '6px 12px', borderRadius: 8,
        background: isActive ? 'var(--bg-info)' : 'transparent',
        transition: 'all 0.2s ease',
        position: 'relative',
      })}>
      {item.icon}
      {item.label}
    </NavLink>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* ── Premium Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled
          ? 'rgba(var(--nav-glass-rgb, 255,255,255), 0.72)'
          : 'var(--bg-primary)',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: '0.5px solid var(--border)',
        boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.06)' : 'none',
        transition: 'background 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease',
      }}>
        <div style={{
          maxWidth: 1440, width: '100%', margin: '0 auto',
          padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* ── Brand ── */}
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.08, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
              style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, #185FA5, #1D9E75)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 12px rgba(24,95,165,0.3)',
              }}>
              <Zap size={16} color="#fff" strokeWidth={2.5} />
            </motion.div>
            <span style={{
              fontSize: 18, fontWeight: 700,
              background: 'linear-gradient(135deg, #185FA5, #1D9E75)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>SMAART</span>
          </NavLink>

          {/* ── Desktop Links ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            '@media (max-width: 768px)': { display: 'none' },
          }}
            className="desktop-nav-links"
          >
            {navLinks.map(item => <PremiumNavLink key={item.to} item={item} />)}
          </div>

          {/* ── Right Controls ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              style={{
                width: 36, height: 36, border: '0.5px solid var(--border)',
                borderRadius: 10, background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </motion.div>
            </motion.button>

            {isAuthenticated ? (
              /* ── User Menu ── */
              <div ref={menuRef} style={{ position: 'relative' }}>
                <motion.button
                  onClick={() => setMenuOpen(v => !v)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '5px 12px 5px 5px', borderRadius: 10,
                    border: '0.5px solid var(--border)',
                    background: menuOpen ? 'var(--bg-secondary)' : 'transparent',
                    cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)',
                    transition: 'all 0.2s ease',
                  }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'linear-gradient(135deg, #185FA5, #1D9E75)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff',
                    boxShadow: '0 2px 8px rgba(24,95,165,0.25)',
                  }}>{initials}</div>
                  <span style={{
                    maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', fontWeight: 500,
                  }}>
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </span>
                  <motion.div animate={{ rotate: menuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={13} />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute', right: 0, top: '100%', marginTop: 8,
                        background: 'var(--bg-primary)',
                        backdropFilter: 'blur(20px)',
                        border: '0.5px solid var(--border)',
                        borderRadius: 12, padding: 6, minWidth: 200,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      }}>
                      {/* User info header */}
                      <div style={{
                        padding: '10px 14px 8px', borderBottom: '0.5px solid var(--border)',
                        marginBottom: 4,
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {user?.name || 'User'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          {user?.email || 'No email'}
                          {user?.role && (
                            <span style={{
                              fontSize: 9, fontWeight: 600,
                              background: 'linear-gradient(135deg, #185FA5, #1D9E75)',
                              color: '#fff', padding: '2px 8px', borderRadius: 6,
                              textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>{user.role}</span>
                          )}
                        </div>
                      </div>

                      {/* Menu items */}
                      {[
                        { label: 'Profile', icon: <User size={14} />, action: () => { setMenuOpen(false); navigate('/passport'); } },
                        { label: 'Dashboard', icon: <LayoutDashboard size={14} />, action: () => { setMenuOpen(false); navigate('/dashboard'); } },
                      ].map(item => (
                        <motion.button key={item.label} onClick={item.action}
                          whileHover={{ backgroundColor: 'var(--bg-secondary)' }}
                          style={{
                            width: '100%', padding: '9px 14px', border: 'none',
                            background: 'transparent', display: 'flex', alignItems: 'center',
                            gap: 10, fontSize: 13, color: 'var(--text-primary)',
                            cursor: 'pointer', borderRadius: 8, textAlign: 'left',
                            fontWeight: 450, transition: 'background 0.15s',
                          }}>{item.icon}{item.label}</motion.button>
                      ))}

                      <div style={{ borderTop: '0.5px solid var(--border)', margin: '4px 0' }} />

                      <motion.button onClick={handleLogout}
                        whileHover={{ backgroundColor: 'rgba(220,38,38,0.08)' }}
                        style={{
                          width: '100%', padding: '9px 14px', border: 'none',
                          background: 'transparent', display: 'flex', alignItems: 'center',
                          gap: 10, fontSize: 13, color: 'var(--text-danger, #dc2626)',
                          cursor: 'pointer', borderRadius: 8, textAlign: 'left', fontWeight: 450,
                        }}>
                        <LogOut size={14} /> Sign Out
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Not logged in ── */
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                className="desktop-auth-buttons"
              >
                <NavLink to="/login" style={{
                  fontSize: 13, fontWeight: 500,
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  padding: '7px 14px', borderRadius: 8,
                  transition: 'color 0.2s',
                }}>Sign In</NavLink>
                <NavLink to="/onboarding" style={{
                  fontSize: 13, fontWeight: 600,
                  background: 'linear-gradient(135deg, #185FA5, #1D9E75)',
                  color: '#fff', borderRadius: 9999,
                  padding: '8px 20px', textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  boxShadow: '0 2px 12px rgba(24,95,165,0.25)',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}>
                  <Zap size={13} /> Get Started
                </NavLink>
              </div>
            )}

            {/* ── Mobile hamburger ── */}
            <motion.button
              onClick={() => setMobileOpen(v => !v)}
              whileTap={{ scale: 0.9 }}
              className="mobile-menu-btn"
              style={{
                display: 'none', width: 36, height: 36, border: '0.5px solid var(--border)',
                borderRadius: 10, background: 'var(--bg-secondary)',
                color: 'var(--text-primary)', cursor: 'pointer',
                alignItems: 'center', justifyContent: 'center',
              }}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>
        </div>

        {/* ── Mobile Slide-Down ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                overflow: 'hidden',
                borderTop: '0.5px solid var(--border)',
                background: 'var(--bg-primary)',
              }}>
              <div style={{ padding: '12px 24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {navLinks.map(item => (
                  <NavLink key={item.to} to={item.to} end={item.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontSize: 14, fontWeight: isActive ? 600 : 450,
                      color: isActive ? 'var(--text-info)' : 'var(--text-primary)',
                      textDecoration: 'none', padding: '10px 14px', borderRadius: 10,
                      background: isActive ? 'var(--bg-info)' : 'transparent',
                    })}>
                    {item.icon}{item.label}
                  </NavLink>
                ))}

                {!isAuthenticated && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <NavLink to="/login" onClick={() => setMobileOpen(false)}
                      style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 500, padding: '10px', borderRadius: 10, border: '0.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', textDecoration: 'none' }}>
                      Sign In
                    </NavLink>
                    <NavLink to="/onboarding" onClick={() => setMobileOpen(false)}
                      style={{ flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 600, padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg, #185FA5, #1D9E75)', color: '#fff', textDecoration: 'none' }}>
                      Get Started
                    </NavLink>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Responsive CSS (injected once) ── */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav-links { display: none !important; }
          .desktop-auth-buttons { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        :root {
          --nav-glass-rgb: 255,255,255;
        }
        .dark {
          --nav-glass-rgb: 14,14,14;
        }
      `}</style>

      {/* ── Main ── */}
      <main style={{ flexGrow: 1, width: '100%', padding: 0 }}>
        {children}
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '0.5px solid var(--border)', padding: '20px 24px', marginTop: 32 }}>
        <div style={{
          maxWidth: 1440, margin: '0 auto', padding: '0 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 12, color: 'var(--text-secondary)',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 20, height: 20, borderRadius: 6,
              background: 'linear-gradient(135deg, #185FA5, #1D9E75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 600, color: '#fff',
            }}>S</div>
            SMAART © 2026. All rights reserved.
          </span>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy</a>
            <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
