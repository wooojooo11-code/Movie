import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Pretendard', '"Noto Sans KR"', 'system-ui', 'sans-serif']
      },
      colors: {
        app: {
          surface: '#0b0d12',
          panel: '#121620',
          panelSoft: '#161a24',
          poster: '#191d28',
          line: 'rgba(255, 255, 255, 0.08)',
          accent: '#ff5d8f',
          violet: '#7d7bff',
          muted: '#9ea9bb'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
