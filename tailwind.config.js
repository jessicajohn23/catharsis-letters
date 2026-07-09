/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        violet: {
          DEFAULT: '#9B5DE5',
          dark: '#5E2B97',
          light: '#C9A2F0'
        },
        pink: {
          DEFAULT: '#F15BB5',
          soft: '#FFC2E2',
          deep: '#D63A93'
        },
        ink: '#3D2352',
        cream: '#FDF4FF',
        midnight: '#1A1025',
        midnightCard: '#2A1B3D'
      },
      fontFamily: {
        pixel: ['"Cormorant Garamond"', 'serif'],
        hand: ['"Patrick Hand"', 'cursive']
      },
      borderRadius: {
        pixel: '0px'
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px rgba(61,35,82,0.9)',
        pixelSm: '2px 2px 0px 0px rgba(61,35,82,0.9)'
      }
    }
  },
  plugins: []
}
