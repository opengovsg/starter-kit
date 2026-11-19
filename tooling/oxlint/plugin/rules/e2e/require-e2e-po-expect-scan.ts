import { defineRule } from '@oxlint/plugins'
import type { ESTree } from '@oxlint/plugins'

import { getName } from '../../ast.ts'

const SCAN_MODULE = '~tests/e2e/helpers/a11y.expect'
const SCAN_EXPORT = 'expectNoA11yViolations'

const EXPECT_NAME = /^expect(?:[A-Z]|$)/u

// `ESTree.Function` covers declarations and expressions (and body-less TS
// declarations), so `Extract` on `type` would silently drop it.
type Fn = ESTree.ArrowFunctionExpression | ESTree.Function

const isFunction = (node: ESTree.Node): node is Fn =>
  node.type === 'ArrowFunctionExpression' ||
  node.type === 'FunctionDeclaration' ||
  node.type === 'FunctionExpression' ||
  node.type === 'TSDeclareFunction' ||
  node.type === 'TSEmptyBodyFunctionExpression'

const getKeyName = (key: ESTree.Node, computed: boolean) => {
  if (key.type === 'Literal') {
    return String(key.value)
  }

  if (computed) {
    return null
  }

  return key.type === 'Identifier' || key.type === 'PrivateIdentifier'
    ? key.name
    : null
}

const getFunctionName = (fn: Fn) => {
  const { parent } = fn

  if (
    (parent.type === 'MethodDefinition' ||
      parent.type === 'PropertyDefinition' ||
      parent.type === 'Property') &&
    parent.value === fn
  ) {
    return getKeyName(parent.key, parent.computed)
  }

  if (
    parent.type === 'VariableDeclarator' &&
    parent.init === fn &&
    parent.id.type === 'Identifier'
  ) {
    return parent.id.name
  }

  if (
    parent.type === 'AssignmentExpression' &&
    parent.right === fn &&
    parent.left.type === 'MemberExpression'
  ) {
    return getName(parent.left)
  }

  return fn.type === 'ArrowFunctionExpression' ? null : (fn.id?.name ?? null)
}

const getEnclosingFunction = (node: ESTree.Node) => {
  for (
    let current: ESTree.Node | null = node.parent;
    current !== null;
    current = current.parent
  ) {
    if (isFunction(current)) {
      return current
    }
  }

  return null
}

const getNearestNamedFunction = (node: ESTree.Node) => {
  for (
    let fn = getEnclosingFunction(node);
    fn !== null;
    fn = getEnclosingFunction(fn)
  ) {
    if (getFunctionName(fn) !== null) {
      return fn
    }
  }

  return null
}

const isPlaywrightExpect = ({ callee }: ESTree.CallExpression) =>
  (callee.type === 'Identifier' && callee.name === 'expect') ||
  (callee.type === 'MemberExpression' &&
    callee.object.type === 'Identifier' &&
    callee.object.name === 'expect')

const getAwaitedCall = (statement: ESTree.Node | undefined) =>
  statement?.type === 'ExpressionStatement' &&
  statement.expression.type === 'AwaitExpression' &&
  statement.expression.argument.type === 'CallExpression'
    ? statement.expression.argument
    : null

const isDelegation = (call: ESTree.CallExpression) =>
  call.callee.type === 'MemberExpression' &&
  call.callee.object.type === 'ThisExpression' &&
  EXPECT_NAME.test(getName(call.callee) ?? '')

/**
 * Every `expect*` function in an e2e page object asserts a screen state, so it
 * must wait for that state, then end with `await expectNoA11yViolations(this.page)`
 * (imported from `~tests/e2e/helpers/a11y.expect`) or delegate by ending with
 * `await this.expectOther()`. It may not return early, and any function that
 * calls Playwright's `expect` must itself be named `expect*`, so an assertion
 * can't dodge the scan by its name. Covers class members (including `#private`
 * and quoted keys), object literals, declarations and assignments.
 *
 * ponytail: `// oxlint-disable` and the `test.use({ a11y: false })` opt-out are
 * still escape hatches; review catches those.
 */
export const requireE2ePoExpectScanRule = defineRule({
  createOnce(context) {
    let scanName: string | null = null
    let awaits = new Map<Fn, number[]>()
    let asserting = new Set<Fn>()

    const isPageScan = (call: ESTree.CallExpression) => {
      const [target] = call.arguments

      return (
        scanName !== null &&
        call.callee.type === 'Identifier' &&
        call.callee.name === scanName &&
        target?.type === 'MemberExpression' &&
        target.object.type === 'ThisExpression' &&
        getName(target) === 'page'
      )
    }

    const check = (fn: Fn) => {
      const name = getFunctionName(fn)

      if (name === null) {
        return
      }

      if (!EXPECT_NAME.test(name)) {
        if (asserting.has(fn)) {
          context.report({ data: { name }, messageId: 'misnamed', node: fn })
        }

        return
      }

      const statements = fn.body?.type === 'BlockStatement' ? fn.body.body : []
      const last = statements.at(-1)
      const call = getAwaitedCall(last)

      if (call !== null && isDelegation(call)) {
        return
      }

      const waited =
        last !== undefined &&
        (awaits.get(fn) ?? []).some((start) => start < last.start)

      if (call === null || !isPageScan(call) || !waited) {
        context.report({ data: { name }, messageId: 'scanLast', node: fn })
      }
    }

    return {
      'ArrowFunctionExpression:exit': check,
      AwaitExpression(node) {
        const fn = getEnclosingFunction(node)

        if (fn !== null) {
          awaits.set(fn, [...(awaits.get(fn) ?? []), node.start])
        }
      },
      CallExpression(node) {
        const owner = isPlaywrightExpect(node)
          ? getNearestNamedFunction(node)
          : null

        if (owner !== null) {
          asserting.add(owner)
        }
      },
      'FunctionDeclaration:exit': check,
      'FunctionExpression:exit': check,
      ImportDeclaration(node) {
        if (node.source.value !== SCAN_MODULE) {
          return
        }

        for (const specifier of node.specifiers) {
          if (
            specifier.type === 'ImportSpecifier' &&
            getKeyName(specifier.imported, false) === SCAN_EXPORT
          ) {
            scanName = specifier.local.name
          }
        }
      },
      ReturnStatement(node) {
        const fn = getEnclosingFunction(node)
        const name = fn === null ? null : getFunctionName(fn)

        if (name !== null && EXPECT_NAME.test(name)) {
          context.report({ data: { name }, messageId: 'return', node })
        }
      },
      before() {
        scanName = null
        awaits = new Map()
        asserting = new Set()
      },
    }
  },
  meta: {
    docs: {
      description:
        'Require every `expect*` function on an e2e page object to wait, then end with an axe scan.',
    },
    messages: {
      misnamed:
        '`{{name}}()` asserts with `expect`, so name it `expect*`; page-object assertions must end with an axe scan.',
      return:
        "Don't return from `{{name}}()`; it must always reach its final axe scan.",
      scanLast:
        "`{{name}}()` must `await` the screen state first and end with `await expectNoA11yViolations(this.page)` (from '~tests/e2e/helpers/a11y.expect') or `await this.expectOther()`.",
    },
    type: 'problem',
  },
})
