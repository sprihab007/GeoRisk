/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#05070a',
          900: '#0a0e14',
          850: '#0e131b',
          800: '#131a24',
          700: '#1b2430',
          600: '#26313f',
          500: '#3a4a5c',
        },
        accent: {
          400: '#5eead4',
          500: '#2dd4bf',
          600: '#14b8a6',
        },
        risk: {
          low: '#3ba55d',
          moderate: '#e0a72e',
          high: '#e05a3e',
          severe: '#c62b4f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 8px 32px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
}
