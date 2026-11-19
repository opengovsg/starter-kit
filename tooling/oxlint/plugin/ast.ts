import type { ESTree } from '@oxlint/plugins'

type Named =
  | ESTree.MemberExpression
  | Extract<ESTree.Node, { type: 'Property' }>

/** `a.b`, `a['b']`, `` a[`b`] `` and `{ b }`, `{ 'b' }`, `{ ['b'] }`. */
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
