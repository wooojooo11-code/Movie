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
          surface: '#0c0e12',
          panel: '#111318',
          panelSoft: '#15171c',
          poster: '#181b22',
          line: '#23262d',
          accent: '#f06275',
          muted: '#98a0ad'
        }
      },
      boxShadow: {
        panel: '0 12px 30px rgba(0, 0, 0, 0.24)'
      }
    }
  },
  plugins: []
} satisfies Config;
