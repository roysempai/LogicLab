/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0A',
          secondary: '#111111',
          tertiary: '#1A1A1A',
          card: '#161616',
        },
        accent: {
          green: '#00FF88',
          'green-dim': '#00CC6A',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          red: '#EF4444',
          orange: '#F97316',
        },
        wire: {
          active: '#00FF88',
          inactive: '#2D2D2D',
        },
        gate: {
          border: '#333333',
          'border-active': '#00FF88',
          fill: '#1A1A1A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#9CA3AF',
          muted: '#4B5563',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.4)',
        'glow-green-sm': '0 0 10px rgba(0, 255, 136, 0.3)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.4)',
        'card': '0 4px 24px rgba(0,0,0,0.6)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 255, 136, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        }
      },
      backgroundImage: {
        'grid-pattern': 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.08) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
}
