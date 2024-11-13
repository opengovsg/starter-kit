/**
 * Since the ecosystem hasn't fully migrated to ESLint's new FlatConfig system yet,
 * we "need" to type some of the plugins manually :(
 */

declare module "@eslint/js" {
  // Why the hell doesn't eslint themselves export their types?
  type RulesRecord = import("eslint").Linter.RulesRecord

  export const configs: {
    readonly recommended: { readonly rules: Readonly<RulesRecord> }
    readonly all: { readonly rules: Readonly<RulesRecord> }
  }
}

declare module "eslint-plugin-import" {
  type RuleDefinition = import("eslint").Rule.RuleModule
  type RulesRecord = import("eslint").Linter.RulesRecord

  export const configs: {
    recommended: { rules: RulesRecord }
  }
  export const rules: Record<string, RuleDefinition>
}

declare module "eslint-plugin-react" {
  type RuleDefinition = import("eslint").Rule.RuleModule
  type RulesRecord = import("eslint").Linter.RulesRecord

  export const configs: {
    recommended: { rules: RulesRecord }
    all: { rules: RulesRecord }
    "jsx-runtime": { rules: RulesRecord }
  }
  export const rules: Record<string, RuleDefinition>
}

declare module "eslint-plugin-react-hooks" {
  type RuleDefinition = import("eslint").Rule.RuleModule
  type RuleEntry = import("eslint").Linter.RuleEntry

  export const configs: {
    recommended: {
      rules: {
        "rules-of-hooks": RuleEntry
        "exhaustive-deps": RuleEntry
      }
    }
  }
  export const rules: Record<string, RuleDefinition>
}

declare module "@next/eslint-plugin-next" {
  type RuleDefinition = import("eslint").Rule.RuleModule
  type RulesRecord = import("eslint").Linter.RulesRecord
  export const configs: {
    recommended: { rules: RulesRecord }
    "core-web-vitals": { rules: RulesRecord }
  }
  export const rules: Record<string, RuleDefinition>
}
