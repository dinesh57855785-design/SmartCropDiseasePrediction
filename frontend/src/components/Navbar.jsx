import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useLang } from '../contexts/LanguageContext';
import { tr } from '../i18n/translations';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  const navLinks = user ? [
    { to: '/',              label: tr(lang, 'nav_home') },
    { to: '/dashboard',     label: tr(lang, 'nav_dashboard') },
    { to: '/analyzer',      label: tr(lang, 'nav_analyzer') },
    { to: '/weather',       label: tr(lang, 'nav_weather') },
    { to: '/planner',       label: tr(lang, 'nav_planner') },
    { to: '/growth',        label: tr(lang, 'nav_growth') },
    { to: '/report',        label: tr(lang, 'nav_report') },
    { to: '/report-history',label: tr(lang, 'nav_history') },
    { to: '/chatbot',       label: tr(lang, 'nav_chatbot') },
  ] : [];

  return (
    <>
      <nav style={{
        background: 'linear-gradient(135deg, #1a2e1a 0%, #2d5a27 100%)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: '1.3rem',
            fontWeight: 800,
            color: '#7dd56f',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '-0.5px',
          }}>
            🌿 SmartCrop
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}
             className="navbar-desktop-links">
          {user ? (
            <>
              {navLinks.map(nl => (
                <Link key={nl.to} to={nl.to} style={linkStyle}>{nl.label}</Link>
              ))}
              <span style={{ color: '#aed6a8', fontSize: '0.85rem', fontWeight: 600 }}>
                👤 {user.username}
              </span>
              <button onClick={handleLogout} style={btnStyle}>{tr(lang, 'nav_logout')}</button>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>{tr(lang, 'nav_login')}</Link>
              <Link to="/register" style={{
                ...btnStyle,
                textDecoration: 'none',
                display: 'inline-block',
                textAlign: 'center',
              }}>{tr(lang, 'nav_register')}</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger button */}
        {user && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="navbar-hamburger"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#7dd56f',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
            aria-label="Menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        )}
      </nav>

      {/* Mobile slide-in drawer */}
      {menuOpen && user && (
        <div
          style={{
            position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', zIndex: 99,
          }}
          onClick={closeMenu}
        >
          <div
            style={{
              background: 'linear-gradient(180deg, #1a2e1a 0%, #0d1f0d 100%)',
              padding: '1rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
              borderBottom: '1px solid #2d5a27',
              animation: 'slideDown 0.2s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {navLinks.map(nl => (
              <Link
                key={nl.to}
                to={nl.to}
                onClick={closeMenu}
                style={{
                  ...linkStyle,
                  fontSize: '1rem',
                  padding: '0.65rem 0.5rem',
                  borderRadius: 8,
                  display: 'block',
                }}
              >
                {nl.label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid #2d5a27', marginTop: '0.5rem', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#aed6a8', fontSize: '0.9rem', fontWeight: 600 }}>
                👤 {user.username}
              </span>
              <button onClick={handleLogout} style={btnStyle}>{tr(lang, 'nav_logout')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive CSS for navbar */}
      <style>{`
        @media (max-width: 850px) {
          .navbar-desktop-links { display: none !important; }
          .navbar-hamburger { display: block !important; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

const linkStyle = {
  color: '#c8e6c2',
  textDecoration: 'none',
  fontWeight: 500,
  fontSize: '0.9rem',
  transition: 'color 0.2s',
};

const btnStyle = {
  background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '0.4rem 1rem',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'transform 0.15s, box-shadow 0.15s',
};
