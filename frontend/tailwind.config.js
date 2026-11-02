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
        ops: {
          bg: '#080c14',
          surface: '#0f1623',
          card: '#151f30',
          elevated: '#1c283f',
          border: '#233047',
          borderLight: '#324463',
          text: '#f1f5f9',
          muted: '#94a3b8',
          faint: '#64748b',
        },
        emg: {
          critical: '#ef4444',
          warning: '#f59e0b',
          safe: '#10b981',
          info: '#3b82f6',
          cyan: '#06b6d4',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Inter', 'sans-serif'],
        mono: ['SF Mono', 'Menlo', 'Monaco', 'JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
