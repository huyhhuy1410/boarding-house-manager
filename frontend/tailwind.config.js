/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Be Vietnam Pro', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        bg: '#0b0f19',
        surface: '#151f32',
        'surface-hover': '#1e2d4a',
        border: '#223555',
        primary: '#4f46e5',
      }
    },
  },
  plugins: [],
}
