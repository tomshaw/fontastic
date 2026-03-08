import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import angularEslint from '@angular-eslint/eslint-plugin';
import angularTemplateEslint from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['app/**/*', 'dist/**/*', 'release/**/*', 'node_modules/**/*', 'src/environments/*', 'e2e/playwright.config.ts'],
  },

  // TypeScript files
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['./src/tsconfig.app.json', './src/tsconfig.spec.json'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        Electron: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      '@angular-eslint': angularEslint,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...angularEslint.configs.recommended.rules,

      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@angular-eslint/directive-selector': 'off',
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },

  // Test files
  {
    files: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    languageOptions: {
      globals: {
        ...globals.vitest,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
  },

  // E2E TypeScript files
  {
    files: ['e2e/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ['./e2e/tsconfig.e2e.json'],
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
    },
  },

  // HTML templates
  {
    files: ['src/**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplateEslint,
    },
    rules: {
      ...angularTemplateEslint.configs.recommended.rules,
    },
  },

  // Prettier must be last to override conflicting rules
  eslintConfigPrettier,
];
