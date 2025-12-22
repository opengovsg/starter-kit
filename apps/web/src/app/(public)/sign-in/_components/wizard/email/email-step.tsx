import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@opengovsg/oui'
import { Button } from '@opengovsg/oui/button'
import { useMutation } from '@tanstack/react-query'
import { useQueryState } from 'nuqs'
import { Controller, useForm } from 'react-hook-form'

import { TextField } from '@acme/ui/text-field'

import type { VfnStepData } from '../context'
import { useTRPC } from '~/trpc/react'
import { emailSignInSchema } from '~/validators/auth'
import { useSignInWizard } from '../context'

interface EmailStepProps {
  onNext: ({ email, otpPrefix, codeChallenge }: VfnStepData) => void
}

export const EmailStep = ({ onNext }: EmailStepProps) => {
  const { newChallenge } = useSignInWizard()
  const [newChallengePending, setNewChallengePending] = useState(false)

  const { handleSubmit, setError, control } = useForm({
    resolver: zodResolver(emailSignInSchema.omit({ codeChallenge: true })),
    defaultValues: {
      email: '',
    },
  })

  const [queryError] = useQueryState('error', { defaultValue: '' })

  useEffect(() => {
    if (queryError) {
      setError('email', { message: String(queryError) })
    }
  }, [queryError, setError])

  const trpc = useTRPC()

  const loginMutation = useMutation(
    trpc.auth.email.login.mutationOptions({
      onSuccess: (res, req) => {
        return onNext({
          email: res.email,
          otpPrefix: res.otpPrefix,
          codeChallenge: req.codeChallenge,
        })
      },
      onError: (error) => setError('email', { message: error.message }),
    }),
  )

  const isPending = loginMutation.isPending || newChallengePending

  return (
    <form
      noValidate
      onSubmit={handleSubmit(({ email }) => {
        if (isPending) return
        setNewChallengePending(true)
        newChallenge()
          .then((codeChallenge) => {
            if (!codeChallenge) {
              toast.error(
                'Something went wrong generating a sign-in challenge. Please try again.',
              )
              return
            }
            loginMutation.mutate({ email, codeChallenge })
          })
          .catch(console.error)
          .finally(() => {
            setNewChallengePending(false)
          })
      })}
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
            errorMessage={error?.message}
            isRequired
            isInvalid={!!error}
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
