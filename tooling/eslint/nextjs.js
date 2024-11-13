import { fixupPluginRules } from "@eslint/compat"
import nextPlugin from "@next/eslint-plugin-next"
import tseslint from "typescript-eslint"

export default tseslint.config({
  files: ["**/*.ts", "**/*.tsx"],
  plugins: {
    "@next/next": fixupPluginRules(nextPlugin),
  },
  rules: {
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs["core-web-vitals"].rules,
  },
})
