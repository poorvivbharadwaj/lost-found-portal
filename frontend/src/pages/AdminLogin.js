import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminLogin } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/common/ThemeToggle';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Both username and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await adminLogin(form);
      if (res.data.success) {
        login(res.data.token, res.data.admin);
        toast.success('Welcome back, Admin!');
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 200);
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Check credentials.';
      console.error('Admin login error:', err.response || err.message || err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell bg-mesh">
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <div style={{ width: '100%', maxWidth: 400 }} className="animate-slide-up">

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <img src="/logos/lf-logo-circle.png" alt="SNPSU" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 12 }} />
          </div>
          <h1 style={{ fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', marginBottom: 4 }}>
            Admin Panel
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Lost &amp; Found Campus Portal
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

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
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Username
              </label>
              <input
                type="text"
                placeholder="admin"
                value={form.username}
                onChange={e => {
                  setForm(p => ({ ...p, username: e.target.value }));
                  setError('');
                }}
                autoFocus
                className="input-field"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => {
                    setForm(p => ({ ...p, password: e.target.value }));
                    setError('');
                  }}
                  className="input-field"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute', right: 12,
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--text-dim)', cursor: 'pointer', padding: 4,
                    fontSize: 16,
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: 4 }}
            >
              {loading ? 'Logging in…' : '🔐 Login to Admin Panel'}
            </button>

            <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' }}>
              Default: admin / admin123
            </p>

          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13 }}>
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← Back to Portal
          </Link>
        </p>

      </div>
    </div>
  );
}
