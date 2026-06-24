import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    vueJsx(),
    // Dev-server-only tooling; excluded from the library build.
    ...(command === 'serve' ? [vueDevTools()] : []),
    dts({
      // The root tsconfig.json is a solution-style file (no `include`), so point
      // the plugin at the app config that actually includes lib/**/*.
      tsconfigPath: 'tsconfig.app.json',
      include: ['lib/**/*.ts', 'lib/**/*.vue'],
      exclude: ['node_modules', 'dist', 'tests', 'env.d.ts'],
      entryRoot: 'lib',
      outDirs: ['dist'],
      // Emit the full per-module declaration tree into dist (with a dist/index.d.ts
      // entry). All cross-module type imports are relative and resolve within dist,
      // so the published package is self-contained without shipping lib/ sources.
      insertTypesEntry: true,
      cleanVueFileName: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './lib'),
    },
  },
  build: {
    sourcemap: true,
    lib: {
      entry: './lib/index.ts', // Path to your main file exporting `useFormik`
      name: 'VueFormik',
      fileName: (format) => `vue-formik.${format}.js`,
      formats: ['es', 'cjs', 'umd'], // Multiple module formats
    },
    rollupOptions: {
      external: ['vue'], // Specify external dependencies here
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
}))
