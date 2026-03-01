module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coffee: '#b58863',
        'coffee-light': '#d9c4ae',
        'coffee-dark':  '#9c7455',
        gold:           '#C9A84C',
        'gold-dark':    '#a8874a',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}