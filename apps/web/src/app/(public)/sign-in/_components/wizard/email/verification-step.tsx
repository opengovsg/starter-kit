import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@opengovsg/oui/button'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useInterval } from 'usehooks-ts'

import { useSignInWizard } from '../context'
import { OtpTokenField } from './otp-token-field'
import { ResendOtpButton } from './resend-otp-button'

import { Infobox } from '@acme/ui/infobox'
import { useTRPC } from '~/trpc/react'
import { emailVerifyOtpSchema } from '~/validators/auth'

export const VerificationStep = () => {
  const router = useRouter()
  const [showOtpDelayMessage, setShowOtpDelayMessage] = useState(false)
  const trpc = useTRPC()

  const { vfnStepData, getVerifier, clearVerifierMap } = useSignInWizard()
  const codeVerifier = getVerifier(vfnStepData?.codeChallenge ?? '') ?? ''

  useInterval(
    () => {
      setShowOtpDelayMessage(true)
    },
    // Show otp delay info message after 15 seconds.
    showOtpDelayMessage ? null : 15_000
  )

  const { control, handleSubmit, resetField, setFocus, setError } = useForm({
    defaultValues: {
      email: vfnStepData?.email ?? '',
      token: '',
    },
    resolver: zodResolver(emailVerifyOtpSchema.omit({ codeVerifier: true })),
  })

  const verifyOtpMutation = useMutation(
    trpc.auth.email.verifyOtp.mutationOptions({
      onError: (error) => {
        setError('token', { message: error.message })
      },
      onSuccess: () => {
        clearVerifierMap()
        router.refresh()
      },
    })
  )

  if (vfnStepData === undefined) {
    return null
  }

  const handleFormSubmit = ({
    email,
    token,
  }: {
    email: string
    token: string
  }) => {
    verifyOtpMutation.mutate({ codeVerifier, email, token })
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        void handleSubmit(handleFormSubmit)(event)
      }}
      className="flex flex-1 flex-col gap-4"
    >
      <OtpTokenField
        control={control}
        email={vfnStepData.email}
        otpPrefix={vfnStepData.otpPrefix}
      />
      <div className="flex flex-col gap-3">
        <Button size="sm" isPending={verifyOtpMutation.isPending} type="submit">
          Log in
        </Button>
        {showOtpDelayMessage && (
          <Infobox size="sm">
            OTP might be delayed due to government email traffic. Try again
            later.
          </Infobox>
        )}
        <ResendOtpButton
          resetField={resetField}
          setError={setError}
          setFocus={setFocus}
        />
      </div>
    </form>
  )
}
