/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#fff4f0',
          100: '#ffe8de',
          200: '#ffd0bc',
          300: '#ffb09a',
          400: '#ff8c6b',
          500: '#ff6b35',
          600: '#e85a2a',
          700: '#c94a20',
          800: '#a03a18',
          900: '#7a2c12',
        },
        neutral: {
          50:  '#fafafa',
          100: '#f8f8f4',
          200: '#f0f0ec',
          300: '#e0e0dc',
          400: '#c0c0bc',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#141414',
        },
      },
    },
  },
  plugins: [],
}
