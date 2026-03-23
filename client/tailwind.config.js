/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',
        secondary: '#2563EB',
        lightblue: '#EFF6FF',
        graytext: '#374151'
      },
      borderRadius: { '2xl': '1rem' },
      boxShadow: { soft: '0 4px 24px rgba(0,0,0,0.08)' }
    }
  },
  plugins: []
}
