import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { TEAM_MEMBERS } from '../utils/teamData';

const LinkedInIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 4.126 0 2.063 2.063 0 0 1-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5z"/>
  </svg>
);

const JOURNEY = [
  {
    icon: '💡',
    title: 'It Started With an Idea',
    text: 'Our journey began as a college mini-project where we were tasked with building a web-based application. After exploring multiple ideas, we chose to develop a Lost & Found Portal because we believed it could solve a real problem faced by students every day.',
  },
  {
    icon: '🔍',
    title: 'Identifying the Problem',
    text: 'Students frequently lose important belongings such as ID cards, Aadhaar cards, wallets, keys, documents, and electronic gadgets. There was no centralized platform to report or recover these items.',
  },
  {
    icon: '🏫',
    title: 'Understanding Our Community',
    text: 'Our campus has more than 10,000 students, faculty, and staff. We realized a centralized Lost & Found system could significantly improve communication and increase the chances of recovering lost belongings.',
  },
  {
    icon: '⚙️',
    title: 'Building the Solution',
    text: 'We developed a secure Lost & Found Portal where users can report lost or found items, browse verified listings, and reconnect owners with their belongings through an admin approval system.',
  },
  {
    icon: '❤️',
    title: 'Our Mission',
    text: 'Our mission is to build a trusted, transparent, and community-driven platform that reconnects people with their valuables while making our campus more connected, supportive, and efficient.',
  },
];

function MemberCard({ member, index }) {
  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  return (
    <div className="team-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
      <div style={{
        width: 88, height: 88, borderRadius: '50%', margin: '0 auto 20px',
        background: 'var(--gold-bg)', border: '2px solid var(--border-bright)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {member.photoSrc ? (
          <img src={member.photoSrc} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontWeight: 700, fontSize: 24, color: 'var(--accent)' }}>
            {initials}
          </span>
        )}
      </div>

      <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
        {member.name}
      </h3>
      <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500, marginBottom: 12 }}>
        {member.role}
      </p>
      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20, minHeight: 48 }}>
        {member.intro}
      </p>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <a
          href={member.linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
          style={{ padding: '7px 14px', fontSize: 12.5 }}
        >
          <LinkedInIcon /> LinkedIn
        </a>
        <a
          href={member.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost"
          style={{ padding: '7px 14px', fontSize: 12.5 }}
        >
          <GitHubIcon /> GitHub
        </a>
      </div>
    </div>
  );
}

function JourneySection() {
  return (
    <section style={{ padding: '0 20px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p className="section-label" style={{ marginBottom: 12, color: 'var(--accent)' }}>Our Story</p>
          <h2 style={{ fontWeight: 800, fontSize: 'clamp(24px, 4vw, 34px)', color: 'var(--text-primary)' }}>
            Our Journey
          </h2>
        </div>

        <div style={{
          background: 'var(--navy)',
          borderRadius: 20,
          padding: 'clamp(28px, 5vw, 48px)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid rgba(212,175,55,0.25)',
        }}>
          <div style={{ position: 'relative' }}>
            {/* Vertical timeline line */}
            <div style={{
              position: 'absolute', left: 19, top: 6, bottom: 6, width: 2,
              background: 'linear-gradient(180deg, rgba(212,175,55,0.6), rgba(212,175,55,0.1))',
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {JOURNEY.map((item, i) => (
                <div key={item.title} className="animate-slide-up" style={{ display: 'flex', gap: 20, animationDelay: `${i * 0.08}s` }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(212,175,55,0.15)', border: '2px solid #D4AF37',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, zIndex: 1,
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ paddingTop: 6 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 17, color: '#F5F0E1', marginBottom: 8 }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: 14, color: 'rgba(245,240,225,0.75)', lineHeight: 1.7 }}>
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission Card */}
        <div style={{
          marginTop: 28,
          background: 'var(--bg-card)',
          border: '1.5px solid #D4AF37',
          borderRadius: 18,
          padding: 'clamp(24px, 4vw, 36px)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', margin: '0 auto 16px',
            background: 'var(--gold-bg)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 22,
          }}>
            🧭
          </div>
          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 600, color: 'var(--text-primary)',
            lineHeight: 1.6, maxWidth: 620, margin: '0 auto',
          }}>
            &ldquo;Our mission is to create a trusted platform that connects people, strengthens
            our campus community, and brings every lost item one step closer to its rightful owner.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Team() {
  return (
    <PageLayout showSidebar>
      <section style={{ padding: '64px 20px 56px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }} className="animate-fade-in">
            <p className="section-label" style={{ marginBottom: 12, color: 'var(--accent)' }}>Meet the Team</p>
            <h1 style={{ fontWeight: 800, fontSize: 'clamp(28px, 5vw, 40px)', color: 'var(--text-primary)', marginBottom: 12 }}>
              Team <span className="gradient-text">Udbhav</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              The passionate minds behind the Lost & Found Campus Portal — building technology that genuinely solves campus problems.
            </p>
          </div>

          {/* Team Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {TEAM_MEMBERS.map((member, i) => (
              <MemberCard key={member.id} member={member} index={i} />
            ))}
          </div>
        </div>
      </section>

      <JourneySection />
    </PageLayout>
  );
}
