/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F6', // Warm cream
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#4A7C59', // Rich Sage Green
          dark: '#386044',
          light: '#E6F0EA',
        },
        teal: {
          DEFAULT: '#2D6A78', // Deep Teal
          light: '#E1EEF2',
        },
        info: {
          DEFAULT: '#3B8EA5', // Bright Blue/Teal
          light: '#E8F4F8',
        },
        peach: {
          DEFAULT: '#E88D72', // Warm Peach
          light: '#FDECE7',
        },
        warning: {
          DEFAULT: '#D99A38', // Amber / Gold
          light: '#FDF4E6',
        },
        danger: {
          DEFAULT: '#C75252', // Coral Red
          light: '#FAEAEA',
        },
        text: {
          main: '#1E2630', // Dark Charcoal/Navy
          secondary: '#5A6875',
        },
        border: {
          DEFAULT: '#E2E6EA',
        },
        sidebar: { DEFAULT: '#FAF9F6', hover: '#E6F0EA', active: '#E6F0EA' },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in': 'slideIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
};
