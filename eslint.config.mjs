import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend Next.js ESLint rules
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Additional project rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Fail commit if console.log is used (allows warn/error)
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
];

export default eslintConfig;
