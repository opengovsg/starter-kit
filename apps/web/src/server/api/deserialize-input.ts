import { TRPCError } from '@trpc/server'
import { deserialize } from 'superjson'
import type { SuperJSONResult } from 'superjson'

type UntrustedAnnotation = string | null | UntrustedAnnotation[] | { [key: string]: UntrustedAnnotation }

const isBranch = (
  value: UntrustedAnnotation | undefined
): value is UntrustedAnnotation[] | { [key: string]: UntrustedAnnotation } =>
  typeof value === 'object' && value !== null

// superjson rebuilds a Set or Map one key at a time (getNthKey), so many paths
// into that container are O(N^2). It also copies each annotation key path once
// per child, so one deep path is O(depth * children).
const MAX_ANNOTATION_DEPTH = 20
const MAX_ANNOTATION_NODES = 10_000

const annotationError = (
  values: UntrustedAnnotation | undefined
): string | undefined => {
  let nodes = 0

  const visit = (
    tree: UntrustedAnnotation | undefined,
    depth: number
  ): string | undefined => {
    if (!isBranch(tree)) {
      return undefined
    }

    nodes += 1

    if (nodes > MAX_ANNOTATION_NODES) {
      return 'Input is too complex'
    }

    const children = Array.isArray(tree) ? tree[1] : tree

    if (Array.isArray(tree) && (tree[0] === 'set' || tree[0] === 'map')) {
      return 'Input must not contain a Set or Map'
    }

    if (!isBranch(children)) {
      return undefined
    }

    for (const [key, child] of Object.entries(children)) {
      const childDepth = depth + key.split('.').length

      if (childDepth > MAX_ANNOTATION_DEPTH) {
        return 'Input is too complex'
      }

      const reason = visit(child, childDepth)

      if (reason !== undefined) {
        return reason
      }
    }

    return undefined
  }

  return visit(values, 0)
}

export const deserializeInput = (input: SuperJSONResult) => {
  const reason = annotationError(input.meta?.values)

  if (reason !== undefined) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: reason,
    })
  }

  return deserialize(input)
}
