import { defineRule } from '@oxlint/plugins'
import type { ESTree } from '@oxlint/plugins'

import { getName } from '../../ast.ts'

/** Calls that load a document; a clock installed afterwards misses its scripts. */
const NAVIGATION_METHODS = new Set([
  'goBack',
  'goForward',
  'goto',
  'reload',
  'setContent',
])

type Fn = Extract<
  ESTree.Node,
  {
    type:
      | 'ArrowFunctionExpression'
      | 'FunctionDeclaration'
      | 'FunctionExpression'
  }
>

type Hook = 'beforeAll' | 'beforeEach'

interface HookCall {
  call: ESTree.CallExpression
  fn: Fn
  kind: Hook
}

interface Navigation {
  method: string
  node: ESTree.CallExpression
}

const isFunction = (node: ESTree.Node): node is Fn =>
  node.type === 'ArrowFunctionExpression' ||
  node.type === 'FunctionDeclaration' ||
  node.type === 'FunctionExpression'

/** Callee names, innermost first: `test.describe.serial(…)` → serial, describe, test. */
const getCalleeNames = (call: ESTree.CallExpression) => {
  const names: string[] = []
  let callee: ESTree.Node = call.callee

  while (callee.type === 'MemberExpression') {
    names.push(getName(callee) ?? '')
    callee = callee.object
  }

  if (callee.type === 'Identifier') {
    names.push(callee.name)
  }

  return names
}

/** The call `fn` is passed to as a callback, if any. */
const getCallbackCall = (fn: Fn) => {
  const { parent } = fn

  return parent.type === 'CallExpression' && parent.arguments.includes(fn)
    ? parent
    : null
}

const isDescribeCallback = (fn: Fn) => {
  const call = getCallbackCall(fn)

  return call !== null && getCalleeNames(call).includes('describe')
}

const getHookKind = (call: ESTree.CallExpression): Hook | null => {
  const [name] = getCalleeNames(call)

  return name === 'beforeAll' || name === 'beforeEach' ? name : null
}

/** `page.clock.install()`, `context.clock.install()`, `this.page.clock.install()`. */
const isClockInstall = ({ callee }: ESTree.CallExpression) =>
  callee.type === 'MemberExpression' &&
  getName(callee) === 'install' &&
  callee.object.type === 'MemberExpression' &&
  getName(callee.object) === 'clock'

const getNavigationMethod = ({ callee }: ESTree.CallExpression) => {
  const method = callee.type === 'MemberExpression' ? getName(callee) : null

  return method !== null && NAVIGATION_METHODS.has(method) ? method : null
}

/** Statements directly in a describe body or the file. */
const getStatements = (block: ESTree.Program | Fn) => {
  if (block.type === 'Program') {
    return block.body
  }

  return block.body.type === 'BlockStatement' ? block.body.body : []
}

/** `beforeAll` / `beforeEach` calls directly in a describe body or the file. */
const getHookCalls = (block: ESTree.Program | Fn) => {
  const hooks: HookCall[] = []

  for (const statement of getStatements(block)) {
    if (
      statement.type === 'ExpressionStatement' &&
      statement.expression.type === 'CallExpression'
    ) {
      const call = statement.expression
      const fn = call.arguments.at(-1)
      const kind = getHookKind(call)

      if (kind !== null && fn !== undefined && isFunction(fn)) {
        hooks.push({ call, fn, kind })
      }
    }
  }

  return hooks
}

/**
 * Whether `hook` runs before `own` (a test or hook callback in `ownKind`'s
 * slot). Playwright runs outer describes' hooks first; within one describe,
 * every `beforeAll` before any `beforeEach`, and one kind in declaration order.
 */
const runsBefore = (
  hook: HookCall,
  own: ESTree.CallExpression,
  ownKind: Hook | null,
  sameBlock: boolean
) => {
  const declaredEarlier = !sameBlock || hook.call.start < own.start

  if (ownKind === null) {
    return true
  }

  if (ownKind === 'beforeAll') {
    return hook.kind === 'beforeAll' && declaredEarlier
  }

  return hook.kind === 'beforeAll' || declaredEarlier
}

