import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env['API_TARGET'] ?? 'http://localhost:3000'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@wikigdd/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/wiki': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
