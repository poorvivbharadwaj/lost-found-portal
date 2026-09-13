import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageLayout from '../components/layout/PageLayout';
import ImageUpload from '../components/forms/ImageUpload';
import OtpVerification from '../components/forms/OtpVerification';
import CampusOfficeBox from '../components/common/CampusOfficeBox';
import ValidProofNotice from '../components/common/ValidProofNotice';
import { postLostItem } from '../utils/api';
import { detectCategory, CATEGORIES, isBlockedLowValueItem, BLOCKED_ITEM_MESSAGE } from '../utils/helpers';

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const SpinnerIcon = () => (
  <div className="spinner" style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
);

function FormField({ label, required, error, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: error ? 'var(--danger)' : 'var(--text-muted)', fontFamily: "'Inter',sans-serif" }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
      {children}
      {hint && !error && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>⚠ {error}</p>}
    </div>
  );
}

export default function ReportLost() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [verificationToken, setVerificationToken] = useState(null);
  const [form, setForm] = useState({
    reporterName: '', email: '', phone: '', itemName: '',
    description: '', lostDate: '', category: 'auto',
  });
  const [guidelineConfirmed, setGuidelineConfirmed] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (field === 'email') setVerificationToken(null);
  };

  const validate = () => {
    const e = {};
    if (!form.reporterName?.trim()) e.reporterName = 'Name is required';
    if (!form.email?.trim()) {
      e.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = 'Enter a valid email';
    }
    if (!form.phone?.trim()) {
      e.phone = 'Phone number is required';
    } else {
      const cleaned = form.phone.replace(/[\s\-+]/g, '');
      if (!/^[0-9]{10}$/.test(cleaned)) e.phone = 'Enter 10 digits only';
    }
    if (!form.itemName?.trim()) {
      e.itemName = 'Item name is required';
    } else if (isBlockedLowValueItem(form.itemName)) {
      e.itemName = BLOCKED_ITEM_MESSAGE;
    }
    if (!form.description?.trim()) {
      e.description = 'Description is required';
    } else if (form.description.trim().length < 20) {
      e.description = 'Write at least 20 characters';
    }
    if (!form.lostDate) e.lostDate = 'Please select the date you lost the item';
    if (!guidelineConfirmed) e.guideline = 'Please confirm that your report complies with the reporting guidelines.';
    if (!verificationToken) e.verification = 'Please verify your email before submitting';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error(errs.guideline || errs.itemName || 'Please fix the errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (imageFile) fd.append('image', imageFile);
      fd.append('verificationToken', verificationToken);

      const detectedCat = form.category === 'auto'
        ? detectCategory(`${form.itemName} ${form.description}`)
        : form.category;
      fd.set('category', detectedCat);

      const res = await postLostItem(fd);
      if (res.data.success) {
        toast.success('Lost item reported! Waiting for admin approval.', { duration: 5000 });
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout showSidebar showSearch={false} showFilters={false}>
      <div style={{ padding: '32px 20px 40px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, marginBottom: 24 }}>
            <BackIcon /> Back to Portal
          </Link>

          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--lost-bg)', border: '1px solid rgba(185,28,28,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>😢</div>
              <div>
                <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 24, color: 'var(--text-primary)' }}>Report Lost Item</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Fill details to help us find your item</p>
              </div>
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--lost-bg)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: 10, fontSize: 12, color: 'var(--lost)' }}>
              Your report will be visible after admin review. Email OTP verification is required.
            </div>
          </div>

          <div className="glass" style={{ borderRadius: 18, padding: 28 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FormField label="Your Full Name" required error={errors.reporterName}>
                <input className={`input-field ${errors.reporterName ? 'error' : ''}`} placeholder="e.g. Arjun Kumar" value={form.reporterName} onChange={e => update('reporterName', e.target.value)} />
              </FormField>

              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField label="Email Address" required error={errors.email}>
                  <input type="email" className={`input-field ${errors.email ? 'error' : ''}`} placeholder="you@college.edu" value={form.email} onChange={e => update('email', e.target.value)} />
                </FormField>
                <FormField label="Phone Number" required error={errors.phone}>
                  <input type="tel" className={`input-field ${errors.phone ? 'error' : ''}`} placeholder="9876543210" value={form.phone} onChange={e => update('phone', e.target.value)} />
                </FormField>
              </div>

              <p style={{ fontSize: 11.5, color: 'var(--text-dim)', margin: '-8px 0 0', lineHeight: 1.5 }}>
                🔒 Your contact details are confidential and will only be visible to the authorized administrator.
              </p>

              {/* OTP Verification (email only — phone is required above but not OTP-verified) */}
              <OtpVerification
                email={form.email}
                onVerified={setVerificationToken}
              />
              {errors.verification && !verificationToken && (
                <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: -12 }}>⚠ {errors.verification}</p>
              )}

              <CampusOfficeBox />
              <ValidProofNotice />

              <FormField label="Item Name" required error={errors.itemName}>
                <input className={`input-field ${errors.itemName ? 'error' : ''}`} placeholder="e.g. Student ID Card, Blue Laptop" value={form.itemName} onChange={e => update('itemName', e.target.value)} />
              </FormField>

              <FormField label="Category" hint="Leave as Auto-detect to use AI classification">
                <select className="input-field" value={form.category} onChange={e => update('category', e.target.value)}>
                  <option value="auto">🤖 Auto-detect</option>
                  {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Detailed Description" required error={errors.description} hint="Include colour, brand, distinguishing features (min 20 characters)">
                <textarea className={`input-field ${errors.description ? 'error' : ''}`} rows={4} placeholder="Describe the item in detail..." value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} />
              </FormField>

              <FormField label="Date Lost" required error={errors.lostDate}>
                <input type="date" className={`input-field ${errors.lostDate ? 'error' : ''}`} max={new Date().toISOString().split('T')[0]} value={form.lostDate} onChange={e => update('lostDate', e.target.value)} />
              </FormField>

              <FormField label="Upload Item Image" hint="Optional but recommended — helps in matching">
                <ImageUpload onChange={setImageFile} />
              </FormField>

              <div className="guideline-notice" role="note" aria-labelledby="lost-guideline-heading">
                <p id="lost-guideline-heading" className="guideline-notice-heading">
                  <span aria-hidden="true">ℹ️</span> Important Reporting Guideline
                </p>
                <p className="guideline-notice-text">
                  This portal is intended for reporting items of reasonable value, importance, or personal identification, such as identity cards, wallets, mobile phones, keys, bags, official documents, certificates, and electronic devices.
                </p>
                <p className="guideline-notice-text">
                  Please do not submit reports for commonly available, low-value stationery items such as individual pens, pencils, erasers, or sharpeners. Irrelevant, misleading, or inappropriate reports may be reviewed and removed by the administrator.
                </p>

                <div className="guideline-checkbox-row">
                  <input
                    type="checkbox"
                    id="lost-guideline-confirm"
                    checked={guidelineConfirmed}
                    onChange={e => { setGuidelineConfirmed(e.target.checked); if (errors.guideline) setErrors(prev => ({ ...prev, guideline: '' })); }}
                    aria-describedby={errors.guideline ? 'lost-guideline-error' : undefined}
                  />
                  <label htmlFor="lost-guideline-confirm">
                    I confirm that this is a genuine report concerning an item of reasonable importance or value.
                  </label>
                </div>
                {errors.guideline && (
                  <p id="lost-guideline-error" role="alert" style={{ fontSize: 12, color: 'var(--lost)', marginTop: 8 }}>
                    ⚠ {errors.guideline}
                  </p>
                )}
              </div>

              <button type="submit" className="btn-primary" disabled={loading || !verificationToken} style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}>
                {loading ? <><SpinnerIcon /> Submitting Report…</> : '📢 Submit Lost Item Report'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
