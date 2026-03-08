/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'card-3d': '0 10px 40px -12px rgb(0 0 0 / 0.15), 0 4px 12px -4px rgb(0 0 0 / 0.08)',
      },
      borderRadius: {
        'card': '1rem',
        'input': '0.75rem',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'orbFloat': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(8px, -12px) scale(1.05)' },
          '50%': { transform: 'translate(-5px, 8px) scale(0.98)' },
          '75%': { transform: 'translate(10px, 5px) scale(1.02)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'orbFloat': 'orbFloat 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
