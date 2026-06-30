/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        teal: {
          50: '#EAF3F1',
          100: '#CFE3DF',
          200: '#A3C7C0',
          300: '#73A99F',
          400: '#458B7F',
          500: '#246E61',
          600: '#0B4F4A', // primary
          700: '#093F3B',
          800: '#072F2C',
          900: '#051F1D',
          950: '#031211',
        },
        gold: {
          50: '#FBF3E2',
          100: '#F5E3BB',
          200: '#EDCD8A',
          300: '#E4B85A',
          400: '#D9A441', // accent
          500: '#C28E2D',
          600: '#9C7222',
          700: '#76561A',
          800: '#503A11',
          900: '#2A1E09',
        },
        ink: {
          50: '#EDF0EF',
          100: '#D3D9D8',
          200: '#A6B3B0',
          300: '#798D89',
          400: '#536A66',
          500: '#36504C',
          600: '#243835',
          700: '#172825',
          800: '#0E1B19', // deep ink
          900: '#081110',
          950: '#040908',
        },
        cream: '#F7F5F0',
        success: { DEFAULT: '#3F8F5F', light: '#E4F2E9' },
        danger: { DEFAULT: '#C24A3D', light: '#FBEAE8' },
        warning: { DEFAULT: '#D9A441', light: '#FBF3E2' },
        info: { DEFAULT: '#3B6FA0', light: '#E8F0F8' },
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(8,17,16,0.04), 0 8px 24px -8px rgba(8,17,16,0.10)',
        'card-hover': '0 4px 12px rgba(8,17,16,0.08), 0 16px 32px -12px rgba(8,17,16,0.16)',
      },
      backgroundImage: {
        'ledger-stripe': 'repeating-linear-gradient(90deg, transparent, transparent 7px, rgba(217,164,65,0.10) 7px, rgba(217,164,65,0.10) 8px)',
      },
    },
  },
  plugins: [],
}
