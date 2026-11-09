import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@opengovsg/oui'
import { Button } from '@opengovsg/oui/button'
import { useMutation } from '@tanstack/react-query'
import { useQueryState } from 'nuqs'
import { Controller, useForm } from 'react-hook-form'

import type { VfnStepData } from './email-wizard.machine'

import { TextField } from '@acme/ui/text-field'
import {
  browserCreatePkceChallenge,
  browserCreatePkceVerifier,
} from '~/lib/pkce/browser-pkce'
import { useTRPC } from '~/trpc/react'
import { emailSignInSchema } from '~/validators/auth'

interface EmailStepProps {
  onNext: (data: VfnStepData) => void
}

export const EmailStep = ({ onNext }: EmailStepProps) => {
  const [newChallengePending, setNewChallengePending] = useState(false)

  const { handleSubmit, setError, control } = useForm({
    defaultValues: {
      email: '',
    },
    resolver: zodResolver(emailSignInSchema.omit({ codeChallenge: true })),
  })

  const [queryError, setQueryError] = useQueryState('error', {
    defaultValue: '',
  })

  const trpc = useTRPC()

  const loginMutation = useMutation(
    trpc.auth.email.login.mutationOptions({
      onError: (error) => {
        setError('email', { message: error.message })
      },
      onMutate: async () => {
        await setQueryError('')
      },
    })
  )

  const isPending = loginMutation.isPending || newChallengePending

  const handleFormSubmit = async ({ email }: { email: string }) => {
    if (isPending) {
      return
    }

    setNewChallengePending(true)
    const codeVerifier = browserCreatePkceVerifier()
    let codeChallenge: string | undefined

    try {
      codeChallenge = await browserCreatePkceChallenge(codeVerifier)
    } catch (error) {
      console.error(error)
    }

    setNewChallengePending(false)

    if (codeChallenge === undefined) {
      toast.error(
        'Something went wrong generating a sign-in challenge. Please try again.'
      )

      return
    }

    loginMutation.mutate(
      { codeChallenge, email },
      {
        onSuccess: (res) => {
          onNext({ codeVerifier, email: res.email, otpPrefix: res.otpPrefix })
        },
      }
    )
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit(handleFormSubmit)(event)
      }}
      className="flex flex-1 flex-col gap-4"
    >
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState: { error } }) => (
          <TextField
            size="xs"
            inputProps={{
              placeholder: 'e.g. jane@data.gov.sg',
            }}
            errorMessage={error?.message ?? queryError}
            isRequired
            isInvalid={error !== undefined || queryError !== ''}
            {...field}
            label="Log in with a .gov.sg or whitelisted email address"
          />
        )}
      />
      <Button size="sm" isPending={isPending} type="submit">
        Get OTP
      </Button>
    </form>
  )
}
