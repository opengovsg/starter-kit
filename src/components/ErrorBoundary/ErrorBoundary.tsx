import { Box } from '@chakra-ui/react'
import { TRPCClientError } from '@trpc/client'
import { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import { Component, ReactNode } from 'react'
import { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.types'
import { TRPCWithErrorCodeSchema } from './ErrorBoundary.utils'
import { UnexpectedErrorCard } from './UnexpectedErrorCard'

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
    console.log({ error })
  }

  render() {
    const { children, fallback } = this.props
    const error = this.state.error

    // Check if the error is thrown
    if (!this.state.hasError) {
      return children
    }

    if (fallback !== undefined) {
      return fallback
    }

    if (error instanceof TRPCClientError) {
      const isTRPCErrorShape = TRPCWithErrorCodeSchema.safeParse(error)

      if (!isTRPCErrorShape.success) return <UnexpectedErrorCard />

      return getErrorComponent(isTRPCErrorShape.data.data.code)
    }
  }
}

// TODO: Make custom components for these
function getErrorComponent(code: TRPC_ERROR_CODE_KEY): ReactNode {
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
