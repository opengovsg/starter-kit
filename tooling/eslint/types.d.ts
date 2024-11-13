/**
 * Since the ecosystem hasn't fully migrated to ESLint's new FlatConfig system yet,
 * we "need" to type some of the plugins manually :(
 */

declare module 'eslint-plugin-import' {
  type RuleDefinition = import('eslint').Rule.RuleModule
  type RulesRecord = import('eslint').Linter.RulesRecord

  export const configs: {
    recommended: { rules: RulesRecord }
  }
  export const rules: Record<string, RuleDefinition>
}

// Current types from plugin has error type in that flat is optional when it is not.
declare module 'eslint-plugin-react' {
  export const configs: {
    flat: {
      recommended: {
        plugins: { react: PluginDefinition }
        rules: Record<string, import('eslint').Linter.RuleEntry>
        languageOptions: import('eslint').Linter.LanguageOptions
      }
    }
  }
}

declare module 'eslint-plugin-react-hooks' {
  type RuleDefinition = import('eslint').Rule.RuleModule
  type RuleEntry = import('eslint').Linter.RuleEntry

  export const configs: {
    recommended: {
      plugins: ['react-hooks']
      rules: {
        'react-hooks/rules-of-hooks': RuleEntry
        'react-hooks/exhaustive-deps': RuleEntry
      }
    }
  }
  export const rules: {
    'rule-of-hooks': RuleDefinition
    'exhaustive-deps': RuleDefinition
  }
}

declare module '@next/eslint-plugin-next' {
  type RuleDefinition = import('eslint').Rule.RuleModule
  type RulesRecord = import('eslint').Linter.RulesRecord
  export const configs: {
    recommended: { rules: RulesRecord }
    'core-web-vitals': { rules: RulesRecord }
  }
  export const rules: Record<string, RuleDefinition>
}
