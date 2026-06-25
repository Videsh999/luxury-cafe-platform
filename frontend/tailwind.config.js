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
          cream: '#fdfbf7',
          gold: '#c5a059',
          goldLight: '#e5c07b',
          goldDark: '#a38641',
          charcoal: '#1a1a1a',
          gray: '#333333',
          lightGray: '#f5f5f5',
          accent: '#c5a059',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Outfit', 'sans-serif'],
        luxury: ['Cormorant Garamond', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'luxury-glow': 'radial-gradient(circle at center, rgba(197, 160, 89, 0.15) 0%, transparent 70%)',
        'gold-gradient': 'linear-gradient(135deg, #c5a059 0%, #e5c07b 50%, #a38641 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
        'soft': '0 20px 40px -15px rgba(0,0,0,0.3)',
        'luxury': '0 10px 50px -10px rgba(197, 160, 89, 0.2)',
        'glow': '0 0 20px rgba(197, 160, 89, 0.3)',
      },
      animation: {
        'slow-zoom': 'slow-zoom 20s infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'reveal': 'reveal 1.5s cubic-bezier(0.77, 0, 0.175, 1) forwards',
      },
      keyframes: {
        'slow-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'reveal': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
