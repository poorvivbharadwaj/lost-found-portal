import React from 'react';

/**
 * "Bring valid proof" notice, shown on both reporting forms and both
 * item-view pages, placed near the Campus Office info box. This is purely
 * informational — it never blocks form submission and is not styled as a
 * form error.
 */
export default function ValidProofNotice() {
  return (
    <div
      role="note"
      aria-label="Proof of ownership notice"
      style={{
        background: 'rgba(180, 146, 42, 0.10)',
        border: '1px solid rgba(180, 146, 42, 0.35)',
        borderRadius: 12,
        padding: '14px 18px',
        margin: '12px 0 20px',
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
      }}
    >
      <span aria-hidden="true" style={{ fontSize: 16, lineHeight: '20px' }}>⚠️</span>
      <div>
        <p style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, margin: '0 0 4px', lineHeight: 1.5 }}>
          Important: Please bring a valid college ID card or appropriate proof of ownership when coming to collect an item.
        </p>
        <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
          The item will be released only after the administrator verifies the provided proof.
        </p>
      </div>
    </div>
  );
}
