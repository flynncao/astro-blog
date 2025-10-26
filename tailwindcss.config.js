/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      '3xl': { max: '2560' },
      'ssm: ': { max: '500px' },
    },
    extend: {},
    animation: { 'fade-in': 'fadeIn 2s ease-in-out ' },

  },
  plugins: [],
}
