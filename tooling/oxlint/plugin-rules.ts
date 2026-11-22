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
