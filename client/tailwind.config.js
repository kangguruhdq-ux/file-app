/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0A192F',
          dark: '#0B132B',
          slate: '#1E293B',
          blue: '#0284C7',
          sky: '#38BDF8',
          lightSky: '#BAE6FD',
          ice: '#E0F2FE',
          cardLight: '#BAE6FD',
          cardDark: '#0A192F',
          pillBlue: '#38BDF8',
          bg: '#F8FAFC'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'soft': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'card': '0 10px 25px -5px rgba(10, 25, 47, 0.08), 0 8px 10px -6px rgba(10, 25, 47, 0.04)',
        'float': '0 20px 35px -10px rgba(14, 165, 233, 0.35)',
      }
    },
  },
  plugins: [],
}
