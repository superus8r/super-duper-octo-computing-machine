import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        'xl': '1rem',
      },
      colors: {
        // Optional: lightweight aliases if you want to keep naming similar
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 3px 0 rgba(0,0,0,0.1)'
      }
    },
  },
  plugins: [],
} satisfies Config