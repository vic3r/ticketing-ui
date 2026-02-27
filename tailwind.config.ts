import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f3',
          100: '#f9efe4',
          200: '#f2dcc8',
          300: '#e8c4a3',
          400: '#dca67a',
          500: '#d18b5a',
          600: '#c3734f',
          700: '#a25b42',
          800: '#844b3b',
          900: '#6c3f32',
          950: '#3a1f19',
        },
        ink: {
          50: '#f6f6f7',
          100: '#e2e3e5',
          200: '#c4c6cb',
          300: '#9fa2a9',
          400: '#7a7e87',
          500: '#5f636c',
          600: '#4b4e56',
          700: '#3e4047',
          800: '#35373c',
          900: '#2f3034',
          950: '#1a1b1d',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
