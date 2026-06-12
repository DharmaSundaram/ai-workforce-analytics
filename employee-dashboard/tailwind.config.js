/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  corePlugins: {
    preflight: false,
  },
  important: false,
  theme: {
    extend: {
      colors: {
        aether: {
          bg: '#050816',
          'bg-secondary': '#08111F',
          'bg-tertiary': '#0B172A',
          'bg-card': 'rgba(8, 17, 35, 0.7)',
          cyan: '#00E5FF',
          'cyan-dim': 'rgba(0, 229, 255, 0.15)',
          'cyan-glow': 'rgba(0, 229, 255, 0.4)',
          blue: '#4F8CFF',
          'blue-dim': 'rgba(79, 140, 255, 0.15)',
          purple: '#A855F7',
          'purple-dim': 'rgba(168, 85, 247, 0.15)',
          success: '#10B981',
          'success-dim': 'rgba(16, 185, 129, 0.15)',
          warning: '#F59E0B',
          'warning-dim': 'rgba(245, 158, 11, 0.15)',
          danger: '#EF4444',
          'danger-dim': 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(0, 229, 255, 0.12)',
          'border-hover': 'rgba(0, 229, 255, 0.3)',
          'text-primary': '#F0F4FF',
          'text-secondary': '#94A3B8',
          'text-muted': '#64748B',
        },
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'headline': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'title': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
        'data': ['1.75rem', { lineHeight: '1', fontWeight: '700' }],
      },
      spacing: {
        'sidebar': '260px',
        'sidebar-collapsed': '72px',
        'header': '64px',
      },
      borderRadius: {
        'glass': '16px',
        'card': '12px',
        'pill': '999px',
      },
      backdropBlur: {
        'glass': '24px',
        'heavy': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.3), 0 0 60px rgba(0, 229, 255, 0.1)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3), 0 0 60px rgba(168, 85, 247, 0.1)',
        'card-hover': '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 229, 255, 0.15)',
        'float': '0 20px 60px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'fade-up': 'fadeUp 0.5s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'breathe': 'breathe 4s ease-in-out infinite',
        'grid-move': 'gridMove 20s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0, 229, 255, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(0, 229, 255, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        gridMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(50px, 50px)' },
        },
      },
    },
  },
  plugins: [],
};
