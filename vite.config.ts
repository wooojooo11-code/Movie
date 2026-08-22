import type { ServerResponse } from 'node:http';
import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Netlify runs these handlers in production. Vite's dev and preview servers do
// not know about /.netlify/functions by default, so expose the same endpoints
// locally without putting server-only API keys in the browser bundle.
// @ts-expect-error Netlify functions are authored as native ESM JavaScript.
import kobisBoxOfficeHandler from './netlify/functions/kobis-boxoffice.mjs';
// @ts-expect-error Netlify functions are authored as native ESM JavaScript.
import tmdbKobisDetailHandler from './netlify/functions/tmdb-kobis-detail.mjs';
// @ts-expect-error Netlify functions are authored as native ESM JavaScript.
import tmdbMovieCastHandler from './netlify/functions/tmdb-movie-cast.mjs';
// @ts-expect-error Netlify functions are authored as native ESM JavaScript.
import tmdbTrailerHandler from './netlify/functions/tmdb-trailer.mjs';

type NetlifyFunctionHandler = (request: Request) => Promise<Response>;

const localNetlifyFunctionHandlers = new Map<string, NetlifyFunctionHandler>([
  ['/.netlify/functions/kobis-boxoffice', kobisBoxOfficeHandler],
  ['/.netlify/functions/tmdb-kobis-detail', tmdbKobisDetailHandler],
  ['/.netlify/functions/tmdb-movie-cast', tmdbMovieCastHandler],
  ['/.netlify/functions/tmdb-trailer', tmdbTrailerHandler]
]);

const writeFunctionResponse = async (response: Response, serverResponse: ServerResponse) => {
  serverResponse.statusCode = response.status;
  response.headers.forEach((value, name) => serverResponse.setHeader(name, value));
  serverResponse.end(Buffer.from(await response.arrayBuffer()));
};

const localNetlifyFunctionMiddleware: Connect.NextHandleFunction = (request, response, next) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);
  const handler = localNetlifyFunctionHandlers.get(requestUrl.pathname.replace(/\/$/, ''));

  if (!handler) {
    next();
    return;
  }

  void (async () => {
    try {
      const requestHeaders = new Headers();

      for (const [name, value] of Object.entries(request.headers)) {
        if (Array.isArray(value)) {
          value.forEach((item) => requestHeaders.append(name, item));
        } else if (value !== undefined) {
          requestHeaders.set(name, value);
        }
      }

      const functionRequest = new Request(requestUrl, {
        method: request.method,
        headers: requestHeaders
      });
      await writeFunctionResponse(await handler(functionRequest), response);
    } catch (error) {
      console.error(`Local Netlify function failed: ${requestUrl.pathname}`, error);
      response.statusCode = 500;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.end(JSON.stringify({ error: 'Local Netlify function failed.' }));
    }
  })();
};

const localNetlifyFunctions = (): Plugin => ({
  name: 'local-netlify-functions',
  configureServer(server) {
    server.middlewares.use(localNetlifyFunctionMiddleware);
  },
  configurePreviewServer(server) {
    server.middlewares.use(localNetlifyFunctionMiddleware);
  }
});

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return {
    plugins: [
      vue(),
      localNetlifyFunctions(),
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
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
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
