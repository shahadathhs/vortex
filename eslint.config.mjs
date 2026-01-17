import { baseConfig } from '@vortex/eslint-config/base.js';
import { expressConfig } from '@vortex/eslint-config/express.js';

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.turbo/**'],
  },
  ...baseConfig,
  ...expressConfig.map((config) => ({
    ...config,
    files: ['services/**/*.{js,ts,tsx}', 'gateway/**/*.{js,ts,tsx}'],
  })),
];
