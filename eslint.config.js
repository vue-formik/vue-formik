import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import pluginVitest from '@vitest/eslint-plugin'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'lib/files-to-lint',
    files: ['lib/**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'tests/files-to-lint',
    files: ['tests/**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'lib/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),

  {
    ...pluginVitest.configs.recommended,
    files: ['tests/**/*.{ts,mts,tsx,vue}'],
  },

  skipFormatting,
]
