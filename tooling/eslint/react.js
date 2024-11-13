import reactPlugin from "eslint-plugin-react"
import hooksPlugin from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"

export default tseslint.config({
  files: ["**/*.ts", "**/*.tsx"],
  plugins: {
    react: reactPlugin,
    "react-hooks": hooksPlugin,
  },
  rules: {
    ...reactPlugin.configs["jsx-runtime"].rules,
    ...hooksPlugin.configs.recommended.rules,
  },
  languageOptions: {
    globals: {
      React: "writable",
    },
  },
})
