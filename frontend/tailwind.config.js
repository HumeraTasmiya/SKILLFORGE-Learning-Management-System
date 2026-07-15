export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#4F46E5',
          secondary: '#06B6D4',
          accent: '#8B5CF6',
          dark: '#020617',
        },
      },
      boxShadow: {
        glow: '0 0 45px rgba(79, 70, 229, 0.35)',
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        glow: 'glow 5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        glow: {
          '0%, 100%': { opacity: 0.45 },
          '50%': { opacity: 0.9 },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
