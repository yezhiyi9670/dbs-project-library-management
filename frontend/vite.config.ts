import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vuetify({
  })],
  server: {
    port: 4325,
    proxy: {
      '/api': 'http://localhost:4326',
    },
  }
})
