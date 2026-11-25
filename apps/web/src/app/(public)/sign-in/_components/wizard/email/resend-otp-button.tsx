import { toast } from '@opengovsg/oui'
import { cn } from '@opengovsg/oui-theme'
import { Button } from '@opengovsg/oui/button'
import { Spinner } from '@opengovsg/oui/spinner'
import { useMutation } from '@tanstack/react-query'
import type {
  UseFormResetField,
  UseFormSetError,
  UseFormSetFocus,
} from 'react-hook-form'

import { useSignInWizard } from '../context'
import { useNewCodeChallenge } from '../use-new-code-challenge'

import { useTRPC } from '~/trpc/react'

interface ResendOtpButtonProps {
  resetField: UseFormResetField<{ email: string; token: string }>
  setError: UseFormSetError<{ email: string; token: string }>
  setFocus: UseFormSetFocus<{ email: string; token: string }>
}

export const ResendOtpButton = ({
  resetField,
  setError,
  setFocus,
}: ResendOtpButtonProps) => {
  const trpc = useTRPC()
  const { vfnStepData, timer, setVfnStepData, resetTimer } = useSignInWizard()
  const { create, pending: newChallengePending } = useNewCodeChallenge()

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

    const codeChallenge = await create()

    if (codeChallenge === undefined) {
      toast.error(
        'Something went wrong generating a sign-in challenge. Please try again.'
      )

      return
    }

    resendOtpMutation.mutate({ codeChallenge, email: vfnStepData.email })
  }

  return (
    <Button
      type="button"
      variant="unstyled"
      disableRipple
      className={cn(
        'h-auto w-fit min-w-auto gap-0 self-end rounded-none p-0 prose-caption-2 whitespace-pre enabled:underline disabled:text-interaction-support-disabled-content'
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
  )
}
