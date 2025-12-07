/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Material Darker (dark mode)
        'base-00': 'var(--base-00)',
        'base-01': 'var(--base-01)',
        'base-02': 'var(--base-02)',
        'base-03': 'var(--base-03)',
        'base-04': 'var(--base-04)',
        'base-05': 'var(--base-05)',
        'base-06': 'var(--base-06)',
        'base-07': 'var(--base-07)',
        'base-08': 'var(--base-08)',
        'base-09': 'var(--base-09)',
        'base-0A': 'var(--base-0A)',
        'base-0B': 'var(--base-0B)',
        'base-0C': 'var(--base-0C)',
        'base-0D': 'var(--base-0D)',
        'base-0E': 'var(--base-0E)',
        'base-0F': 'var(--base-0F)',
        // Legacy colors for backward compatibility
        primary: 'var(--base-0D)',
        secondary: 'var(--base-0C)',
        accent1: 'var(--base-09)',
        accent2: 'var(--base-0E)',
        bg: 'var(--base-00)',
      },
    },
  },
  plugins: [],
}

