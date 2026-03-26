/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Design system tokens
        'bg-base': '#0D0F12',
        'bg-surface': '#161A1F',
        'bg-elevated': '#1E2329',
        'bg-input': '#1A1F25',
        'border-default': '#2A3040',
        'border-focus': '#3DD68C',

        // Accent colors
        'accent-primary': '#3DD68C',
        'accent-secondary': '#2CB67D',
        'accent-teal': '#2EBDB8',
        'accent-muted': '#1F4A35',

        // Status colors
        'status-paid': '#3DD68C',
        'status-paid-bg': '#1A3D2B',
        'status-unpaid': '#8A9BB0',
        'status-unpaid-bg': '#1E2530',
        'status-overdue': '#F59E0B',
        'status-overdue-bg': '#3A2A0E',

        // Text colors
        'text-primary': '#F0F4F8',
        'text-secondary': '#8A9BB0',
        'text-muted': '#4A5568',

        // Error colors
        'color-error': '#F87171',
        'color-error-bg': '#3A1A1A',

        // shadcn/ui compatible
        border: '#2A3040',
        input: '#1A1F25',
        ring: '#3DD68C',
        background: '#0D0F12',
        foreground: '#F0F4F8',
        primary: {
          DEFAULT: '#3DD68C',
          foreground: '#0D0F12',
        },
        secondary: {
          DEFAULT: '#1E2329',
          foreground: '#F0F4F8',
        },
        destructive: {
          DEFAULT: '#F87171',
          foreground: '#F0F4F8',
        },
        muted: {
          DEFAULT: '#1E2329',
          foreground: '#8A9BB0',
        },
        accent: {
          DEFAULT: '#1F4A35',
          foreground: '#3DD68C',
        },
        popover: {
          DEFAULT: '#1E2329',
          foreground: '#F0F4F8',
        },
        card: {
          DEFAULT: '#161A1F',
          foreground: '#F0F4F8',
        },
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
        pill: '100px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'display': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h1': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h2': ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
        'h3': ['1rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
        'caption': ['0.6875rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      boxShadow: {
        'fab': '0 4px 24px rgba(61, 214, 140, 0.35)',
        'glow': '0 0 0 3px rgba(61, 214, 140, 0.15)',
        'error': '0 0 0 3px rgba(248, 113, 113, 0.15)',
      },
    },
  },
  plugins: [],
};
