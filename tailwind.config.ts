import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', '"Noto Sans KR"', 'system-ui', 'sans-serif']
      },
      colors: {
        app: {
          surface: '#ffffff',
          panel: '#ffffff',
          panelSoft: '#f5f6f8',
          poster: '#f0f2f5',
          line: '#d9dde3',
          accent: '#5f8fc2',
          muted: '#63758c'
        }
      },
      boxShadow: {
        panel: '0 12px 30px rgba(0, 0, 0, 0.24)'
      }
    }
  },
  plugins: []
} satisfies Config;
