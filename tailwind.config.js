/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'conic-gradient': 'conic-gradient(from 90deg at 50% 50%, #f54180 0%, #338ef7 50%, #f54180 100%)',
      },
    },
  },
  plugins: [],
}