/** Ancestors, innermost first. */
const getAncestors = (node: ESTree.Node) => {
  const ancestors: ESTree.Node[] = []

  for (
    let current: ESTree.Node | null = node.parent;
    current !== null;
    current = current.parent
  ) {
    ancestors.push(current)
  }

  return ancestors
}

/**
 * Whether `navigation` runs inline in `scope`: every function between
 * them is passed straight to a call (`test.step`, `Promise.all`), not
 * stored to run later.
 */
const runsInline = (navigation: Navigation, scope: Fn) => {
  for (const ancestor of getAncestors(navigation.node)) {
    if (ancestor === scope) {
      return true
    }

    if (isFunction(ancestor) && getCallbackCall(ancestor) === null) {
      return false
    }
  }

  return false
}

/** Outermost function below any describe: the test, hook or helper. */
const getScope = (node: ESTree.Node) => {
  let scope: Fn | null = null

  for (const ancestor of getAncestors(node)) {
    if (isFunction(ancestor)) {
      if (isDescribeCallback(ancestor)) {
        break
      }

      scope = ancestor
    }
  }

  return scope
}

const getPrecedingHooks = (scope: Fn, own: ESTree.CallExpression) => {
  const ownKind = getHookKind(own)
  const hooks: HookCall[] = []
  let sameBlock = true

  for (const ancestor of getAncestors(scope)) {
    if (
      ancestor.type === 'Program' ||
      (isFunction(ancestor) && isDescribeCallback(ancestor))
    ) {
      for (const hook of getHookCalls(ancestor)) {
        if (hook.fn !== scope && runsBefore(hook, own, ownKind, sameBlock)) {
          hooks.push(hook)
        }
      }

      sameBlock = false
    }
  }

  return hooks
}

/**
 * Require `clock.install()` before the first navigation. Installing later
 * leaves the loaded page on the real clock, so timers and `Date` are not
 * faked. Checks the enclosing test, hook, page-object method or helper, plus
 * the `beforeAll`/`beforeEach` hooks that run before it.
 *
 * ponytail: matches navigation by method name on any receiver; misses page
 * objects that navigate under another name (`open()`) and fixtures that
 * navigate, and can flag a `goto` on a different page.
 *
 * @see apps/web/tests/e2e/README.md
 */
export const noE2eLateClockInstallRule = defineRule({
  createOnce(context) {
    // Per file, in source order (CallExpression is visited on entry).
    let navigations: Navigation[] = []
    let installs: ESTree.CallExpression[] = []

    const findNavigation = (scope: Fn, before = Number.POSITIVE_INFINITY) =>
      navigations.find(
        (navigation) =>
          navigation.node.start < before && runsInline(navigation, scope)
      )

    const check = (install: ESTree.CallExpression) => {
      const scope = getScope(install)

      if (scope === null) {
        return
      }

      const navigation = findNavigation(scope, install.start)

      if (navigation !== undefined) {
        context.report({
          data: { method: navigation.method },
          messageId: 'afterNavigation',
          node: install,
        })

        return
      }

      const own = getCallbackCall(scope)

      if (own === null) {
        return
      }

      for (const hook of getPrecedingHooks(scope, own)) {
        const hookNavigation = findNavigation(hook.fn)

        if (hookNavigation !== undefined) {
          context.report({
            data: { hook: hook.kind, method: hookNavigation.method },
            messageId: 'afterHookNavigation',
            node: install,
          })

          return
        }
      }
    }

    return {
      CallExpression(node) {
        const method = getNavigationMethod(node)

        if (method !== null) {
          navigations.push({ method, node })
        } else if (isClockInstall(node)) {
          installs.push(node)
        }
      },
      'Program:exit'() {
        for (const install of installs) {
          check(install)
        }
      },
      before() {
        navigations = []
        installs = []
      },
    }
  },
  meta: {
    docs: {
      description:
        'Require `clock.install()` before the first navigation in e2e tests.',
    },
    messages: {
      afterHookNavigation:
        'A `{{hook}}` hook already navigates with `{{method}}()`, so this `clock.install()` is too late. Install the clock in that hook, before the navigation.',
      afterNavigation:
        '`clock.install()` runs after `{{method}}()`, so the loaded page keeps the real clock. Install the clock before the first navigation.',
    },
    type: 'problem',
  },
})
