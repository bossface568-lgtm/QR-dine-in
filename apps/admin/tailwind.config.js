/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          dark: '#E0531D',
          light: '#FFA382',
        },
        secondary: {
          DEFAULT: '#004E89',
          dark: '#003B68',
        },
        accent: '#F7C948',
        surface: {
          DEFAULT: '#1E293B',
          glass: 'rgba(30, 41, 59, 0.6)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'scale-up': 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: .8, transform: 'scale(1.015)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleUp: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
