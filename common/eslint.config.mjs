import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { baseConfig } from '@systemix/eslint/base.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: ['tsup.config.ts'],
  },
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
];
