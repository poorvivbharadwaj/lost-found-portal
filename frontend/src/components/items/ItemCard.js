import React from 'react';
import { formatDateTime, timeAgo, truncate, getCategoryIcon } from '../../utils/helpers';

const PlaceholderImg = ({ category, type }) => (
  <div style={{
    width: '100%', height: '100%',
    background: type === 'lost'
      ? 'linear-gradient(135deg, rgba(185,28,28,0.08), rgba(185,28,28,0.03))'
      : 'linear-gradient(135deg, rgba(22,101,52,0.08), rgba(22,101,52,0.03))',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 6,
  }}>
    <span style={{ fontSize: 32 }}>{getCategoryIcon(category)}</span>
    <p style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: "'Inter'", textTransform: 'uppercase', letterSpacing: '0.08em' }}>No Image</p>
  </div>
);

export default function ItemCard({ item, type, onClick }) {
  const isLost = type === 'lost';
  const accentColor = isLost ? 'var(--lost)' : 'var(--found)';
  const accentBg = isLost ? 'var(--lost-bg)' : 'var(--found-bg)';
  const borderHover = isLost ? 'rgba(185,28,28,0.3)' : 'rgba(22,101,52,0.3)';

  const name = item.itemName || (isLost ? 'Lost Item' : 'Found Item');
  const desc = item.description;
  const reportedAt = item.createdAt;

  return (
    <div
      className={`item-card glass ${isLost ? 'lost-card' : 'found-card'}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${name}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
      style={{ borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}
    >
      {/* Image */}
      <div style={{ width: '100%', height: 160, overflow: 'hidden', position: 'relative', background: 'var(--bg-elevated)', flexShrink: 0 }}>
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
        ) : null}
        <div style={{ display: item.imageUrl ? 'none' : 'flex', width: '100%', height: '100%' }}>
          <PlaceholderImg category={item.category} type={type} />
        </div>

        {/* Type badge overlay */}
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <span className={`badge badge-${type}`}>
            {isLost ? '😢 Lost' : '✅ Found'}
          </span>
        </div>

        {/* Matched badge */}
        {item.matched && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}>
            <span className="badge badge-match">🎯 Match</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px' }}>
        {/* Category tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 13 }}>{getCategoryIcon(item.category)}</span>
          <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: "'Inter'", textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {item.category?.replace('_', ' ') || 'other'}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: "'Inter', sans-serif", fontWeight: 700,
          fontSize: 15, color: 'var(--text-primary)',
          marginBottom: 6, lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {name}
        </h3>

        {/* Description */}
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {truncate(desc, 90)}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>📅</span>
            <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: "'Inter'" }}>
              {formatDateTime(reportedAt)}
            </span>
          </div>

          <span style={{
            fontSize: 11, color: accentColor,
            background: accentBg, padding: '2px 8px', borderRadius: 6,
          }}>
            {timeAgo(reportedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
