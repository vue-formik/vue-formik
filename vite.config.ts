import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import dts from 'vite-plugin-dts'
import path from 'path'
import { writeFileSync, readFileSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    dts({
      include: ['lib/**/*.ts', 'lib/**/*.vue'],
      exclude: ['node_modules', 'dist', 'tests', 'env.d.ts'],
      entryRoot: "lib",
      outDir: "dist",
      insertTypesEntry: false,
      copyDtsFiles: true,
      afterBuild: () => {
        // Read lib/index.ts and transform for pnpm link compatibility
        const libIndex = readFileSync(path.resolve(process.cwd(), 'lib/index.ts'), 'utf-8');
        const exports = libIndex.match(/export \{([^}]+)\}/)?.[1] || '';
        const exportNames = exports.split(',').map((e) => e.trim()).filter(Boolean);

        const indexContent = exportNames
          .map((name) => {
            const isComposable = name.startsWith('use');
            const filePath = isComposable
              ? `../lib/composables/${name}`
              : `../lib/components/${name}.vue`;
            return `export { default as ${name} } from '${filePath}';`;
          })
          .join('\n');

        writeFileSync(path.resolve(process.cwd(), 'dist/index.d.ts'), indexContent);
      },
    })
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
  }
})
