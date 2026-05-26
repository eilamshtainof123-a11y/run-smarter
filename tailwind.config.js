/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        d: {
          bg: '#0d1117',
          surface: '#111827',
          card: '#161b22',
          card2: '#1c2128',
          border: '#1f2937',
          border2: '#30363d',
          muted: '#4b5563',
          sub: '#6b7280',
          text: '#e6edf3',
          blue: '#58a6ff',
          'blue-dim': '#1e3a5f',
          'blue-mid': '#2563a8',
          green: '#3fb950',
          'green-dim': '#14291d',
          amber: '#d29922',
          'amber-dim': '#2a1f00',
          red: '#f85149',
          'red-dim': '#2a1010',
          purple: '#a78bfa',
          'purple-dim': '#1f1535',
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 1.2s infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
