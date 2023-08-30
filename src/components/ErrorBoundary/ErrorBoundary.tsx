import { Box } from '@chakra-ui/react'
import { type TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import { Component, useEffect } from 'react'
import {
  type ErrorBoundaryProps,
  type ErrorBoundaryState,
} from './ErrorBoundary.types'
import { TRPCWithErrorCodeSchema } from '../../utils/error'
import { UnexpectedErrorCard } from './UnexpectedErrorCard'
import { trpc } from '~/utils/trpc'
import { FullscreenSpinner } from '../FullscreenSpinner'

/**
 * Does the following:
 * 1. Checks if this is a recognizable TRPCClientError
 * 1a. Not a TRPCClientError
 *     - Render fallback component or UnexpectedErrorCard
 * 1b. Is a TPRCClientError
 *     - Checks if its an UNAUTHORIZED error
 * 2a. Is an UNAUTHORIZED error, redirect to `/sign-in` page
 * 2b. Not a UNAUTHORIZED error, render fallback component or <ErrorComponent /> according to switch case error code
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)

    // Define a state variable to track whether is an error or not
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: unknown) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }
  componentDidCatch(error: Error) {
    // You can use your own error logging service here
    console.error(error)
  }

  render() {
    const { children, fallback } = this.props
    const error = this.state.error

    // Check if the error is thrown
    if (!this.state.hasError) return children

    const res = TRPCWithErrorCodeSchema.safeParse(error)

    if (!res.success) return fallback ?? <UnexpectedErrorCard />

    return fallback ?? <ErrorComponent code={res.data} />
  }
}

const UnauthorizedErrorComponent = () => {
  const utils = trpc.useContext()
  useEffect(() => {
    void utils.invalidate()
  }, [utils])

  return <FullscreenSpinner />
}

// TODO: Make custom components for these
function ErrorComponent({ code }: { code: TRPC_ERROR_CODE_KEY }) {
  switch (code) {
    case 'NOT_FOUND':
      return (
        <Box bgColor="red" width="100px" height="100px">
          Not found!
        </Box>
      )

    case 'UNAUTHORIZED':
      return <UnauthorizedErrorComponent />

    default:
      return <UnexpectedErrorCard />
  }
}

export default ErrorBoundary
