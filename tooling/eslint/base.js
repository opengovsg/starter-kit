// @ts-check
/// <reference types="./types.d.ts" />

import eslint from "@eslint/js"
import importPlugin from "eslint-plugin-import"
import tseslint from "typescript-eslint"

/**
 * All packages that leverage t3-env should use this rule
 */
export const restrictEnvAccess = tseslint.config({
  files: ["**/*.js", "**/*.ts", "**/*.tsx"],
  rules: {
    "no-restricted-properties": [
      "error",
      {
        object: "process",
        property: "env",
        message:
          "Use `import { env } from '~/env'` instead to ensure validated types.",
      },
    ],
    "no-restricted-imports": [
      "error",
      {
        name: "process",
        importNames: ["env"],
        message:
          "Use `import { env } from '~/env'` instead to ensure validated types.",
      },
    ],
  },
})

export default tseslint.config(
  {
    // Globally ignored files
    ignores: ["**/*.config.*"],
  },
  {
    files: ["**/*.js"],
    plugins: {
      import: importPlugin,
    },
    extends: [eslint.configs.recommended],
    rules: {
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
      "no-unused-vars": ["error", { caughtErrorsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": [
        "error",
        { ignorePrimitives: true },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-misused-promises": [
        2,
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        {
          allowConstantLoopConditions: true,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
    },
    languageOptions: { parserOptions: { project: true } },
  },
  {
    files: ["**/*.spec.ts", "**/*.spec.tsx", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-restricted-syntax": "off",
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: true },
  },
)
