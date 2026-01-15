import { defineConfig, globalIgnores } from 'eslint/config'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import importPlugin from 'eslint-plugin-import-x'
import stylistic from '@stylistic/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import reactPlugin from 'eslint-plugin-react'

export default defineConfig([
  globalIgnores([
    'node_modules',
    '**/build',
    '**/dist',
    'coverage',
    '**/setupTests.ts',
    '**/*.d.ts',
    '*.config.[tj]s',
    'cypress',
    '.sst',
  ]),
  {
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: [
            'tsconfig.json',
          ],
        },
      },
      react: {
        version: 'detect',
      },
    },
  },
  eslint.configs.recommended,
  tseslint.configs.eslintRecommended,
  tseslint.configs.recommended,
  importPlugin.flatConfigs.errors,
  importPlugin.flatConfigs.warnings,
  importPlugin.flatConfigs.typescript,
  reactPlugin.configs.flat.recommended,
  {
    plugins: {
      '@stylistic': stylistic,
      'react-hooks': reactHooks,
      'import': importPlugin, // Alias import to import-x
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'arrow-parens': ['error', 'as-needed'],
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      'import-x/no-rename-default': 'off',
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/indent': ['error', 2],
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',

      // Fix missing rule overwrites from premade configs
      'import/no-unresolved': 'off', // We use import-x/no-unresolved
      '@typescript-eslint/indent': 'off', // We use @stylistic/indent
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: 'tsconfig.json',
        ecmaVersion: 'latest',
      },
    },
    rules: {
      '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_$',
          caughtErrorsIgnorePattern: '^_$',
        },
      ],
      '@typescript-eslint/dot-notation': 'error',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/tests/**/*.ts', '**/tests/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['scraper/**/*.ts', 'app/**/*.ts', 'app/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
])
