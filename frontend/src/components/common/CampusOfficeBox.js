import React, { useEffect, useState } from 'react';
import { getOfficeInfo } from '../../utils/api';

// Fallback shown while loading or if the request fails, so the box never
// renders blank/broken. Matches the backend's own default values.
const DEFAULT_OFFICE = {
  officeLocation: 'Room No 405, Campus Office',
  officeEmail: 'lostfound@college.edu',
  officePhone: '+91-XXXXXXXXXX',
};

/**
 * Public "Campus Lost & Found Office" info box. Shown on both reporting
 * forms and both item-view pages. Always fetches the latest values from the
 * public /api/settings/office endpoint so admin edits appear everywhere
 * without a redeploy — never shows a reporter's private contact details.
 */
export default function CampusOfficeBox() {
  const [office, setOffice] = useState(DEFAULT_OFFICE);

  useEffect(() => {
    let cancelled = false;
    getOfficeInfo()
      .then(res => {
        if (!cancelled && res.data?.office) setOffice(res.data.office);
      })
      .catch(() => {
        // Keep the default fallback values on failure.
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      role="note"
      aria-label="Campus Lost & Found Office"
      style={{
        background: 'var(--gold-bg)',
        border: '1px solid var(--border-bright)',
        borderRadius: 12,
        padding: '16px 18px',
        margin: '20px 0',
      }}
    >
      <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 10 }}>
        <span aria-hidden="true">🏫</span> Campus Lost &amp; Found Office
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <span aria-hidden="true">📍</span> {office.officeLocation}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <span aria-hidden="true">✉️</span> {office.officeEmail}
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <span aria-hidden="true">📞</span> {office.officePhone}
        </p>
      </div>
    </div>
  );
}
