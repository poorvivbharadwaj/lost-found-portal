import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import PageLayout from '../components/layout/PageLayout';
import OtpVerification from '../components/forms/OtpVerification';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../utils/api';
import { timeAgo } from '../utils/helpers';

const TYPE_META = {
  approved: { icon: '✅', badge: 'badge-approved', label: 'Approved' },
  rejected: { icon: '❌', badge: 'badge-rejected', label: 'Rejected' },
  archived: { icon: '📦', badge: 'badge-archived', label: 'Archived' },
  restored: { icon: '♻️', badge: 'badge-found', label: 'Restored' },
  match_found: { icon: '🎯', badge: 'badge-match', label: 'Match Found' },
};

export default function NotificationCenter() {
  const [email, setEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async (emailArg, tokenArg) => {
    setLoading(true);
    try {
      const res = await getNotifications(emailArg, tokenArg);
      if (res.data.success) {
        setNotifications(res.data.items || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVerified = (token) => {
    setVerificationToken(token);
    setVerifiedEmail(email.trim().toLowerCase());
    loadNotifications(email.trim().toLowerCase(), token);
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id, verifiedEmail, verificationToken);
      setNotifications(prev => prev.map(n => (n._id === id ? { ...n, read: true } : n)));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Unable to mark as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(verifiedEmail, verificationToken);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Unable to update notifications.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id, verifiedEmail, verificationToken);
      setNotifications(prev => {
        const target = prev.find(n => n._id === id);
        if (target && !target.read) setUnreadCount(c => Math.max(0, c - 1));
        return prev.filter(n => n._id !== id);
      });
      toast.success('Notification deleted.');
    } catch (err) {
      toast.error('Unable to delete notification.');
    }
  };

  return (
    <PageLayout showSidebar>
      <section style={{ padding: '56px 20px 80px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <p className="section-label" style={{ marginBottom: 10, color: 'var(--accent)' }}>Notification Center</p>
            <h1 style={{ fontWeight: 800, fontSize: 'clamp(24px, 4vw, 32px)', color: 'var(--text-primary)' }}>
              Track your report status
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
              Verify your email to see updates on your lost &amp; found reports.
            </p>
          </div>

          {!verificationToken ? (
            <div className="commitment-card">
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                style={{ marginBottom: 16 }}
              />
              <OtpVerification email={email} onVerified={handleVerified} successMessage="Loading your notifications…" />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{verifiedEmail}</span>
                  {unreadCount > 0 && (
                    <span className="badge badge-match">{unreadCount} unread</span>
                  )}
                </div>
                {notifications.length > 0 && unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="btn-ghost" style={{ fontSize: 12.5, padding: '6px 12px' }}>
                    Mark all as read
                  </button>
                )}
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <div className="spinner" style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', margin: '0 auto' }} />
                </div>
              ) : notifications.length === 0 ? (
                <div className="commitment-card" style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.6 }}>🔔</div>
                  <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>No notifications yet</p>
                  <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
                    You'll see updates here when an admin reviews your reports.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {notifications.map(n => {
                    const meta = TYPE_META[n.type] || { icon: '🔔', badge: 'badge-pending', label: n.type };
                    return (
                      <div
                        key={n._id}
                        className="commitment-card"
                        style={{
                          display: 'flex', gap: 14, padding: 18,
                          borderColor: n.read ? 'var(--border)' : 'var(--border-bright)',
                          background: n.read ? 'var(--bg-card)' : 'var(--gold-bg)',
                        }}
                      >
                        <span style={{ fontSize: 22, flexShrink: 0 }}>{meta.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span className={`badge ${meta.badge}`}>{meta.label}</span>
                            {!n.read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />}
                            <span style={{ fontSize: 11.5, color: 'var(--text-dim)', marginLeft: 'auto' }}>
                              {timeAgo ? timeAgo(n.createdAt) : new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 3 }}>{n.title}</p>
                          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.message}</p>
                          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                            {!n.read && (
                              <button onClick={() => handleMarkRead(n._id)} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                Mark as read
                              </button>
                            )}
                            <button onClick={() => handleDelete(n._id)} style={{ fontSize: 12, color: 'var(--lost)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
