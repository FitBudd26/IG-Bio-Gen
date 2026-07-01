/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#009379',
          dark: '#007a64',
          tint: '#f0faf8',
        },
        accent: {
          DEFAULT: '#FE895C',
          dark: '#f5703d',
        },
      },
    },
  },
  plugins: [],
}
