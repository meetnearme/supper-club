/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './script.js'],
  theme: {
    extend: {
      colors: {
        linen: '#f7f5ee',
        paper: '#eeece2',
        forest: '#293e32',
        olive: '#687153',
        rust: '#9d4f38',
        ink: '#30392f',
        muted: '#62675b',
        line: '#dbdccf',
      },
      fontFamily: {
        sans: ['DM Sans', 'Arial', 'sans-serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
      },
      maxWidth: { page: '1240px' },
      screens: { xs: '440px' },
    },
  },
  plugins: [],
};
