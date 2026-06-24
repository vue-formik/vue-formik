import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

// vite.config exports a config function (to gate dev-only plugins by command);
// resolve it to a plain config object before merging.
const resolvedViteConfig = viteConfig({ command: 'serve', mode: 'test' })

export default mergeConfig(
  resolvedViteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      root: fileURLToPath(new URL('./', import.meta.url)),
      typecheck: {
        tsconfig: './tsconfig.vitest.json',
      },
      coverage: {
        enabled: true,
        provider: 'istanbul',
        reporter: ['text', 'html'],
        reportsDirectory: './coverage',
      }
    },
  }),
)
