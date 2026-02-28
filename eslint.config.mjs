import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { expressConfig } from '@systemix/eslint/express.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      'release.config.mjs',
      'eslint.config.mjs',
      'ecosystem.config.mjs',
    ],
  },
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
