/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          light: '#ffffff',
          dark: '#111111',
        },
        card: {
          light: '#ffffff',
          dark: '#23272f',
        },
        section: {
          light: '#f8f9fa',
          dark: '#18181b',
        },
      },
    },
  },
  plugins: [],
};
