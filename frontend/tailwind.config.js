/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sentinel: {
          bg: '#0a0e1a',
          surface: '#111827',
          card: 'rgba(17, 24, 39, 0.6)',
          border: 'rgba(99, 102, 241, 0.2)',
          cyan: '#06b6d4',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          pink: '#ec4899',
          green: '#10b981',
          red: '#ef4444',
          orange: '#f97316',
          yellow: '#eab308',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(59, 130, 246, 0.3)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.4)',
        'glow-purple': '0 0 25px rgba(139, 92, 246, 0.4)',
        'glow-red': '0 0 25px rgba(239, 68, 68, 0.5)',
      },
      animation: {
        pulse_slow: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        scan: 'scan 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '50px 50px',
      },
    },
  },
  plugins: [],
};
