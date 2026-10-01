import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.REACT_APP_BACKEND_PROTOCOL': JSON.stringify(env.REACT_APP_BACKEND_PROTOCOL),
      'process.env.REACT_APP_BACKEND_URL': JSON.stringify(env.REACT_APP_BACKEND_URL),
      'process.env.REACT_APP_BACKEND_PORT': JSON.stringify(env.REACT_APP_BACKEND_PORT),
      'process.env.REACT_APP_BACKEND_PATH': JSON.stringify(env.REACT_APP_BACKEND_PATH),
      'process.env.REACT_APP_BACKEND_WS_PROTOCOL': JSON.stringify(env.REACT_APP_BACKEND_WS_PROTOCOL),
      'process.env.REACT_APP_BACKEND_WS_URL': JSON.stringify(env.REACT_APP_BACKEND_WS_URL),
      'process.env.REACT_APP_BACKEND_WS_PORT': JSON.stringify(env.REACT_APP_BACKEND_WS_PORT),
      'process.env.REACT_APP_BACKEND_WS_PATH': JSON.stringify(env.REACT_APP_BACKEND_WS_PATH),
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
      }),
      legacy()
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      include: ['src/**/*.test.{ts,tsx}'],
      // Only print console output of failing tests; the app logs a lot on expected error paths.
      silent: 'passed-only',
      // Cookies are written with `secure: true`, which jsdom only reads back on https origins.
      environmentOptions: { jsdom: { url: 'https://localhost:5173' } },
      env: {
        REACT_APP_BACKEND_PROTOCOL: 'http',
        REACT_APP_BACKEND_URL: 'localhost',
        REACT_APP_BACKEND_PORT: '8080',
        REACT_APP_BACKEND_PATH: 'api',
        REACT_APP_BACKEND_WS_PROTOCOL: 'http',
        REACT_APP_BACKEND_WS_URL: 'localhost',
        REACT_APP_BACKEND_WS_PORT: '8080',
        REACT_APP_BACKEND_WS_PATH: 'api/ws',
      },
      // Under Node, @lit/react resolves to its SSR build, which never attaches the Ionic
      // custom event listeners (onIonChange, onIonRefresh, ...). Force the browser build.
      alias: [
        { find: /^@lit\/react$/, replacement: fileURLToPath(new URL('./node_modules/@lit/react/index.js', import.meta.url)) },
      ],
      server: {
        deps: {
          inline: [/@ionic\/react/, /@stencil\/react-output-target/],
        },
      },
    },
    build: {
      cssMinify: 'esbuild',
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vendor-base',
                test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
                priority: 60,
              },
              {
                name: 'vendor-ionic-core',
                test: /node_modules[\\/]@ionic[\\/]core[\\/]/,
                priority: 50,
              },
              {
                name: 'vendor-ionic-react',
                test: /node_modules[\\/]@ionic[\\/]react[\\/]/,
                priority: 45,
              },
              {
                name: 'vendor-routing',
                test: /node_modules[\\/](react-router|react-router-dom)[\\/]|node_modules[\\/]@ionic[\\/]react-router[\\/]/,
                priority: 40,
              },
              {
                name: 'vendor-charts',
                test: /node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
                priority: 30,
              },
              {
                name: 'vendor-utils',
                test: /node_modules[\\/](axios|sockjs-client|date-fns|js-cookie|jwt-decode)[\\/]|node_modules[\\/]@stomp[\\/]stompjs[\\/]/,
                priority: 20,
              },
              {
                name: 'vendor',
                test: /node_modules[\\/]/,
                priority: 10,
              }
            ]
          }
        }
      }
    }
  }
})
