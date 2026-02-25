/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'yt-red': '#FF0000',
        'yt-red-dark': '#CC0000',
        'bg-main': '#0F0F0F',
        'bg-secondary': '#181818',
        'bg-tertiary': '#212121',
        'bg-quaternary': '#2D2D2D',
        'border-main': '#303030',
        'border-subtle': '#1F1F1F',
        'text-main': '#F1F1F1',
        'text-secondary': '#AAAAAA',
        'text-tertiary': '#717171',
      },
      fontFamily: {
        barlow: ['Barlow', 'sans-serif'],
        'barlow-condensed': ['Barlow Condensed', 'sans-serif'],
        jetbrains: ['JetBrains Mono', 'monospace'],
      },
       animation: {
        'pulse-red': 'pulseRed 1.5s infinite',
        'fade-up': 'fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 0, 0, 0.5)' },
          '50%': { boxShadow: '0 0 0 6px rgba(255, 0, 0, 0)' },
        },
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
