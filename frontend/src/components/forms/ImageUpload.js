import React, { useState, useRef } from 'react';

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

// Client-side heuristic: reject obviously irrelevant filenames or tiny files
const clientValidateImage = (file) => {
  const lowerName = file.name.toLowerCase();
  const rejectPatterns = ['selfie', 'photo', 'portrait', 'me_', '_me', 'face'];
  if (rejectPatterns.some(p => lowerName.includes(p))) {
    return { valid: false, reason: 'Please upload an image of the actual item, not a selfie or personal photo.' };
  }
  if (file.size < 5000) {
    return { valid: false, reason: 'Image is too small. Please upload a clear photo of the item.' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, reason: 'Image is too large (max 5MB). Please compress and retry.' };
  }
  return { valid: true };
};

export default function ImageUpload({ onChange, error }) {
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setValidationError('Please upload an image file (JPG, PNG, WEBP).');
      return;
    }

    const check = clientValidateImage(file);
    if (!check.valid) {
      setValidationError(check.reason);
      return;
    }

    setValidationError('');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    setValidationError('');
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      {preview ? (
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(22,101,52,0.4)' }}>
          <img src={preview} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
          <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>✅ Image selected</span>
            <button
              type="button"
              onClick={clearImage}
              style={{ padding: '4px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', fontSize: 12, cursor: 'pointer' }}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className="upload-zone"
          style={{ borderColor: (error || validationError) ? 'var(--danger)' : dragOver ? 'var(--accent)' : undefined }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <div style={{ color: 'var(--text-dim)', marginBottom: 10 }}><UploadIcon /></div>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4, fontSize: 14 }}>
            Drop image here or <span style={{ color: 'var(--accent)' }}>click to browse</span>
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>JPG, PNG, WEBP — max 5MB</p>
          <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, fontFamily: "'Inter'" }}>
            AI validates: ID cards, electronics, books, documents ✓
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />

      {(validationError || error) && (
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
          <p style={{ fontSize: 12, color: '#f87171', lineHeight: 1.4 }}>{validationError || error}</p>
        </div>
      )}
    </div>
  );
}
