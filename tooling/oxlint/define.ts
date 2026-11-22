import { defineConfig } from 'oxlint'
import type { OxlintConfig } from 'oxlint'

/**
 * `defineConfig` for a package's `oxlint.config.ts`. Oxlint inherits `options`,
 * `jsPlugins` and `rules` through `extends`, but reads `env` and `settings` only
 * off the root, so a preset's browser globals (which `no-eval` /
 * `no-implied-eval` need), React Doctor's mode or Tailwind's entry point would
 * silently drop. This hoists them from `extends`, at any depth, onto the root.
 */
export const defineAcmeConfig = (config: OxlintConfig): OxlintConfig => {
  const env: NonNullable<OxlintConfig['env']> = {}
  const settings: NonNullable<OxlintConfig['settings']> = {}

  const hoist = (preset: OxlintConfig) => {
    for (const nested of preset.extends ?? []) {
      hoist(nested)
    }

    Object.assign(env, preset.env)
    Object.assign(settings, preset.settings)
  }

  hoist(config)

  return defineConfig({ ...config, env, settings })
}
