import eslint from '@eslint/js'
import prettier from 'eslint-config-prettier'
import { globalIgnores } from 'eslint/config'
import tsEslint, { ConfigArray } from 'typescript-eslint'

export default tsEslint.config(
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/dev-dist/**',
    '**/out/**',
    '**/temp/**',
    '**/examples/**',
    'build/',
    'apps/dapp/cache',
    '**/scripts/**',
    '**/*.min.js',
    '**/vite.config.ts',
    '**/*.spec.ts',
  ]),
  eslint.configs.recommended,
  tsEslint.configs.recommended,
  prettier,
  {
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  }
) as ConfigArray
