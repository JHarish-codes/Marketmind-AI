/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0B0E14',
          800: '#121721',
          700: '#1A2130',
          600: '#252F45',
          500: '#344262'
        },
        bullish: {
          DEFAULT: '#10B981',
          dark: '#059669',
          light: '#34D399'
        },
        bearish: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
          light: '#F87171'
        }
      }
    },
  },
  plugins: [],
}
