'use client'

import { useRouter } from 'next/navigation'
import { toast } from '@opengovsg/oui'
import { useMutation, useQuery } from '@tanstack/react-query'

import { useTRPC } from '~/trpc/react'

export const useAuth = () => {
  const router = useRouter()
  const trpc = useTRPC()

  const { data: user } = useQuery(trpc.me.get.queryOptions())

  const logoutMutation = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        toast.success('Successfully logged out.')
        router.refresh()
      },
    }),
  )

  return { user, logout: logoutMutation.mutate }
}
