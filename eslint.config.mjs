import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  next(),
  {
    rules: {
      // Erro para qualquer console, mas permitimos error/warn (opcional)
      'no-console': ['error', { allow: ['warn', 'error'] }]
    }
  }
];

export default eslintConfig;
