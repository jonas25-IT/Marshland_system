/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f0',
          100: '#e0f2e1',
          200: '#c7e5c8',
          300: '#a3d5a5',
          400: '#6fbf6f',
          500: '#4a7c2e',
          600: '#2d5016',
          700: '#1e340f',
          800: '#15230a',
          900: '#0f1a07',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(rgba(45, 80, 22, 0.7), rgba(139, 195, 74, 0.7))',
        'glass': 'rgba(255, 255, 255, 0.95)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
