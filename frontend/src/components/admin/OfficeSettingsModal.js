import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getOfficeInfo, updateOfficeInfo } from '../../utils/api';

const DEFAULT_OFFICE = {
  officeLocation: 'Room No 405, Campus Office',
  officeEmail: 'lostfound@college.edu',
  officePhone: '+91-XXXXXXXXXX',
};

const inputStyle = {
  width: '100%',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  color: 'var(--text-primary)',
  padding: '11px 14px',
  fontSize: 14,
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: 6,
};

/**
 * "Campus Office Contact Information" editor, shown inside the existing
 * Admin Dashboard Settings area. Only an authenticated admin can reach this
 * (the panel that opens it is itself gated by the admin session), and the
 * update request goes through the protected PATCH /api/admin/settings/office
 * endpoint. This is intentionally kept separate from private reporter
 * contact details — it only ever touches the single global Settings
 * document (officeLocation / officeEmail / officePhone).
 */
export default function OfficeSettingsModal({ onClose }) {
  const [form, setForm] = useState(DEFAULT_OFFICE);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOfficeInfo()
      .then(res => {
        if (!cancelled && res.data?.office) setForm(res.data.office);
      })
      .catch(() => {
        // Fall back to the default values shown above if loading fails.
        if (!cancelled) setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const update = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.officeLocation?.trim()) return 'Office location is required.';
    if (!form.officeEmail?.trim()) return 'Office email is required.';
    if (!/^\S+@\S+\.\S+$/.test(form.officeEmail.trim())) return 'Enter a valid office email address.';
    if (!form.officePhone?.trim()) return 'Office phone is required.';
    if (!/^[0-9+\-\s()]{7,20}$/.test(form.officePhone.trim())) return 'Enter a valid office phone number.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await updateOfficeInfo({
        officeLocation: form.officeLocation.trim(),
        officeEmail: form.officeEmail.trim(),
        officePhone: form.officePhone.trim(),
      });
      if (res.data?.success) {
        toast.success('Campus Office information updated.');
        if (res.data.office) setForm(res.data.office);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to update office information right now.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="office-settings-title"
    >
      <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <h3 id="office-settings-title" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              🏫 Campus Office Contact Information
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close office settings"
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 20, cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 20 }}>
            This is the official public contact shown on reporting forms and item pages. It is completely separate from any reporter's private contact details.
          </p>

          {loadFailed && (
            <div style={{ padding: '10px 14px', background: 'var(--lost-bg)', border: '1px solid rgba(185,28,28,0.25)', borderRadius: 10, fontSize: 12.5, color: 'var(--lost)', marginBottom: 16 }}>
              ⚠ Could not load the current values — showing defaults. Saving will still work.
            </div>
          )}

          {initialLoading ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div className="spinner" style={{ width: 24, height: 24, border: '3px solid var(--border-bright)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto' }} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {error && (
                <div style={{
                  padding: '10px 14px',
                  background: 'var(--lost-bg)',
                  border: '1px solid rgba(185,28,28,0.25)',
                  borderRadius: 10, fontSize: 13, color: 'var(--lost)',
                  display: 'flex', gap: 8,
                }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <div>
                <label style={labelStyle}>Office Room / Location</label>
                <input
                  type="text"
                  value={form.officeLocation || ''}
                  onChange={update('officeLocation')}
                  placeholder="e.g. Room No 405, Campus Office"
                  style={inputStyle}
                  disabled={saving}
                />
              </div>

              <div>
                <label style={labelStyle}>Public Office Email</label>
                <input
                  type="email"
                  value={form.officeEmail || ''}
                  onChange={update('officeEmail')}
                  placeholder="lostfound@college.edu"
                  style={inputStyle}
                  disabled={saving}
                />
              </div>

              <div>
                <label style={labelStyle}>Public Office Phone</label>
                <input
                  type="tel"
                  value={form.officePhone || ''}
                  onChange={update('officePhone')}
                  placeholder="+91-XXXXXXXXXX"
                  style={inputStyle}
                  disabled={saving}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '10px 18px' }} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ padding: '10px 18px' }}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
