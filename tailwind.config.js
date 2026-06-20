/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#0b0f17',
        panel: '#121826',
        accent: '#3b82f6',
        poc: '#f59e0b',
      },
    },
  },
  plugins: [],
}
