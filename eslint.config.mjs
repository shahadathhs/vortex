import { baseConfig } from '@vortex/eslint-config/base.js';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ['services/**', 'packages/**', 'gateway/**'],
  },
  ...baseConfig,
];
