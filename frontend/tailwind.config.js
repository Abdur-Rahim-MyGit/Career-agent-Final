/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        'bg-primary': 'var(--color-background-primary)',
        'bg-secondary': 'var(--color-background-secondary)',
        'bg-info': 'var(--color-background-info)',
        'bg-success': 'var(--color-background-success)',
        'bg-warning': 'var(--color-background-warning)',
        'bg-danger': 'var(--color-background-danger)',
        'text-pri': 'var(--color-text-primary)',
        'text-sec': 'var(--color-text-secondary)',
        'text-info': 'var(--color-text-info)',
        'text-success': 'var(--color-text-success)',
        'text-warning': 'var(--color-text-warning)',
        'text-danger': 'var(--color-text-danger)',
      }
    },
  },
  plugins: [],
}
