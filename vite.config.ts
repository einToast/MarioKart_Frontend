import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
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
      }),
      legacy()
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src_backup/setupTests.ts',
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-ionic': ['@ionic/react', '@ionic/react-router'],
            'vendor-charts': ['chart.js', 'react-chartjs-2'],
            'vendor-react': ['react', 'react-dom', 'react-router', 'react-router-dom'],
            'vendor-utils': ['axios', 'sockjs-client', '@stomp/stompjs', 'date-fns', 'js-cookie', 'jwt-decode'],
          }
        }
      }
    }
  }
})
