import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'wanderlust-hub-169.cluster-12.preview.emergentcf.cloud',
      'wanderlust-hub-169.preview.emergentagent.com',
      '.preview.emergentagent.com',
      '.emergentcf.cloud',
      'localhost'
    ]
  }
})
