import React, { useState } from 'react';

/**
 * Brand logo component. Falls back to a labeled placeholder box if the
 * image is missing or fails to load, so the app never breaks visually.
 * Usage: <LogoPlaceholder type="college" /> or <LogoPlaceholder type="portal" src="/custom.png" />
 */
const DEFAULT_SRC = {
  college: '/logos/college-logo.png',
  portal: '/logos/portal-logo.png',
  // The actual Lost & Found Portal brand mark (navy-and-gold circular
  // badge) — used for the top-left header/footer branding so it never
  // gets confused with the college's own logo.
  brand: '/logos/lf-logo-circle.png',
};

const LABELS = {
  college: 'College Logo',
  portal: 'L&F Logo',
  brand: 'Lost & Found Portal Logo',
};

const DEFAULT_SIZES = {
  college: { width: 40, height: 40 },
  portal: { width: 32, height: 32 },
  brand: { width: 38, height: 38 },
};

export default function LogoPlaceholder({ type = 'portal', src, width, height, className = '', rounded = true }) {
  const [errored, setErrored] = useState(false);
  const resolvedSrc = src || DEFAULT_SRC[type];
  const w = width || DEFAULT_SIZES[type]?.width || 32;
  const h = height || DEFAULT_SIZES[type]?.height || 32;

  if (resolvedSrc && !errored) {
    return (
      <div
        className={`logo-hover ${className}`}
        style={{
          width: w, height: h, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: rounded ? 8 : 0, overflow: 'hidden',
        }}
      >
        <img
          src={resolvedSrc}
          alt={LABELS[type]}
          onError={() => setErrored(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  return (
    <div
      className={`logo-placeholder ${className}`}
      style={{ width: w, height: h }}
      title={`${LABELS[type]} — replace with actual image`}
    >
      {LABELS[type]}
    </div>
  );
}
