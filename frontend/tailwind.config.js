/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
      extend: {
          fontFamily: {
              sans: ["var(--font-geist)", "sans-serif"],
          },
          backgroundImage: {
              'fancy': 'background: radial-gradient(circle at 0% 0%, #C498AF00 0%, transparent 100%), linear-gradient(60deg, #885241 0%, #141234 74%, #885241 174%)',
              'background': 'background: #383838'
          }
      },
  },
  plugins: [],
}