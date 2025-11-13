import storybook from 'eslint-plugin-storybook'

export default [
  {
    ignores: ['!.storybook'],
  },
  ...storybook.configs['flat/recommended'],
]
