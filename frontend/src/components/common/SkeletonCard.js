import React from 'react';

export default function SkeletonCard() {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <div className="skeleton" style={{ height: 160 }} />
      <div style={{ padding: '14px 16px' }}>
        <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 18, width: '80%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 13, width: '100%', marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 13, width: '70%', marginBottom: 14 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton" style={{ height: 12, width: '35%' }} />
          <div className="skeleton" style={{ height: 12, width: '25%' }} />
        </div>
      </div>
    </div>
  );
}
