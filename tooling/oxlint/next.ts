import { defineConfig } from 'oxlint'
import ultraciteNext from 'ultracite/oxlint/next'
import nextReactDoctor from 'ultracite/oxlint/next/js-plugins'

export const next = defineConfig({
  extends: [ultraciteNext, nextReactDoctor],
})
