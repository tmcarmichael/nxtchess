/** @type {import('tailwindcss').Config} */

/* TODO-TAILWIND */
module.exports = {
  // darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // colors: {
      //   background: '#121212',
      //   foreground: '#e0e0e0',
      //   grey: {
      //     100: '#e0e0e0',
      //     200: '#bdbdbd',
      //     300: '#9e9e9e',
      //     400: '#757575',
      //     500: '#616161',
      //     600: '#424242',
      //     700: '#303030',
      //     800: '#212121',
      //     900: '#121212',
      //   },
      //   accentGreen: '#4ade80',
      //   accentBlue: '#60a5fa',
      // },
      // opacity: {
      //   40: '0.4',
      //   50: '0.5',
      //   60: '0.6',
      //   70: '0.7',
      //   80: '0.8',
      //   90: '0.9',
      // },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
    // require('@tailwindcss/line-clamp'),
    // require('tailwindcss-animate'),
  ],
};
