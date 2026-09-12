import React from 'react';

/**
 * Full-screen splash shown once when the site first loads.
 * `fadingOut` triggers the exit transition just before unmount.
 */
export default function SplashScreen({ fadingOut }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--navy)',
        opacity: fadingOut ? 0 : 1,
        transition: 'opacity 0.4s ease',
        pointerEvents: fadingOut ? 'none' : 'auto',
      }}
    >
      <img
        src="/logos/lf-logo-circle.png"
        alt="Lost & Found Campus Portal"
        style={{
          width: 'min(220px, 55vw)',
          height: 'min(220px, 55vw)',
          objectFit: 'contain',
          animation: 'splashPop 0.6s cubic-bezier(.34,1.56,.64,1)',
        }}
      />

      <style>{`
        @keyframes splashPop {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
