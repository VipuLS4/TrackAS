/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B69FF',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#0B69FF',
          600: '#0752CC',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        accent: {
          DEFAULT: '#00D1B2',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#00D1B2',
          600: '#008F82',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        warm: '#FF7A59',
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        text: '#111827',
        muted: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h2': ['36px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'h3': ['28px', { lineHeight: '1.4' }],
        'h4': ['20px', { lineHeight: '1.5' }],
        'body': ['16px', { lineHeight: '1.6' }],
        'small': ['12px', { lineHeight: '1.5' }],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'full': '9999px',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
      },
      boxShadow: {
        'soft': '0 8px 24px rgba(11, 105, 255, 0.06)',
        'elevated': '0 12px 40px rgba(2, 6, 23, 0.12)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(90deg, #0B69FF 0%, #00D1B2 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(11, 105, 255, 0.05) 0%, rgba(0, 209, 178, 0.05) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
};
