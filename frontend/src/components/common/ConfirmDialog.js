import React from 'react';

/**
 * Reusable confirmation dialog. Replaces window.confirm() with a styled
 * modal consistent with the rest of the app, and supports a "danger"
 * variant for destructive actions (permanent delete).
 *
 * Usage:
 *   const [confirmState, setConfirmState] = useState(null);
 *   setConfirmState({ title, message, onConfirm, danger: true });
 *   <ConfirmDialog {...confirmState} onCancel={() => setConfirmState(null)} />
 */
export default function ConfirmDialog({
  open = true,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{
              width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              background: danger ? 'var(--lost-bg)' : 'var(--gold-bg)',
            }}>
              {danger ? '⚠️' : '❓'}
            </span>
            <h3 id="confirm-dialog-title" style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {title}
            </h3>
          </div>

          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
            {message}
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn-ghost"
              style={{ padding: '9px 18px', fontSize: 13.5 }}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={danger ? 'btn-danger' : 'btn-primary'}
              style={{ padding: '9px 18px', fontSize: 13.5 }}
            >
              {loading ? 'Working…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
