import React, { useEffect, useState } from 'react';
import { formatDate, formatDateTime, getCategoryIcon, getCategoryLabel } from '../../utils/helpers';
import { getOfficeInfo } from '../../utils/api';
import ValidProofNotice from '../common/ValidProofNotice';

const DEFAULT_OFFICE = {
  officeLocation: 'Room No 405, Campus Office',
  officeEmail: 'lostfound@college.edu',
  officePhone: '+91-XXXXXXXXXX',
};

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function ItemModal({ item, type, onClose }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [office, setOffice] = useState(DEFAULT_OFFICE);

  useEffect(() => {
    let cancelled = false;
    getOfficeInfo()
      .then(res => {
        if (!cancelled && res.data?.office) setOffice(res.data.office);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key !== 'Escape') return;
      if (lightboxOpen) setLightboxOpen(false);
      else onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, lightboxOpen]);

  if (!item) return null;
  const isLost = type === 'lost';

  const shareUrl = window.location.origin;
  const shareTitle = item.itemName || (isLost ? 'Lost Item' : 'Found Item');
  // Reporter contact details are private and are never returned by the
  // public API, so sharing/contact text always points to the public
  // Campus Office information instead.
  const shareText = `${shareTitle}\n\n${item.description}\n\nContact: ${office.officeEmail} / ${office.officePhone} (${office.officeLocation})\n\nView this portal: ${shareUrl}`;

  const handleShareClick = (method) => {
    const encoded = encodeURIComponent(shareText);
    if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
      return;
    }
    if (method === 'email') {
      window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encoded}`, '_blank');
      return;
    }
    if (method === 'instagram') {
      window.open('https://www.instagram.com/', '_blank');
      navigator.clipboard?.writeText(shareText).catch(() => {});
      return;
    }
    if (method === 'copy') {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        alert('Link and details copied to clipboard');
      }).catch(() => {
        alert('Copy failed, please try manually');
      });
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label="Item details">
        {/* Header: badges + close button (consistent whether or not there's an image) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 0' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className={`badge badge-${type}`}>{isLost ? '😢 Lost' : '✅ Found'}</span>
            {item.matched && <span className="badge badge-match">🎯 Potential Match Found</span>}
          </div>
          <button onClick={onClose} aria-label="Close dialog" style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CloseIcon />
          </button>
        </div>

        {/* Full item image — contained (never cropped), click to view full-screen */}
        {item.imageUrl && (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="View full image"
            style={{
              width: '100%', maxHeight: 340, margin: '16px 0 0', padding: 0, border: 'none',
              background: 'var(--bg-elevated)', cursor: 'zoom-in', display: 'block',
              overflow: 'hidden', appearance: 'none',
            }}
          >
            <img
              src={item.imageUrl}
              alt={item.itemName || 'Item'}
              style={{ width: '100%', maxHeight: 340, objectFit: 'contain', display: 'block', margin: '0 auto' }}
            />
          </button>
        )}

        {/* Content */}
        <div style={{ padding: 24 }}>
          {/* Title */}
          <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', marginBottom: 4 }}>
            {shareTitle}
          </h2>

          {/* Category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
            <span style={{ fontSize: 14 }}>{getCategoryIcon(item.category)}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: "'Inter'", textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {getCategoryLabel(item.category)}
            </span>
          </div>

          {/* Description */}
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: "'Inter'", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Description</p>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{item.description}</p>
          </div>

          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 16 }}>
            <DetailBox icon="📅" label={isLost ? 'Lost On' : 'Found On'} value={formatDate(isLost ? item.lostDate : item.foundDate || item.createdAt)} />
            <DetailBox icon="🕒" label="Reported On" value={formatDateTime(item.createdAt)} />
            <DetailBox icon="📍" label="Location" value={isLost ? (item.lastSeenLocation || 'Campus') : (item.foundLocation || 'Room No 405')} />
            {isLost && <DetailBox icon="👤" label="Reported By" value={item.reporterName || 'Anonymous'} />}
            {!isLost && <DetailBox icon="👤" label="Found By" value={item.finderName || 'Anonymous'} />}
            <DetailBox icon="🏷️" label="Status" value={item.matched ? 'Match Found!' : (item.approved ? 'Approved' : 'Pending')} />
          </div>

          {/* Campus Office Info — public item pages show only official
              office contact details, never the reporter's private email
              or phone (those are admin-only, in the protected dashboard). */}
          <div style={{ background: 'var(--gold-bg)', borderRadius: 12, padding: 16, border: '1px solid var(--border-bright)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: "'Inter'", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 700 }}>
              🏫 Campus Lost &amp; Found Office
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <ContactRow icon="📍" value={office.officeLocation} />
              <ContactRow icon="✉️" value={office.officeEmail} />
              <ContactRow icon="📞" value={office.officePhone} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <ValidProofNotice />
          </div>


          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {['whatsapp', 'email', 'instagram', 'copy'].map(method => {
              const label = method === 'whatsapp' ? 'WhatsApp' : method === 'email' ? 'Email' : method === 'instagram' ? 'Instagram' : 'Copy';
              const bg = method === 'whatsapp' ? '#166534' : method === 'email' ? '#B4922A' : method === 'instagram' ? '#ec4899' : '#94a3b8';
              return (
                <button
                  key={method}
                  onClick={() => handleShareClick(method)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    background: bg,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Share via {label}
                </button>
              );
            })}
          </div>

          {/* Match Notice */}
          {item.matched && (
            <div style={{ marginTop: 14, background: 'rgba(139,92,246,0.1)', borderRadius: 12, padding: 14, border: '1px solid rgba(139,92,246,0.25)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🎯</span>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#a78bfa', marginBottom: 2 }}>Potential Match Found!</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>A similar item has been reported. Please visit Room 405 to verify.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-screen lightbox — shows the complete original image, never cropped */}
      {lightboxOpen && item.imageUrl && (
        <div
          role="presentation"
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            aria-label="Close full image"
            style={{
              position: 'fixed', top: 18, right: 18, width: 40, height: 40, borderRadius: 10,
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 301,
            }}
          >
            <CloseIcon />
          </button>
          <img
            src={item.imageUrl}
            alt={item.itemName || 'Item'}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', display: 'block' }}
          />
        </div>
      )}
    </div>
  );
}

function DetailBox({ icon, label, value }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border)' }}>
      <p style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: "'Inter'", textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{icon} {label}</p>
      <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{value || '—'}</p>
    </div>
  );
}

function ContactRow({ icon, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: "'Inter'" }}>{value}</span>
    </div>
  );
}
