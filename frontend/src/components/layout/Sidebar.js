import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const navItems = [
  { icon: '⊞', label: 'Dashboard', category: 'all' },
  { icon: '🪪', label: 'ID Cards', category: 'id_card' },
  { icon: '📱', label: 'Electronics', category: 'electronics' },
  { icon: '📚', label: 'Academic Items', category: 'books' },
  { icon: '📄', label: 'Personal Documents', category: 'documents' },
  { icon: '📦', label: 'Other Items', category: 'other' },
];

const pageLinks = [
  { icon: 'ℹ️', label: 'About Us', to: '/about' },
  { icon: '👥', label: 'Team Udbhav', to: '/team' },
];

export default function Sidebar({ isOpen, onClose, activeCategory, onCategoryChange }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCategory = (cat) => {
    if (onCategoryChange) {
      onCategoryChange(cat);
    } else {
      navigate(`/?category=${cat}`);
    }
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 40 }}
        />
      )}

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img className="logo-hover" src="/logos/lf-logo-circle.png" alt="SNPSU" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
            <div>
              <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.2 }}>SNPSU</p>
              <p style={{ fontSize: 10, color: 'var(--text-dim)' }}>Sapthagiri NPS University</p>
            </div>
          </div>
          <button onClick={onClose} className="theme-toggle" style={{ width: 30, height: 30 }}>
            <CloseIcon />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          <p className="section-label" style={{ padding: '4px 20px 8px' }}>Browse by Category</p>

          {navItems.map((item) => (
            <button
              key={item.category}
              onClick={() => handleCategory(item.category)}
              className={`sidebar-item ${activeCategory === item.category ? 'active' : ''}`}
            >
              <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{item.icon}</span>
              <span>{item.label}</span>
              {activeCategory === item.category && (
                <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
              )}
            </button>
          ))}

          <div style={{ height: 1, background: 'var(--border)', margin: '12px 20px' }} />

          <p className="section-label" style={{ padding: '4px 20px 8px' }}>Pages</p>

          {pageLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={`sidebar-item ${location.pathname === link.to ? 'active' : ''}`}
            >
              <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}

          <div style={{ height: 1, background: 'var(--border)', margin: '12px 20px' }} />

          <p className="section-label" style={{ padding: '4px 20px 8px' }}>Report</p>

          <button onClick={() => { navigate('/report-lost'); onClose(); }} className="sidebar-item">
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>😢</span>
            <span>Report Lost Item</span>
          </button>

          <button onClick={() => { navigate('/report-found'); onClose(); }} className="sidebar-item">
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>🎉</span>
            <span>Report Found Item</span>
          </button>

          <div style={{ height: 1, background: 'var(--border)', margin: '12px 20px' }} />

          <p className="section-label" style={{ padding: '4px 20px 8px' }}>Admin</p>

          <button onClick={() => { navigate('/admin'); onClose(); }} className="sidebar-item">
            <span style={{ fontSize: 18, width: 24, textAlign: 'center' }}>🔐</span>
            <span>Admin Panel</span>
          </button>
        </div>

        <div style={{ padding: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            Lost & Found ·{' '}
            <Link to="/team" onClick={onClose} className="footer-inline-link">Team Udbhav</Link>
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>Room 405 · lostfound@college.edu</p>
        </div>
      </div>
    </>
  );
}
