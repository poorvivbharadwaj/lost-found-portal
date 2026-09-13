/**
 * Centralized Team Udbhav member + social data.
 *
 * Both the Team page (frontend/src/pages/Team.js) and the site Footer
 * (frontend/src/components/layout/Footer.js) import from this single file so
 * names, roles, and profile URLs never drift out of sync between the two.
 *
 * Replace photoSrc, linkedInUrl and githubUrl with real values when available.
 */
export const TEAM_MEMBERS = [
  {
    id: 'poorvika',
    name: 'Poorvika MJ',
    role: 'Portal Operations Lead',
    intro: 'Oversees the end-to-end approval workflow and keeps listings accurate and trustworthy.',
    photoSrc: '/team/poorvika-mj.png',
    linkedInUrl: 'https://www.linkedin.com/in/poorvika-mj-aba066392',
    githubUrl: 'https://github.com/poorvika-mj',
  },
  {
    id: 'poorvi',
    name: 'Poorvi V Bharadwaj',
    role: 'Cloud & Notification Specialist',
    intro: 'Built the email notification pipeline and manages cloud image storage and delivery.',
    photoSrc: '/team/poorvi-v-bharadwaj.png',
    linkedInUrl: 'https://www.linkedin.com/in/poorvi-v-bharadwaj-603837391',
    githubUrl: 'https://github.com/poorvivbharadwaj',
  },
  {
    id: 'pawan',
    name: 'Pawan Kumar G',
    role: 'UI/UX Portal Designer',
    intro: 'Shaped the visual language and interaction design behind the entire portal experience.',
    photoSrc: '/team/pawan-kumar-g.png',
    linkedInUrl: 'https://www.linkedin.com/in/pawan-kumar-g-54530134b',
    githubUrl: 'https://github.com/Pawankumar3210',
  },
  {
    id: 'keerthana',
    name: 'Keerthana D',
    role: 'Item Tracking Engineer',
    intro: 'Designed the matching logic that connects lost reports with found items automatically.',
    photoSrc: '/team/keerthana-d.png',
    linkedInUrl: 'https://www.linkedin.com/in/keerthana-d-653313398',
    githubUrl: 'https://github.com/keerthanadoregowda',
  },
];

/**
 * Social links shown in the Footer's "Follow Us" section.
 */
export const SOCIAL_LINKS = {
  instagramUrl: 'https://www.instagram.com/team._.udbhav?stkn=MWI2N2hicDYzNzFnbw==',
};
