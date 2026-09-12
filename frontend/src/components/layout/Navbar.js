import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../../utils/helpers';
import ThemeToggle from '../common/ThemeToggle';
import LogoPlaceholder from '../common/LogoPlaceholder';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

const SORT_OPTIONS = [
  { value: '', label: 'Default (Newest)' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
];

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us', icon: <InfoIcon /> },
  { to: '/team', label: 'Team' },
  { to: '/notifications', label: '🔔 Notifications' },
];

export default function Navbar({
  onMenuToggle,
  onSearch,
  onFilterChange,
  filters = {},
  showSearch = true,
  showFilters = true,
}) {
  const [query, setQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const navigate = useNavigate();
  const location = useLocation();
  const filterRef = useRef(null);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilterPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(query.trim());
  };

  const handleFilterChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    if (onFilterChange) onFilterChange(updated);
  };

  const clearFilters = () => {
    setLocalFilters({});
    if (onFilterChange) onFilterChange({});
  };

  const activeFilterCount = Object.entries(localFilters).filter(
    ([k, v]) => v && v !== 'all' && v !== ''
  ).length;

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        transition: 'background 0.3s ease',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 64 }}>

            {/* Hamburger / Sidebar toggle */}
            <button
              onClick={onMenuToggle || (() => setMobileMenuOpen(v => !v))}
              className="theme-toggle"
              title="Menu"
              aria-label="Open menu"
            >
              {mobileMenuOpen && !onMenuToggle ? <CloseIcon /> : <MenuIcon />}
            </button>

            {/* College Logo */}
            <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <LogoPlaceholder type="college" width={38} height={38} />
                <div className="hide-sm">
                  <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    Lost <span style={{ color: 'var(--accent)' }}>&</span> Found
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>Campus Portal</p>
                </div>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hide-mobile" style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                >
                  {link.icon}{link.label}
                </Link>
              ))}
            </div>

            {/* Search */}
            {showSearch && (
              <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 420, position: 'relative', marginLeft: 'auto' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search items…"
                  className="input-field"
                  style={{ padding: '8px 36px 8px 36px', fontSize: 13 }}
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(''); if (onSearch) onSearch(''); }} aria-label="Clear search"
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 16 }}>
                    ×
                  </button>
                )}
              </form>
            )}

            {/* Filters */}
            {showFilters && (
              <div ref={filterRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setShowFilterPanel(v => !v)}
                  aria-label="Toggle filters"
                  aria-expanded={showFilterPanel}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 12px', borderRadius: 10,
                    background: showFilterPanel ? 'var(--gold-bg)' : 'var(--bg-elevated)',
                    border: `1px solid ${showFilterPanel ? 'var(--border-bright)' : 'var(--border)'}`,
                    color: showFilterPanel ? 'var(--accent)' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
                  }}
                >
                  <FilterIcon />
                  <span className="hide-sm">Filters</span>
                  {activeFilterCount > 0 && (
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {showFilterPanel && (
                  <div className="filter-panel">
                    <p className="section-label" style={{ marginBottom: 12 }}>Filters</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Category</label>
                        <select value={localFilters.category || 'all'} onChange={e => handleFilterChange('category', e.target.value)} className="input-field" style={{ padding: '8px 12px', fontSize: 13 }}>
                          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Type</label>
                        <select value={localFilters.type || 'all'} onChange={e => handleFilterChange('type', e.target.value)} className="input-field" style={{ padding: '8px 12px', fontSize: 13 }}>
                          <option value="all">All Items</option>
                          <option value="lost">Lost Only</option>
                          <option value="found">Found Only</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>From Date</label>
                        <input type="date" value={localFilters.dateFrom || ''} onChange={e => handleFilterChange('dateFrom', e.target.value)} className="input-field" style={{ padding: '8px 12px', fontSize: 13 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>To Date</label>
                        <input type="date" value={localFilters.dateTo || ''} onChange={e => handleFilterChange('dateTo', e.target.value)} className="input-field" style={{ padding: '8px 12px', fontSize: 13 }} />
                      </div>

                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                        <p className="section-label" style={{ marginBottom: 8 }}>Extras</p>
                        <select value={localFilters.sort || ''} onChange={e => handleFilterChange('sort', e.target.value)} className="input-field" style={{ padding: '8px 12px', fontSize: 13 }}>
                          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>

                      <button onClick={clearFilters} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={() => navigate('/report-lost')} className="hide-sm nav-cta"
                style={{ padding: '8px 12px', borderRadius: 10, cursor: 'pointer', background: 'var(--lost-bg)', color: 'var(--lost)', border: '1px solid rgba(185,28,28,0.25)', fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif", transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                + Lost
              </button>
              <button onClick={() => navigate('/report-found')} className="hide-sm nav-cta"
                style={{ padding: '8px 12px', borderRadius: 10, cursor: 'pointer', background: 'var(--found-bg)', color: 'var(--found)', border: '1px solid rgba(22,101,52,0.25)', fontSize: 12, fontWeight: 600, fontFamily: "'Inter',sans-serif", transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                + Found
              </button>
            </div>

            {/* Theme toggle — top right */}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Mobile dropdown menu (when no sidebar handler) */}
      {!onMenuToggle && (
        <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className={`nav-link ${location.pathname === link.to ? 'active' : ''}`} style={{ padding: '10px 14px', fontSize: 14 }}>
              {link.icon}{link.label}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          <button onClick={() => navigate('/report-lost')} style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--lost-bg)', color: 'var(--lost)', border: 'none', cursor: 'pointer', fontSize: 14, textAlign: 'left' }}>
            + Report Lost Item
          </button>
          <button onClick={() => navigate('/report-found')} style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--found-bg)', color: 'var(--found)', border: 'none', cursor: 'pointer', fontSize: 14, textAlign: 'left' }}>
            + Report Found Item
          </button>
        </div>
      )}
    </>
  );
}
