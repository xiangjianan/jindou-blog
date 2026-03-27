export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['Noto Serif SC', 'Georgia', 'serif'],
        sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      colors: {
        warm: {
          50: '#fefcf8',
          100: '#fdf6e3',
          200: '#f5e6c8',
          800: '#3d3229',
          900: '#2c2419',
        },
      },
    },
  },
  plugins: [],
};
