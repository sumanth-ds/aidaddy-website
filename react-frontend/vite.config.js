import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env variables for this mode (dev/production)
  const env = loadEnv(mode, process.cwd(), '');
  // Vite env variables are prefixed with VITE_ to be exposed to client
  const backendUrl = env.VITE_API_BASE_URL || 'http://localhost:5000';

  const createProxy = (path) => ({ target: backendUrl, changeOrigin: true });

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': createProxy('/api'),
        '/contact': createProxy('/contact'),
        '/book-meeting': createProxy('/book-meeting'),
        '/logout': createProxy('/logout'),
        '/admin/download': createProxy('/admin/download'),
        '/admin/meeting': createProxy('/admin/meeting'),
        '/admin/contact': createProxy('/admin/contact'),
      }
    }
  }
})
