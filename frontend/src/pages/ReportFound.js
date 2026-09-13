import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageLayout from '../components/layout/PageLayout';
import ImageUpload from '../components/forms/ImageUpload';
import OtpVerification from '../components/forms/OtpVerification';
import CampusOfficeBox from '../components/common/CampusOfficeBox';
import ValidProofNotice from '../components/common/ValidProofNotice';
import { postFoundItem } from '../utils/api';
import { detectCategory, CATEGORIES, isBlockedLowValueItem, BLOCKED_ITEM_MESSAGE } from '../utils/helpers';

const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const SpinnerIcon = () => (
  <div className="spinner" style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
);

function FormField({ label, required, error, hint, children, readOnly }) {
  return (
    <div>
      <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: error ? 'var(--danger)' : 'var(--text-muted)', fontFamily: "'Inter',sans-serif" }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        {readOnly && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--text-dim)', fontFamily: "'Inter'", textTransform: 'uppercase' }}>fixed</span>}
      </label>
      {children}
      {hint && !error && <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>⚠ {error}</p>}
    </div>
  );
}

export default function ReportFound() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [verificationToken, setVerificationToken] = useState(null);
  const [form, setForm] = useState({
    finderName: '', contactEmail: '', contactPhone: '', itemName: '',
    description: '', category: 'auto',
  });
  const [guidelineConfirmed, setGuidelineConfirmed] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    if (field === 'contactEmail') setVerificationToken(null);
  };

  const validate = () => {
    const e = {};
    if (!form.finderName?.trim()) e.finderName = 'Your name is required';
    if (!form.contactEmail?.trim()) {
      e.contactEmail = 'Email is required for verification';
    } else if (!/^\S+@\S+\.\S+$/.test(form.contactEmail)) {
      e.contactEmail = 'Enter a valid email';
    }
    if (!form.contactPhone?.trim()) {
      e.contactPhone = 'Phone number is required';
    } else {
      const cleaned = form.contactPhone.replace(/[\s\-+]/g, '');
      if (!/^[0-9]{10}$/.test(cleaned)) e.contactPhone = 'Enter 10 digits only';
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
    if (!guidelineConfirmed) e.guideline = 'Please confirm that your report complies with the reporting guidelines.';
    if (!verificationToken) e.verification = 'Please verify your email before submitting';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error(errs.guideline || errs.itemName || 'Please fill all required fields.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('finderName', form.finderName);
      fd.append('itemName', form.itemName);
      fd.append('description', form.description);
      fd.append('contactEmail', form.contactEmail);
      fd.append('contactPhone', form.contactPhone);
      fd.append('verificationToken', verificationToken);

      const cat = form.category === 'auto' ? detectCategory(`${form.itemName} ${form.description}`) : form.category;
      fd.append('category', cat);
      if (imageFile) fd.append('image', imageFile);

      const res = await postFoundItem(fd);
      if (res.data.success) {
        if (res.data.potentialMatch) {
          toast.success(`Match found! "${res.data.potentialMatch.itemName}" may be this item.`, { duration: 7000 });
        } else {
          toast.success('Found item reported! Admin will review shortly.', { duration: 5000 });
        }
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--found-bg)', border: '1px solid rgba(22,101,52,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎉</div>
              <div>
                <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 24, color: 'var(--text-primary)' }}>Report Found Item</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Help reunite someone with their lost item</p>
              </div>
            </div>
            <div style={{ padding: '10px 14px', background: 'var(--found-bg)', border: '1px solid rgba(22,101,52,0.2)', borderRadius: 10, fontSize: 12, color: 'var(--found)' }}>
              Our AI will automatically compare your report with lost items. Email OTP verification is required.
            </div>
          </div>

          <div className="glass" style={{ borderRadius: 18, padding: 28 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FormField label="Your Name" required error={errors.finderName}>
                <input className={`input-field ${errors.finderName ? 'error' : ''}`} placeholder="e.g. Priya Sharma" value={form.finderName} onChange={e => update('finderName', e.target.value)} />
              </FormField>

              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField label="Your Email" required error={errors.contactEmail} hint="For OTP verification">
                  <input type="email" className={`input-field ${errors.contactEmail ? 'error' : ''}`} placeholder="you@college.edu" value={form.contactEmail} onChange={e => update('contactEmail', e.target.value)} />
                </FormField>
                <FormField label="Your Phone" required error={errors.contactPhone}>
                  <input type="tel" className={`input-field ${errors.contactPhone ? 'error' : ''}`} placeholder="9876543210" value={form.contactPhone} onChange={e => update('contactPhone', e.target.value)} />
                </FormField>
              </div>

              <p style={{ fontSize: 11.5, color: 'var(--text-dim)', margin: '-8px 0 0', lineHeight: 1.5 }}>
                🔒 Your contact details are confidential and will only be visible to the authorized administrator.
              </p>

              {/* OTP Verification (email only — phone is required above but not OTP-verified) */}
              <OtpVerification
                email={form.contactEmail}
                onVerified={setVerificationToken}
              />
              {errors.verification && !verificationToken && (
                <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: -12 }}>⚠ {errors.verification}</p>
              )}

              <CampusOfficeBox />
              <ValidProofNotice />

              <FormField label="Item Name" required error={errors.itemName}>
                <input className={`input-field ${errors.itemName ? 'error' : ''}`} placeholder="e.g. Black Wallet, Samsung Mobile Phone, Blue Backpack" value={form.itemName} onChange={e => update('itemName', e.target.value)} />
              </FormField>

              <FormField label="Item Category" hint="Auto-detect uses AI to classify based on your description">
                <select className="input-field" value={form.category} onChange={e => update('category', e.target.value)}>
                  <option value="auto">🤖 Auto-detect from description</option>
                  {CATEGORIES.filter(c => c.value !== 'all').map(c => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Item Description" required error={errors.description} hint="Be specific: colour, brand, condition (min 20 chars)">
                <textarea className={`input-field ${errors.description ? 'error' : ''}`} rows={5} placeholder="Describe the item you found..." value={form.description} onChange={e => update('description', e.target.value)} style={{ resize: 'vertical' }} />
              </FormField>

              <FormField label="Found At (Location)" readOnly>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'var(--found-bg)', border: '1px solid rgba(22,101,52,0.2)', borderRadius: 10 }}>
                  <span style={{ fontSize: 16 }}>📍</span>
                  <span style={{ fontSize: 14, color: 'var(--found)', fontWeight: 600 }}>Room No 405</span>
                </div>
              </FormField>

              <FormField label="Upload Photo of Found Item" hint="A clear photo helps the owner verify it's theirs">
                <ImageUpload onChange={setImageFile} />
              </FormField>

              <div className="guideline-notice" role="note" aria-labelledby="found-guideline-heading">
                <p id="found-guideline-heading" className="guideline-notice-heading">
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
                    id="found-guideline-confirm"
                    checked={guidelineConfirmed}
                    onChange={e => { setGuidelineConfirmed(e.target.checked); if (errors.guideline) setErrors(prev => ({ ...prev, guideline: '' })); }}
                    aria-describedby={errors.guideline ? 'found-guideline-error' : undefined}
                  />
                  <label htmlFor="found-guideline-confirm">
                    I confirm that this is a genuine report concerning an item of reasonable importance or value.
                  </label>
                </div>
                {errors.guideline && (
                  <p id="found-guideline-error" role="alert" style={{ fontSize: 12, color: 'var(--lost)', marginTop: 8 }}>
                    ⚠ {errors.guideline}
                  </p>
                )}
              </div>

              <button type="submit" className="btn-primary" disabled={loading || !verificationToken} style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 4 }}>
                {loading ? <><SpinnerIcon /> Submitting Report…</> : '🎉 Submit Found Item Report'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
