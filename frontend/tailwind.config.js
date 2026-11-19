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
        trident: {
          950: '#06070a',
          900: '#0b0d13',
          850: '#111520',
          800: '#181e2e',
          700: '#232c42',
          600: '#344161',
          accent: '#00d2ff',
          neon: '#00f0ff',
          alert: '#ff3366',
          warning: '#ffaa00',
          success: '#00e676',
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
