/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1F3A',
          50: '#EEF2F7',
          100: '#D6E0EC',
          200: '#AEC1D9',
          300: '#7D97BB',
          400: '#4C6D9C',
          500: '#264A78',
          600: '#14315C',
          700: '#0B1F3A',
          800: '#081729',
          900: '#050E1A',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E3C567',
          dark: '#B4922A',
          bg: 'rgba(212, 175, 55, 0.08)',
        },
        dark: {
          900: '#050E1A',
          800: '#081729',
          700: '#0B1F3A',
          600: '#14315C',
        },
        found: '#166534',
        lost: '#B91C1C',
        danger: '#DC2626',
      },
      fontFamily: {
        display: ['"Inter"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"Inter"', 'monospace'],
      },
      borderRadius: {
        card: '14px',
        btn: '11px',
        input: '10px',
        dialog: '16px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(11, 31, 58, 0.06)',
        card: '0 4px 16px rgba(11, 31, 58, 0.08)',
        elevated: '0 12px 40px rgba(11, 31, 58, 0.10)',
      },
      spacing: {
        18: '4.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
