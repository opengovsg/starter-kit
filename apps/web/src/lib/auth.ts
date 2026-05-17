'use client'

import { toast } from '@opengovsg/oui'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { LOGIN_ROUTE } from '~/constants'
import { useTRPC } from '~/trpc/react'

export const useAuth = () => {
  const navigate = useNavigate()
  const trpc = useTRPC()

  const { data: user } = useQuery(trpc.me.get.queryOptions())

  const logoutMutation = useMutation(
    trpc.auth.logout.mutationOptions({
      onSuccess: () => {
        toast.success('Successfully logged out.')
        void navigate({ to: LOGIN_ROUTE })
      },
    })
  )

  return { user, logout: logoutMutation.mutate }
}
