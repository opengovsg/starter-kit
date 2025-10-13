import storybook from 'eslint-plugin-storybook'
import { defineConfig } from 'eslint/config'

export default defineConfig([...storybook.configs['flat/recommended']])
