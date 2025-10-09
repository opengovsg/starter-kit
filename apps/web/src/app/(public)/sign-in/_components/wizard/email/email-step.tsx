import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@opengovsg/oui/button'
import { useMutation } from '@tanstack/react-query'
import { useQueryState } from 'nuqs'
import { Controller, useForm } from 'react-hook-form'

import { TextField } from '@acme/ui/text-field'

import type { VfnStepData } from '../context'
import { useTRPC } from '~/trpc/react'
import { emailSignInSchema } from '~/validators/auth'

interface EmailStepProps {
  onNext: ({ email, otpPrefix }: VfnStepData) => void
}
export const EmailStep = ({ onNext }: EmailStepProps) => {
  const { handleSubmit, setError, control } = useForm({
    resolver: zodResolver(emailSignInSchema),
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
      onSuccess: onNext,
      onError: (error) => setError('email', { message: error.message }),
    }),
  )

  return (
    <form
      noValidate
      onSubmit={handleSubmit(({ email }) => loginMutation.mutate({ email }))}
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
      <Button size="sm" isPending={loginMutation.isPending} type="submit">
        Get OTP
      </Button>
    </form>
  )
}
