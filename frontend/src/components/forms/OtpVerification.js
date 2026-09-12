import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { sendOtp, verifyOtp } from '../../utils/api';

const SpinnerIcon = () => (
  <div className="spinner" style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
);

/**
 * Email OTP verification component.
 * Phone is intentionally NOT verified here — phone is a required plain
 * field on the report forms, but only email goes through OTP.
 * @param {function} onVerified - callback with verificationToken
 * @param {string} email - email from parent form
 */
export default function OtpVerification({ onVerified, email, successMessage }) {
  const [step, setStep] = useState('start'); // start | otp | verified
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtp, setDevOtp] = useState('');
  const inputRefs = useRef([]);
  const verifiedEmailRef = useRef(null);

  const hasEmail = email && /^\S+@\S+\.\S+$/.test(email.trim());

  // If the email changes after verifying, drop back to "start" instead of
  // showing a stale ✅ badge for an email that's no longer in the form.
  useEffect(() => {
    if (step !== 'verified' || !verifiedEmailRef.current) return;
    const currentEmail = (email || '').trim().toLowerCase();
    if (currentEmail !== verifiedEmailRef.current) {
      setStep('start');
      setOtp(['', '', '', '', '', '']);
      setDevOtp('');
      toast('Email changed — please verify again.', { icon: '⚠️' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    setSending(true);
    try {
      const res = await sendOtp({ contact: email.trim().toLowerCase(), contactType: 'email' });
      if (res.data.success) {
        toast.success('OTP sent to your email');
        setStep('otp');
        setResendTimer(60);
        if (res.data.devOtp) setDevOtp(res.data.devOtp);
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP.');
      return;
    }
    setVerifying(true);
    try {
      const contact = email.trim().toLowerCase();
      const res = await verifyOtp({ contact, contactType: 'email', otp: code });
      if (res.data.success) {
        toast.success('✅ Email verified successfully!');
        verifiedEmailRef.current = contact;
        setStep('verified');
        onVerified(res.data.verificationToken);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    handleSendOtp();
  };

  if (step === 'verified') {
    return (
      <div style={{ padding: '16px 18px', background: 'var(--found-bg)', border: '1px solid rgba(22,101,52,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>✅</span>
        <div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, color: 'var(--found)' }}>Email Verified</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your email has been verified. {successMessage || 'You can now submit the form.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', background: 'var(--gold-bg)', border: '1px solid var(--border-bright)', borderRadius: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: 20 }}>🔐</span>
        <div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Verify Your Email</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>OTP verification required before submission</p>
        </div>
      </div>

      {step === 'start' && (
        <div>
          {hasEmail ? (
            <button type="button" onClick={handleSendOtp} disabled={sending} className="btn-primary" style={{ width: '100%', fontSize: 13 }}>
              {sending ? <><SpinnerIcon /> Sending…</> : `📧 Send OTP to ${email.trim()}`}
            </button>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' }}>
              Enter a valid email address above to enable verification.
            </p>
          )}
        </div>
      )}

      {step === 'otp' && (
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, textAlign: 'center' }}>
            Enter the 6-digit code sent to your email
          </p>

          {devOtp && (
            <div style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8, marginBottom: 12, textAlign: 'center' }}>
              <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Dev mode OTP:</p>
              <p style={{ fontFamily: "'Inter',monospace", fontWeight: 700, fontSize: 18, color: 'var(--accent)', letterSpacing: '0.2em' }}>{devOtp}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className="otp-input"
              />
            ))}
          </div>

          <button type="button" onClick={handleVerify} disabled={verifying} className="btn-primary" style={{ width: '100%', marginBottom: 10 }}>
            {verifying ? <><SpinnerIcon /> Verifying…</> : 'Verify OTP'}
          </button>

          <div style={{ textAlign: 'center' }}>
            {resendTimer > 0 ? (
              <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>Resend OTP in {resendTimer}s</p>
            ) : (
              <button type="button" onClick={handleResend} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Resend OTP
              </button>
            )}
            <button type="button" onClick={() => setStep('start')} style={{ display: 'block', margin: '8px auto 0', fontSize: 12, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>
              ← Change email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
