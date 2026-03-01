import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          980: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          679: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          DEFAULT: '#06b6d4',
          dark: '#0891b2',
        },
        // Workspace nav bar (leftmost)
        nav: {
          light: '#eff6ff',
          dark: '#0c1929',
        },
        // Sidebar
        sidebar: {
          light: '#f0f7ff',
          dark: '#111d2e',
          bg: '#111d2e',
          hover: 'rgba(59,130,246,0.12)',
          active: 'rgba(59,130,246,0.2)',
          text: '#e0eaff',
          muted: '#7a8ea6',
        },
        // Main chat area
        chat: {
          bg: '#152238',
          surface: '#182840',
          hover: '#1e3250',
          border: '#243a54',
          text: '#dfe8f5',
          muted: '#7a8ea6',
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 1.5s infinite',
        'pulse-dot': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
