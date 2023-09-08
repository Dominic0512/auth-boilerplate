import daisyui from 'daisyui';
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      maxWidth: {
        '8xl': '88rem',
        '10xl': '104rem',
        '12xl': '120rem',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ['light', 'dark'],
  },
  darkMode: 'data-theme',
};
