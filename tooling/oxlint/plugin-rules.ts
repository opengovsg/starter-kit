import type { DummyRule } from 'oxlint'

type RuleEntry = DummyRule | readonly [DummyRule, ...unknown[]]

const isOn = (entry: RuleEntry | undefined) => {
  const severity = Array.isArray(entry) ? entry[0] : entry

  return severity !== undefined && severity !== 'off' && severity !== 0
}

export const pluginRulesAtError = (
  prefix: string,
  rules: Readonly<Partial<Record<string, RuleEntry>>>
): Record<string, 'error'> =>
  Object.fromEntries(
    Object.entries(rules).flatMap(([rule, entry]) =>
      rule.startsWith(prefix) && isOn(entry) ? [[rule, 'error'] as const] : []
    )
  )

export const pluginRuleNamesAtError = (
  prefix: string,
  names: readonly string[],
  skip: ReadonlySet<string> = new Set()
): Record<string, 'error'> =>
  Object.fromEntries(
    names.flatMap((name) => {
      const rule = name.startsWith(prefix) ? name : `${prefix}${name}`

      return skip.has(rule) ? [] : [[rule, 'error'] as const]
    })
  )
