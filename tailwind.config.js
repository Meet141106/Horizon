export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#040810',
        surface: '#0a0f1e',
        elevated: '#111827',
        teal: {
          DEFAULT: '#00e5c7',
          muted: 'rgba(0,229,199,0.12)',
        },
        amber: {
          DEFAULT: '#f59e0b',
          muted: 'rgba(245,158,11,0.12)',
        },
        success: '#22c55e',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Syne', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(245,158,11,0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(245,158,11,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(245,158,11,0)' },
        },
      },
    },
  },
}
