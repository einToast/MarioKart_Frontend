import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import {defineConfig, loadEnv} from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    define: {
      'process.env.REACT_APP_BACKEND_PROTOCOL': JSON.stringify(env.REACT_APP_BACKEND_PROTOCOL),
      'process.env.REACT_APP_BACKEND_URL': JSON.stringify(env.REACT_APP_BACKEND_URL),
      'process.env.REACT_APP_BACKEND_PORT': JSON.stringify(env.REACT_APP_BACKEND_PORT),
    },
    plugins: [
      react(),
      legacy()
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src_backup/setupTests.ts',
    }
  }
})
