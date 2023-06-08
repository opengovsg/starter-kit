import { Box } from '@chakra-ui/react'
import { type TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import { Component } from 'react'
import {
  type ErrorBoundaryProps,
  type ErrorBoundaryState,
} from './ErrorBoundary.types'
import { TRPCWithErrorCodeSchema } from '../../utils/error'
import { UnexpectedErrorCard } from './UnexpectedErrorCard'
import { CALLBACK_URL_KEY } from '~/constants/params'

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

    // The choice to not redirect via next's router was intentional to handle ErrorBoundary for the app root
    // Using next's router.push('/sign-in') will not render the SignIn component as it won't be mounted in the app root as the ErrorBoundary fallback component will be rendered instead
    // Using vanilla location redirecting will prompt a full page reload of /sign-in page, which will never trigger the root ErrorBoundary, thus rendering the full component correctly
    if (res.data === 'UNAUTHORIZED') {
      const params = new URLSearchParams(window.location.search)

      const callbackUrl = params.get('callbackUrl')

      window.location.href = !!callbackUrl
        ? `/sign-in/?${CALLBACK_URL_KEY}=${callbackUrl}`
        : `/sign-in`

      return
    }

    return fallback ?? <ErrorComponent code={res.data} />
  }
}

// TODO: Make custom components for these
function ErrorComponent({
  code,
}: {
  code: Exclude<TRPC_ERROR_CODE_KEY, 'UNAUTHORIZED'>
}) {
  switch (code) {
    case 'NOT_FOUND':
      return (
        <Box bgColor="red" width="100px" height="100px">
          Not found!
        </Box>
      )

    default:
      return <UnexpectedErrorCard />
  }
}

export default ErrorBoundary
