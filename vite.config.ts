import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    dts({
      include: 'lib/**',
      exclude: ['node_modules', 'dist'],
      entryRoot: "lib",
      outDir: "dist",
      insertTypesEntry: true,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './lib'),
    },
  },
  build: {
    lib: {
      entry: './lib/index.ts', // Path to your main file exporting `useFormik`
      name: 'VueFormik',
      fileName: (format) => `vue-formik.${format}.js`,
      formats: ['es', 'cjs', 'umd'], // Multiple module formats
    },
    rollupOptions: {
      external: ['vue', 'yup'], // Specify external dependencies here
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  }
})
