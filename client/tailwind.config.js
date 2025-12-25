/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores del Coliseo Romano
        arena: {
          50: '#fdf8f0',
          100: '#f5e6d3',
          200: '#e8d4b8',
          300: '#d4b896',
          400: '#c4a35a', // Color principal arena
          500: '#b8956d',
          600: '#9a7b55',
          700: '#7d6346',
          800: '#5f4a35',
          900: '#3d3024',
        },
        gold: {
          50: '#fffdf0',
          100: '#fff9c4',
          200: '#fff176',
          300: '#ffee58',
          400: '#ffd700', // Oro
          500: '#ffc107',
          600: '#ffab00',
          700: '#ff8f00',
          800: '#ff6f00',
          900: '#e65100',
        },
        blood: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#8b0000', // Rojo sangre
          600: '#7f1d1d',
          700: '#6b1c1c',
          800: '#551919',
          900: '#3c1111',
        },
        bronze: {
          400: '#cd7f32',
          500: '#b87333',
        },
        stone: {
          850: '#1f2328',
        }
      },
      fontFamily: {
        roman: ['Cinzel', 'Times New Roman', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'coliseum-pattern': "url('/coliseum-bg.jpg')",
        'stone-texture': "linear-gradient(135deg, #3d3024 0%, #5f4a35 50%, #3d3024 100%)",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'typewriter': 'typewriter 2s steps(40) forwards',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #ffd700, 0 0 10px #ffd700' },
          '100%': { boxShadow: '0 0 20px #ffd700, 0 0 30px #ffd700' },
        },
        typewriter: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
}
