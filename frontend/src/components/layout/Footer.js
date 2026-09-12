import React from 'react';
import { Link } from 'react-router-dom';
import LogoPlaceholder from '../common/LogoPlaceholder';

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 4.126 0 2.063 2.063 0 0 1-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Report Lost', to: '/report-lost' },
  { label: 'Report Found', to: '/report-found' },
  { label: 'About Us', to: '/about' },
  { label: 'Team', to: '/team' },
  { label: 'Admin', to: '/admin/login' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <LogoPlaceholder type="college" width={44} height={44} />
              <div>
                <p style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                  Lost <span style={{ color: 'var(--accent)' }}>&</span> Found
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Campus Portal</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 280 }}>
              Reuniting people with their belongings through a secure, verified campus platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="section-label" style={{ marginBottom: 16 }}>Quick Links</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quickLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="section-label" style={{ marginBottom: 16 }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>📍 Room No 405, Campus Office</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>✉️ lostfound@college.edu</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>📞 +91-XXXXXXXXXX</p>
            </div>
          </div>
        </div>

        <div className="divider" style={{ marginBottom: 24 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            © {new Date().getFullYear()} Lost & Found Campus Portal · Team Udbhav
          </p>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
          >
            <LinkedInIcon /> Follow on LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
