import type { ESTree } from '@oxlint/plugins'

// `ESTree.Function` covers declarations and expressions (and body-less TS
// declarations), so `Extract` on `type` would silently drop it.
export type Fn = ESTree.ArrowFunctionExpression | ESTree.Function

export const isFunction = (node: ESTree.Node): node is Fn =>
  node.type === 'ArrowFunctionExpression' ||
  node.type === 'FunctionDeclaration' ||
  node.type === 'FunctionExpression' ||
  node.type === 'TSDeclareFunction' ||
  node.type === 'TSEmptyBodyFunctionExpression'

type Named =
  | ESTree.MemberExpression
  | Extract<ESTree.Node, { type: 'Property' }>

export const getName = (node: Named) => {
  const key = node.type === 'Property' ? node.key : node.property

  if (!node.computed && key.type === 'Identifier') {
    return key.name
  }

  if (key.type === 'Literal') {
    return String(key.value)
  }

  if (key.type === 'TemplateLiteral' && key.expressions.length === 0) {
    return key.quasis.map((quasi) => quasi.value.cooked).join('')
  }

  return null
}
