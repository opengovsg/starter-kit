export const pluginRulesAtError = (
  prefix: string,
  rules: Record<string, unknown>
): Record<string, 'error'> =>
  Object.fromEntries(
    Object.entries(rules)
      .filter(([rule, severity]) => {
        const rank = Array.isArray(severity) ? severity[0] : severity
        return rule.startsWith(prefix) && rank !== 'off' && rank !== 0
      })
      .map(([rule]) => [rule, 'error'] as const)
  )

export const pluginRuleNamesAtError = (
  prefix: string,
  names: Iterable<string>,
  skip: ReadonlySet<string> = new Set()
): Record<string, 'error'> =>
  Object.fromEntries(
    [...names]
      .map((name) => (name.startsWith(prefix) ? name : `${prefix}${name}`))
      .filter((rule) => !skip.has(rule))
      .map((rule) => [rule, 'error'] as const)
  )
