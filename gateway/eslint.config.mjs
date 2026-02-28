import { dirname } from 'path';
import { fileURLToPath } from 'url';

import expressConfig from '@systemix/eslint/express.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...expressConfig,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
  },
];
