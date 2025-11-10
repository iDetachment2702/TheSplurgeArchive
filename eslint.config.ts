import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import markdown from '@eslint/markdown';
import { defineConfig, globalIgnores } from 'eslint/config';

import oxlint from 'eslint-plugin-oxlint';

export default defineConfig([
  globalIgnores(['.yarn/**', 'node_modules/**', 'dist/**', 'build/**', '.storybook/**', 'storybook-static/**']),
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  // React v17移行の新JSX変換をサポート
  pluginReact.configs.flat['jsx-runtime'],
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    plugins: { js },
    extends: ['js/recommended'],
    // ReactとNodeが混在したプロジェクト向けの設定
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    // Reactのバージョンを自動検出
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['article/md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    extends: ['markdown/recommended'],
  },
  ...oxlint.configs['flat/recommended'], // oxlint should be the last one
]);
