import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LogoPlaceholder from '../common/LogoPlaceholder';
import { getOfficeInfo } from '../../utils/api';
import { TEAM_MEMBERS, SOCIAL_LINKS } from '../../utils/teamData';

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 4.126 0 2.063 2.063 0 0 1-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

// Fallback shown while the live office info loads or if the request fails —
// mirrors the backend default so the footer never renders blank/broken.
// Kept in sync with CampusOfficeBox.js / ItemModal.js.
const DEFAULT_OFFICE = {
  officeLocation: 'Room No 405, Campus Office',
  officeEmail: 'lostfound@college.edu',
  officePhone: '+91-XXXXXXXXXX',
};

// The phone field starts life as a placeholder — don't wire up a `tel:`
// link (or claim a working number) until the admin sets a real one.
const isPlaceholderPhone = (phone) => !phone || /X{3,}/i.test(phone);

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Report Lost', to: '/report-lost' },
  { label: 'Report Found', to: '/report-found' },
  { label: 'About Us', to: '/about' },
  { label: 'Team', to: '/team' },
  { label: 'Admin', to: '/admin/login' },
];

const linkStyle = {
  fontSize: 13,
  color: 'var(--text-muted)',
  textDecoration: 'none',
  transition: 'color 0.2s',
};

export default function Footer() {
  const [office, setOffice] = useState(DEFAULT_OFFICE);

  useEffect(() => {
    let cancelled = false;
    // Same public, read-only endpoint used by CampusOfficeBox/ItemModal, so
    // the footer always mirrors whatever the admin last saved — never
    // reporter contact details.
    getOfficeInfo()
      .then((res) => {
        if (!cancelled && res.data?.office) setOffice(res.data.office);
      })
      .catch(() => {
        // Keep the default fallback values on failure.
      });
    return () => { cancelled = true; };
  }, []);

  const phoneIsPlaceholder = isPlaceholderPhone(office.officePhone);

  return (
    <footer className="footer">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 40 }}>
          {/* Brand */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <LogoPlaceholder type="brand" width={44} height={44} />
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
          <div style={{ minWidth: 0 }}>
            <p className="section-label" style={{ marginBottom: 16 }}>Quick Links</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quickLinks.map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={linkStyle}
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
          <div style={{ minWidth: 0 }}>
            <p className="section-label" style={{ marginBottom: 16 }}>Contact</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 8, wordBreak: 'break-word' }}>
                <span aria-hidden="true">📍</span> <span>{office.officeLocation}</span>
              </p>
              <a
                href={`mailto:${office.officeEmail}`}
                style={{ ...linkStyle, display: 'flex', alignItems: 'flex-start', gap: 8, wordBreak: 'break-word' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <span aria-hidden="true">✉️</span> <span>{office.officeEmail}</span>
              </a>
              {phoneIsPlaceholder ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: 8, wordBreak: 'break-word' }} title="Admin has not set a real phone number yet">
                  <span aria-hidden="true">📞</span> <span>{office.officePhone}</span>
                </p>
              ) : (
                <a
                  href={`tel:${office.officePhone.replace(/[^\d+]/g, '')}`}
                  style={{ ...linkStyle, display: 'flex', alignItems: 'flex-start', gap: 8, wordBreak: 'break-word' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <span aria-hidden="true">📞</span> <span>{office.officePhone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Follow Us */}
          <div style={{ minWidth: 0 }}>
            <p className="section-label" style={{ marginBottom: 16 }}>Follow Us</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>
                {SOCIAL_LINKS.instagramUrl ? (
                  <a
                    href={SOCIAL_LINKS.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Team Udbhav on Instagram"
                    className="footer-social-link"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <InstagramIcon /> Instagram — Team Udbhav
                  </a>
                ) : (
                  <span
                    className="footer-social-link is-placeholder"
                    style={{ color: 'var(--text-dim)' }}
                    title="Admin: add the Instagram URL in frontend/src/utils/teamData.js (SOCIAL_LINKS.instagramUrl)"
                  >
                    <InstagramIcon /> Instagram — Team Udbhav
                  </span>
                )}
              </li>
              {TEAM_MEMBERS.map(member => (
                <li key={member.id}>
                  <a
                    href={member.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on LinkedIn (opens in a new tab)`}
                    className="footer-social-link"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <LinkedInIcon /> <span style={{ wordBreak: 'break-word' }}>LinkedIn — {member.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider" style={{ marginBottom: 24 }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            © {new Date().getFullYear()} Lost & Found Campus Portal ·{' '}
            <Link to="/team" className="footer-inline-link">Team Udbhav</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
