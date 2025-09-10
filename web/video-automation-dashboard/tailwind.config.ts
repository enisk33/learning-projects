import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Deep Purple (#6C2FA8) Palette
        primary: {
          50: '#f8f5fb',
          100: '#f0e8f6',
          200: '#e0cce9',
          300: '#d0b1dd',
          400: '#9d5fc2',
          500: '#6C2FA8',
          600: '#5f2898',
          700: '#522088',
          800: '#451878',
          900: '#381068',
          950: '#2b0a58',
        },
        // Bright Turquoise (#40E0D0) Palette
        accent: {
          50: '#f0fffe',
          100: '#cffffe',
          200: '#9fffff',
          300: '#6ffffc',
          400: '#40E0D0',
          500: '#30cfc2',
          600: '#28b8b0',
          700: '#209e9a',
          800: '#188484',
          900: '#106a6e',
          950: '#0a5058',
        },
        // Neutral Gray
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-accent': '0 0 20px rgba(20, 184, 166, 0.3)',
      },
      animation: {
        blob: 'blob 7s infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
