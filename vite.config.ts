import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  build: {
    lib: {
      entry: [
        fileURLToPath(new URL('./lib/index.ts', import.meta.url)),
        fileURLToPath(new URL('./lib/types/index.d.ts', import.meta.url)),
      ],
      fileName: (format, entryName) => `vue-formik-${entryName}.${format}.js`
    }
  }
})
