/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        luxury: {
          dark: '#050505',
          obsidian: '#0a0a0a',
          gold: '#c5a059',
          cream: '#fdfbf7',
          charcoal: '#1a1a1a',
          accent: '#d4af37',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        classic: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'luxury': '0 20px 50px -10px rgba(0, 0, 0, 0.8)',
        'glow': '0 0 20px rgba(197, 160, 89, 0.2)',
        'glow-strong': '0 0 40px rgba(197, 160, 89, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite',
        'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.6 },
        },
        'pulse-subtle': {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
          '50%': { transform: 'scale(1.05)', opacity: 0.8 },
        }
      }
    },
  },
  plugins: [],
}
