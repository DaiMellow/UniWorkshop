import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electronRenderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  plugins: [
    vue(),
    electronRenderer()
  ],
  build: {
    sourcemap: false
  },
  esbuild: {
    legalComments: 'none'
  },
  externals: ['sequelize']
})
