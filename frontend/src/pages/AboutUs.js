import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

const ZapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const LightbulbIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
    <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
  </svg>
);

const GridIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const commitments = [
  {
    icon: <ShieldIcon />,
    title: 'Security & Privacy',
    points: [
      'Protect user information and prevent misuse',
      'Ensure personal details are accessible only to authorized administrators',
    ],
  },
  {
    icon: <EyeIcon />,
    title: 'Transparency & Trust',
    points: [
      'Maintain a reliable and trustworthy reporting system',
      'Encourage responsible reporting of lost and found items',
    ],
  },
  {
    icon: <ZapIcon />,
    title: 'Fast & Efficient Recovery',
    points: [
      'Help students and staff reconnect with belongings quickly',
      'Reduce confusion and delays across campus',
    ],
  },
  {
    icon: <LightbulbIcon />,
    title: 'Student-Centric Innovation',
    points: [
      'Build technology solutions that genuinely solve campus problems',
      'Improve convenience and accessibility for all users',
    ],
  },
  {
    icon: <GridIcon />,
    title: 'Organized Campus Ecosystem',
    points: [
      'Support a safer and more organized university environment',
      'Digitize the traditional lost-and-found process',
    ],
  },
];

const features = [
  { icon: '🔐', title: 'Verified Reporting', desc: 'OTP-verified submissions prevent spam and fake reports.' },
  { icon: '🤖', title: 'AI Matching', desc: 'Intelligent matching connects lost items with found reports automatically.' },
  { icon: '👤', title: 'Privacy Protected', desc: 'Personal contact details remain visible only to authorized admins.' },
  { icon: '✅', title: 'Admin Review', desc: 'Every report is reviewed before going live on the portal.' },
];

export default function AboutUs() {
  return (
    <PageLayout showSidebar>
      {/* Hero */}
      <section style={{ padding: '64px 20px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }} className="animate-fade-in">
          <p className="section-label" style={{ marginBottom: 12, color: 'var(--accent)' }}>About Us</p>
          <h1 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 'clamp(28px, 5vw, 42px)', color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.2 }}>
            Reuniting People With Their <span className="gradient-text">Belongings</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>
            The Lost & Found Campus Portal is a secure, university-grade platform designed to help students and staff recover lost items efficiently across large campuses.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section style={{ padding: '0 20px 64px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 64 }}>
            <div className="glass commitment-card animate-slide-up" style={{ gridColumn: 'span 1' }}>
              <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 16 }}>
                Our Purpose
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 12 }}>
                On a bustling university campus, items get lost every day — ID cards, electronics, books, and personal belongings. Our portal digitizes the traditional lost-and-found process, making recovery faster, more organized, and accessible to everyone.
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
                Found items are reported with verified details, lost item reports are handled securely, and personal information remains protected — accessible only to authorized administrators who facilitate the reunion process.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {features.map((f, i) => (
                <div key={f.title} className="commitment-card animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Commitments */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p className="section-label" style={{ marginBottom: 8, color: 'var(--accent)' }}>🌟 Our Commitments</p>
            <h2 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 'clamp(22px, 4vw, 32px)', color: 'var(--text-primary)' }}>
              Built on Trust, Security & Innovation
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {commitments.map((c, i) => (
              <div key={c.title} className="commitment-card animate-slide-up" style={{ animationDelay: `${i * 0.07}s` }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gold-bg)', border: '1px solid var(--border-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {c.icon}
                </div>
                <h3 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 12 }}>{c.title}</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {c.points.map(p => (
                    <li key={p} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, display: 'flex', gap: 8 }}>
                      <span style={{ color: 'var(--accent)', flexShrink: 0 }}>✦</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: 64, padding: '40px 24px', background: 'var(--gold-bg)', borderRadius: 20, border: '1px solid var(--border-bright)' }}>
            <h3 style={{ fontFamily: "'Inter',sans-serif", fontWeight: 700, fontSize: 22, color: 'var(--text-primary)', marginBottom: 12 }}>
              Lost something? Found something?
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Report it now — verified, secure, and fast.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/report-lost" className="btn-primary" style={{ textDecoration: 'none' }}>Report Lost Item</Link>
              <Link to="/report-found" className="btn-success" style={{ textDecoration: 'none', padding: '11px 24px' }}>Report Found Item</Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
