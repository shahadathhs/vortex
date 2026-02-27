import { expressConfig } from '@systemix/eslint/express.js';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.turbo/**'],
  },
  ...expressConfig,
];
