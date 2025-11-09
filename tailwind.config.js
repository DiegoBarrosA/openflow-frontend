/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#82AAFF',
        secondary: '#88D8C0',
        accent1: '#FFB399',
        accent2: '#B19CD9',
        bg: '#F5F5F5',
      },
    },
  },
  plugins: [],
}

