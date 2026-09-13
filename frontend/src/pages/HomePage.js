import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageLayout from '../components/layout/PageLayout';
import ItemCard from '../components/items/ItemCard';
import ItemModal from '../components/items/ItemModal';
import SkeletonCard from '../components/common/SkeletonCard';
import { getLostItems, getFoundItems, searchItems } from '../utils/api';
import { CATEGORIES, sortItems } from '../utils/helpers';

const EmptyState = ({ type }) => (
  <div style={{ textAlign: 'center', padding: '48px 20px' }}>
    <div style={{ fontSize: 48, marginBottom: 14, opacity: 0.6 }}>{type === 'lost' ? '🔍' : '📭'}</div>
    <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-muted)', marginBottom: 6 }}>
      No {type} items yet
    </p>
    <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
      {type === 'lost' ? 'Lost something? Report it above.' : 'Found something? Help someone out!'}
    </p>
  </div>
);


export default function HomePage() {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [activeCategory, setActiveCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || 'all';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();

  const applySort = useCallback((lost, found, sortKey) => {
    return {
      lost: sortItems(lost, sortKey, 'lost'),
      found: sortItems(found, sortKey, 'found'),
    };
  }, []);

  const fetchItems = useCallback(async (currentFilters = filters, sortKey = filters.sort) => {
    setLoading(true);
    try {
      const params = {};
      const cat = currentFilters.category || activeCategory;
      if (cat && cat !== 'all') params.category = cat;

      const [lostRes, foundRes] = await Promise.all([
        getLostItems(params),
        getFoundItems(params),
      ]);

      const { lost, found } = applySort(
        lostRes.data.items || [],
        foundRes.data.items || [],
        sortKey
      );

      setLostItems(lost);
      setFoundItems(found);
    } catch {
      toast.error('Failed to load items. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [activeCategory, filters, applySort]);

  const handleSearch = useCallback(async (q, currentFilters = filters) => {
    setSearchQuery(q);
    const hasFilters = currentFilters.category || currentFilters.type || currentFilters.dateFrom || currentFilters.dateTo || currentFilters.sort;

    if (!q && !hasFilters) {
      fetchItems(currentFilters);
      return;
    }

    setLoading(true);
    try {
      const params = { q, ...currentFilters };
      if (activeCategory !== 'all' && !params.category) params.category = activeCategory;
      const res = await searchItems(params);

      const { lost, found } = applySort(
        res.data.lostItems || [],
        res.data.foundItems || [],
        currentFilters.sort
      );

      // Apply type filter client-side if needed
      const typeFilter = currentFilters.type;
      setLostItems(typeFilter === 'found' ? [] : lost);
      setFoundItems(typeFilter === 'lost' ? [] : found);
    } catch {
      toast.error('Search failed.');
    } finally {
      setLoading(false);
    }
  }, [filters, activeCategory, fetchItems, applySort]);

  const handleFilterChange = useCallback((f) => {
    setFilters(f);
    if (f.category && f.category !== 'all') setActiveCategory(f.category);
    else if (f.category === 'all') setActiveCategory('all');
    handleSearch(searchQuery, f);
  }, [searchQuery, handleSearch]);

  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(cat);
    const updated = { ...filters, category: cat };
    setFilters(updated);
    handleSearch(searchQuery, updated);
  }, [filters, searchQuery, handleSearch]);

  useEffect(() => { fetchItems(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openModal = (item, type) => { setSelectedItem(item); setSelectedType(type); };
  const closeModal = () => { setSelectedItem(null); setSelectedType(null); };

  const stats = {
    lost: lostItems.length,
    found: foundItems.length,
    matches: lostItems.filter(i => i.matched).length,
  };

  return (
    <PageLayout
      showSidebar
      activeCategory={activeCategory}
      onCategoryChange={handleCategoryChange}
      onSearch={handleSearch}
      onFilterChange={handleFilterChange}
      filters={filters}
    >
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section style={{ padding: '64px 20px 48px', textAlign: 'center' }} className="animate-fade-in">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <img
              className="logo-hover"
              src="/logos/lf-logo-circle.png"
              alt="Lost & Found Campus Portal"
              style={{ width: 'min(180px, 40vw)', height: 'min(180px, 40vw)', objectFit: 'contain' }}
            />
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 999,
            background: 'var(--gold-bg)', border: '1px solid var(--border-bright)',
            fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 20,
          }}>
            🎓 Campus-Verified Lost &amp; Found Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800,
            color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: 16,
            letterSpacing: '-0.02em',
          }}>
            Lost something on campus?<br />
            <span className="gradient-text">Let&rsquo;s find it together.</span>
          </h1>

          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 32px' }}>
            A secure, admin-verified portal that reconnects students, faculty, and staff with
            their belongings — from ID cards to electronics — in a few simple steps.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/report-lost')} className="btn-primary">
              😢 Report a Lost Item
            </button>
            <button
              onClick={() => navigate('/report-found')}
              className="btn-ghost"
              style={{ padding: '11px 24px', fontSize: 14, fontWeight: 600, borderColor: 'var(--border-bright)' }}
            >
              ✅ Report a Found Item
            </button>
          </div>

          <a
            href="#browse"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 28, fontSize: 13, color: 'var(--text-dim)', textDecoration: 'none' }}
          >
            Browse current listings ↓
          </a>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section style={{ padding: '0 20px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridGap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <StatCard icon="😢" label="Lost Items Reported" count={stats.lost} color="var(--lost)" />
          <StatCard icon="✅" label="Found Items Reported" count={stats.found} color="var(--found)" />
          <StatCard icon="🎯" label="Successful Matches" count={stats.matches} color="var(--match)" />
          <StatCard icon="🏫" label="Campus Community" count="10,000+" color="var(--accent)" />
        </div>
      </section>

      {/* Browse Bar */}
      <div id="browse" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', scrollMarginTop: 72 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Browse Listings</p>
            <p className="section-label">Filter by category</p>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.slice(0, 5).map(cat => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                style={{
                  padding: '4px 12px', borderRadius: 999, fontSize: 12,
                  cursor: 'pointer', transition: 'all 0.18s',
                  background: activeCategory === cat.value ? 'var(--gold-bg)' : 'transparent',
                  border: `1px solid ${activeCategory === cat.value ? 'var(--border-bright)' : 'var(--border)'}`,
                  color: activeCategory === cat.value ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px' }}>
        {(searchQuery || Object.values(filters).some(v => v && v !== 'all')) && (
          <div style={{ marginBottom: 16, padding: '10px 16px', background: 'var(--gold-bg)', borderRadius: 10, border: '1px solid var(--border-bright)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }} className="animate-fade-in">
            <span style={{ fontSize: 14 }}>🔍</span>
            <span style={{ fontSize: 13, color: 'var(--accent)' }}>
              {searchQuery ? <>Results for: <strong>"{searchQuery}"</strong></> : 'Filtered results'}
              {filters.sort && <> · Sorted: <strong>{filters.sort}</strong></>}
            </span>
            <button
              onClick={() => { setSearchQuery(''); setFilters({}); fetchItems({}); }}
              style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Clear ×
            </button>
          </div>
        )}

        <div className="two-col-grid">
          {/* Lost Items */}
          <div>
            <div className="col-header lost-col" style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>😢</span>
              <span>Lost Items</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, opacity: 0.7 }}>
                {lostItems.length} item{lostItems.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gap: 14 }}>
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : lostItems.length === 0 ? (
              <EmptyState type="lost" />
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {lostItems.map((item, i) => (
                  <div key={item._id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <ItemCard item={item} type="lost" onClick={() => openModal(item, 'lost')} />
                  </div>
                ))}
              </div>
            )}

            {!loading && (
              <button
                onClick={() => navigate('/report-lost')}
                style={{ width: '100%', marginTop: 16, padding: '14px', borderRadius: 12, background: 'var(--lost-bg)', border: '2px dashed rgba(185,28,28,0.3)', color: 'var(--lost)', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s' }}
              >
                + Report a Lost Item
              </button>
            )}
          </div>

          {/* Found Items */}
          <div>
            <div className="col-header found-col" style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>✅</span>
              <span>Found Items</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, opacity: 0.7 }}>
                {foundItems.length} item{foundItems.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div style={{ display: 'grid', gap: 14 }}>
                {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : foundItems.length === 0 ? (
              <EmptyState type="found" />
            ) : (
              <div style={{ display: 'grid', gap: 14 }}>
                {foundItems.map((item, i) => (
                  <div key={item._id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <ItemCard item={item} type="found" onClick={() => openModal(item, 'found')} />
                  </div>
                ))}
              </div>
            )}

            {!loading && (
              <button
                onClick={() => navigate('/report-found')}
                style={{ width: '100%', marginTop: 16, padding: '14px', borderRadius: 12, background: 'var(--found-bg)', border: '2px dashed rgba(22,101,52,0.3)', color: 'var(--found)', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s' }}
              >
                + Report a Found Item
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedItem && (
        <ItemModal item={selectedItem} type={selectedType} onClose={closeModal} />
      )}
    </PageLayout>
  );
}

function StatCard({ icon, label, count, color }) {
  return (
    <div className="commitment-card" style={{ textAlign: 'center', padding: '20px 14px' }}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontWeight: 800, fontSize: 24, color, marginBottom: 4 }}>{count}</p>
      <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{label}</p>
    </div>
  );
}
