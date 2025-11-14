'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@opengovsg/oui/button'
import { useMutation } from '@tanstack/react-query'

import { useTRPC } from '~/trpc/react'

export const LogoutButton = () => {
  const router = useRouter()
  const trpc = useTRPC()
  const logoutMutation = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        router.refresh()
      },
      trpc: {
        context: {
          // Disable streaming for this request so cookies can be set.
          skipStreaming: true,
        },
      },
    }),
  )

  return (
    <Button
      isPending={logoutMutation.isPending}
      onPress={() => logoutMutation.mutate()}
    >
      Logout
    </Button>
  )
}
