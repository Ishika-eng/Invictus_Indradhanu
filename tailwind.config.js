/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          50: '#FDFDFC',
          100: '#F9FAF6',
          200: '#F2F4EC',
          300: '#E7EBE0',
          400: '#D7DECC',
          DEFAULT: '#F8F9F5',
        },
        agri: {
          50: '#EBF9F1',
          100: '#D8F3DC',
          200: '#B7E4C7',
          300: '#95D5B2',
          400: '#74C69D',
          500: '#52B788',
          600: '#40916C',
          700: '#2D6A4F',
          800: '#1B4332',
          900: '#081C15',
          950: '#04120C',
          DEFAULT: '#2D6A4F',
        },
        earth: {
          50: '#FDF8F5',
          100: '#FAECE4',
          200: '#F3D4C4',
          300: '#EABCA3',
          400: '#DE9977',
          500: '#C86D51',
          600: '#B05338',
          700: '#8C3D26',
          800: '#672A19',
          900: '#461B0E',
          DEFAULT: '#C86D51',
        },
        clay: {
          100: '#FEF3C7',
          300: '#FCD34D',
          500: '#DDA15E',
          700: '#BC6C25',
          DEFAULT: '#DDA15E',
        },
        skyalt: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          DEFAULT: '#0284C7',
        },
        moss: {
          950: '#0B1411',
          900: '#15221E',
          800: '#1D2F29',
          700: '#2A433B',
          600: '#3E5C52',
          500: '#5B7A70',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -1px rgba(27, 67, 50, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
        'soft': '0 10px 25px -3px rgba(27, 67, 50, 0.07), 0 4px 10px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 20px 35px -4px rgba(27, 67, 50, 0.09), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        'glow-agri': '0 0 25px -2px rgba(82, 183, 136, 0.35)',
        'glow-amber': '0 0 25px -2px rgba(245, 158, 11, 0.35)',
      },
      borderRadius: {
        '2xl': '1.125rem',
        '3xl': '1.625rem',
        '4xl': '2.25rem',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
