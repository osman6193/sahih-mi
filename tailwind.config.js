/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1c1917',
        parchment: '#faf7f0',
        sand: '#efe8d8',
        emerald: {
          950: '#022c22',
        },
        gold: '#b8893b',
        sahih: '#15803d',
        hasen: '#0369a1',
        zayif: '#b45309',
        uydurma: '#b91c1c',
      },
      fontFamily: {
        serif: ['"Noto Serif"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['"Amiri"', '"Noto Naskh Arabic"', 'serif'],
      },
    },
  },
  plugins: [],
}
