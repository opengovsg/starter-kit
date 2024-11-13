import { useEffect } from 'react'
import { Box } from '@chakra-ui/react'
import { type TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'

import { trpc } from '~/utils/trpc'
import { useLoginState } from '~/features/auth'
import { FullscreenSpinner } from '../FullscreenSpinner'
import { UnexpectedErrorCard } from './UnexpectedErrorCard'

const UnauthorizedError = () => {
  const utils = trpc.useUtils()
  const { removeLoginStateFlag } = useLoginState()
  useEffect(() => {
    void utils.invalidate()
    removeLoginStateFlag()
  }, [removeLoginStateFlag, utils])

  return <FullscreenSpinner />
}

// TODO: Make custom components for these
export const DefaultTrpcError = ({ code }: { code: TRPC_ERROR_CODE_KEY }) => {
  switch (code) {
    case 'NOT_FOUND':
      return (
        <Box bgColor="red" width="100px" height="100px">
          Not found!
        </Box>
      )

    case 'UNAUTHORIZED':
      return <UnauthorizedError />

    default:
      return <UnexpectedErrorCard />
  }
}
