/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      fontFamily: {
        'fredoka': ['Fredoka One', 'cursive'],
        'nunito': ['Nunito', 'sans-serif'],
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'wiggle': 'wiggle 0.6s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
        'timer-tick': 'timer-tick 1s ease-in-out infinite',
        'confetti': 'confetti 2s ease-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-10deg)' },
          '75%': { transform: 'rotate(10deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'timer-tick': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        confetti: {
          '0%': { 
            opacity: '0', 
            transform: 'translateX(-50%) translateY(0) scale(0)' 
          },
          '20%': { 
            opacity: '1', 
            transform: 'translateX(-50%) translateY(-10px) scale(1)' 
          },
          '80%': { 
            opacity: '1', 
            transform: 'translateX(-50%) translateY(-20px) scale(1.1)' 
          },
          '100%': { 
            opacity: '0', 
            transform: 'translateX(-50%) translateY(-30px) scale(0.8)' 
          },
        },
      },
      colors: {
        'gesture-primary': {
          50: '#f0f7ff',
          100: '#e0efff',
          500: '#667eea',
          600: '#5a67d8',
          700: '#4c51bf',
        },
        'gesture-secondary': {
          50: '#f7fafc',
          100: '#edf2f7',
          500: '#a0aec0',
          600: '#718096',
          700: '#4a5568',
        },
      },
      backgroundImage: {
        'rainbow-gradient': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
        'primary-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'success-gradient': 'linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%)',
        'error-gradient': 'linear-gradient(135deg, #fed7d7 0%, #fc8181 100%)',
      },
      boxShadow: {
        'gesture': '0 20px 40px rgba(0, 0, 0, 0.1)',
        'gesture-hover': '0 25px 50px rgba(102, 126, 234, 0.3)',
      },
    },
  },
  plugins: [],
}
