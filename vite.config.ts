import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
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
      setupFiles: './src_backup/setupTests.ts',
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
