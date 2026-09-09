import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@opengovsg/oui'
import { cn } from '@opengovsg/oui-theme'
import { Button } from '@opengovsg/oui/button'
import { Spinner } from '@opengovsg/oui/spinner'
import { useMutation } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { useInterval } from 'usehooks-ts'

import { useSignInWizard } from '../context'

import { Infobox } from '@acme/ui/infobox'
import { TextField } from '@acme/ui/text-field'
import { useTRPC } from '~/trpc/react'
import { emailVerifyOtpSchema } from '~/validators/auth'

export const VerificationStep = () => {
  const router = useRouter()
  const [showOtpDelayMessage, setShowOtpDelayMessage] = useState(false)
  const trpc = useTRPC()

  const {
    vfnStepData,
    timer,
    setVfnStepData,
    resetTimer,
    newChallenge,
    getVerifier,
    clearVerifierMap,
  } = useSignInWizard()
  const [newChallengePending, setNewChallengePending] = useState(false)
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

  const resendOtpMutation = useMutation(
    trpc.auth.email.login.mutationOptions({
      onError: (error) => {
        setError('token', { message: error.message })
      },
      onSuccess: (res, req) => {
        setVfnStepData({
          codeChallenge: req.codeChallenge,
          email: res.email,
          otpPrefix: res.otpPrefix,
        })
        resetField('token')
        setFocus('token')
        // On success, restart the timer before this can be called again.
        resetTimer()
      },
    })
  )

  const isResendPending = resendOtpMutation.isPending || newChallengePending
  const handleResendOtp = async () => {
    if (
      timer > 0 ||
      vfnStepData?.email === undefined ||
      vfnStepData.email === ''
    ) {
      return
    }
    if (isResendPending) {
      return
    }
    setNewChallengePending(true)
    let codeChallenge: string | undefined
    try {
      codeChallenge = await newChallenge()
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
    resendOtpMutation.mutate({ codeChallenge, email: vfnStepData.email })
  }

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
      <Controller
        control={control}
        name="token"
        render={({ field, fieldState: { error } }) => (
          <TextField
            size="xs"
            classNames={{
              input: 'rounded-l-none',
              inputGroup: 'inline-flex',
            }}
            inputProps={{
              placeholder: 'Enter your OTP here',
            }}
            startContent={
              <div
                aria-label={`OTP prefix is ${vfnStepData.otpPrefix}`}
                className="border-base-divider-strong bg-interaction-support-disabled text-base-content-default prose-body-2 -mr-px inline-flex items-center rounded-l-sm border px-3"
              >
                {vfnStepData.otpPrefix} -
              </div>
            }
            errorMessage={error?.message}
            isRequired
            isInvalid={error !== undefined}
            {...field}
            label={`Enter the OTP sent to ${vfnStepData.email}`}
          />
        )}
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
        <Button
          type="button"
          variant="unstyled"
          disableRipple
          className={cn(
            'prose-caption-2 disabled:text-interaction-support-disabled-content h-auto w-fit min-w-auto gap-0 self-end rounded-none p-0 whitespace-pre enabled:underline'
          )}
          size="xs"
          onPress={() => {
            void handleResendOtp()
          }}
          isPending={isResendPending}
          isDisabled={timer > 0}
          spinner={
            <Spinner
              size="sm"
              classNames={{
                base: 'size-4 min-h-[21px]',
                circle1: 'border-2',
                circle2: 'border-2',
                wrapper: 'h-4 w-4',
              }}
            />
          }
        >
          Resend OTP
          <span data-chromatic="ignore">{timer > 0 && ` in ${timer}s`}</span>
        </Button>
      </div>
    </form>
  )
}
