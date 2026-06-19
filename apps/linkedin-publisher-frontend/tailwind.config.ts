import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../../packages/shared/src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-app': 'var(--bg-app)',
        'bg-card': 'var(--bg-card)',
        'bg-hover': 'var(--bg-hover)',
        'bg-input': 'var(--bg-input)',
        'bg-sidebar': 'var(--bg-sidebar)',
        'bg-active-card': 'var(--bg-active-card)',
        'border-color': 'var(--border-color)',
        'border-active-card': 'var(--border-active-card)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'brand-blue': 'var(--color-primary)',
        'brand-blue-hover': 'var(--color-primary-hover)',
      },
      boxShadow: {
        'subtle': 'var(--shadow-subtle)',
      },
    },
  },
} satisfies Config;
