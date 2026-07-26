import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Netlify functions are JavaScript-only, so mount this endpoint in local dev and preview servers.
// @ts-expect-error This server-only module is intentionally outside the browser TypeScript project.
import theatricalMoviesHandlerModule from './netlify/functions/tmdb-theatrical.mjs';

const theatricalMoviesHandler = theatricalMoviesHandlerModule as () => Promise<Response>;

const theatricalMoviesDevPlugin = (): Plugin => ({
  name: 'theatrical-movies-dev-function',
  configureServer(server) {
    server.middlewares.use('/.netlify/functions/tmdb-theatrical', (_request, response, next) => {
      void theatricalMoviesHandler()
        .then(async (functionResponse) => {
          response.statusCode = functionResponse.status;
          functionResponse.headers.forEach((value, name) => response.setHeader(name, value));
          response.end(Buffer.from(await functionResponse.arrayBuffer()));
        })
        .catch(next);
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use('/.netlify/functions/tmdb-theatrical', (_request, response, next) => {
      void theatricalMoviesHandler()
        .then(async (functionResponse) => {
          response.statusCode = functionResponse.status;
          functionResponse.headers.forEach((value, name) => response.setHeader(name, value));
          response.end(Buffer.from(await functionResponse.arrayBuffer()));
        })
        .catch(next);
    });
  }
});

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [
      theatricalMoviesDevPlugin(),
      vue(),
      VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app-icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Moodie',
        short_name: 'Moodie',
        description: '영화를 평가하고 추천과 리스트를 관리하는 앱',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'ko-KR',
        categories: ['entertainment', 'lifestyle'],
        shortcuts: [
          {
            name: '취향분석',
            short_name: '취향분석',
            url: '/rating',
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          },
          {
            name: '추천',
            short_name: '추천',
            url: '/recommendations',
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          },
          {
            name: '리스트',
            short_name: '리스트',
            url: '/lists',
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          },
          {
            name: '극장',
            short_name: '극장',
            url: '/theaters',
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          }
        ],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/app-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'movie-poster-images',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
  };
});
