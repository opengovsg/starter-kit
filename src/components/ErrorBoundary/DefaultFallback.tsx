import { type ComponentType } from 'react'
import { type FallbackProps } from 'react-error-boundary'
import { TRPCWithErrorCodeSchema } from '~/utils/error'
import { UnexpectedErrorCard } from './UnexpectedErrorCard'
import { DefaultTrpcError } from './DefaultTrpcError'

export const DefaultFallback: ComponentType<FallbackProps> = ({
  error,
  // resetErrorBoundary,
}) => {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  const res = TRPCWithErrorCodeSchema.safeParse(error)

  if (!res.success) return <UnexpectedErrorCard />

  return <DefaultTrpcError code={res.data} />
}
