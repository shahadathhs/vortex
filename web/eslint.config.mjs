import { nextMinimalConfig } from '@systemix/eslint/next-minimal.js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['postcss.config.mjs', 'next-env.d.ts'] },
  ...nextMinimalConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@next/next/no-img-element': 'warn',
      'no-console': 'off',
    },
  },
];
