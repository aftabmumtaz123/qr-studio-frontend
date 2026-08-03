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
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bbfd',
          400: '#8196fa',
          500: '#6272f5',
          600: '#4f53ea',
          700: '#4240d0',
          800: '#3636a9',
          900: '#313285',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          600: '#3a4a63',
          700: '#2d3d55',
          800: '#1e293b',
          850: '#172035',
          900: '#0f172a',
          950: '#090e1a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        }
      },
      boxShadow: {
        'glow': '0 0 20px rgba(98, 114, 245, 0.3)',
        'glow-lg': '0 0 40px rgba(98, 114, 245, 0.4)',
      }
    },
  },
  plugins: [],
}
