import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { changeAdminCredentials } from '../../utils/api';
import ConfirmDialog from '../common/ConfirmDialog';

const EMPTY_FORM = {
  currentUsername: '',
  currentPassword: '',
  newUsername: '',
  newPassword: '',
  confirmNewPassword: '',
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

function PasswordField({ label, value, onChange, show, onToggleShow, placeholder, autoComplete }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          style={{ ...inputStyle, paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer',
            padding: 4, fontSize: 15, lineHeight: 1,
          }}
        >
          {show ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );
}

/**
 * "Change Admin Credentials" form, shown inside the Admin Dashboard's
 * Settings section. Requires the admin to already be authenticated and to
 * re-enter their current username/password before any change is applied.
 */
export default function ChangeCredentialsModal({ onClose, onCredentialsChanged }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const update = (key) => (e) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
    setError('');
  };

  const hasNewUsername = form.newUsername.trim().length > 0;
  const hasNewPassword = form.newPassword.length > 0;

  const validate = () => {
    if (!form.currentUsername.trim() || !form.currentPassword) {
      return 'Current username and password are required.';
    }
    if (!hasNewUsername && !hasNewPassword) {
      return 'Enter a new username or a new password to update.';
    }
    if (hasNewPassword) {
      if (form.newPassword.length < 6) {
        return 'New password must be at least 6 characters long.';
      }
      if (form.newPassword !== form.confirmNewPassword) {
        return 'New password and confirmation do not match.';
      }
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmedSave = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await changeAdminCredentials({
        currentUsername: form.currentUsername.trim(),
        currentPassword: form.currentPassword,
        newUsername: hasNewUsername ? form.newUsername.trim() : undefined,
        newPassword: hasNewPassword ? form.newPassword : undefined,
        confirmNewPassword: hasNewPassword ? form.confirmNewPassword : undefined,
      });

      if (res.data?.success) {
        setConfirmOpen(false);
        toast.success('Admin credentials updated successfully. Please log in again.');
        onCredentialsChanged();
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to update credentials right now.';
      setError(message);
      toast.error(message);
      setConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="modal-overlay"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-credentials-title"
      >
        <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: 26 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 id="change-credentials-title" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                ⚙️ Change Admin Credentials
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close settings"
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 20, cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 20 }}>
              Update your username and/or password. You'll be logged out and asked to sign in again once saved.
            </p>

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
                <label style={labelStyle}>Current Username</label>
                <input
                  type="text"
                  value={form.currentUsername}
                  onChange={update('currentUsername')}
                  placeholder="Enter current username"
                  autoComplete="username"
                  style={inputStyle}
                />
              </div>

              <PasswordField
                label="Current Password"
                value={form.currentPassword}
                onChange={update('currentPassword')}
                show={showCurrentPass}
                onToggleShow={() => setShowCurrentPass(v => !v)}
                placeholder="Enter current password"
                autoComplete="current-password"
              />

              <div style={{ height: 1, background: 'var(--border)' }} />
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                New Credentials (optional — fill in what you want to change)
              </p>

              <div>
                <label style={labelStyle}>New Username</label>
                <input
                  type="text"
                  value={form.newUsername}
                  onChange={update('newUsername')}
                  placeholder="Leave blank to keep current username"
                  autoComplete="off"
                  style={inputStyle}
                />
              </div>

              <PasswordField
                label="New Password"
                value={form.newPassword}
                onChange={update('newPassword')}
                show={showNewPass}
                onToggleShow={() => setShowNewPass(v => !v)}
                placeholder="Leave blank to keep current password"
                autoComplete="new-password"
              />

              {hasNewPassword && (
                <PasswordField
                  label="Confirm New Password"
                  value={form.confirmNewPassword}
                  onChange={update('confirmNewPassword')}
                  show={showConfirmPass}
                  onToggleShow={() => setShowConfirmPass(v => !v)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '10px 18px' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '10px 18px' }}>
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {confirmOpen && (
        <ConfirmDialog
          title="Update admin credentials?"
          message="You will be logged out immediately and need to log in again with the new credentials."
          confirmLabel="Yes, update"
          loading={loading}
          onConfirm={handleConfirmedSave}
          onCancel={() => !loading && setConfirmOpen(false)}
        />
      )}
    </>
  );
}
