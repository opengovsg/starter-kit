import { type UseTRPCMutationResult } from '@trpc/react-query/shared'

export type InferMutationInput<
  T extends UseTRPCMutationResult<any, any, any, any>
> = NonNullable<T['variables']>
