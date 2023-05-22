import { FormControl, FormLabel, Stack } from '@chakra-ui/react'
import { Button, FormErrorMessage, Input } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { useIntervalWhen } from 'rooks'
import { z } from 'zod'
import { CALLBACK_URL_KEY } from '~/constants/params'
import { useZodForm } from '~/lib/form'
import { trpc } from '~/utils/trpc'
import { useSignInContext } from './SignInContext'
import { emailSignInSchema } from './Emailnput'
import { ResendOtpButton } from './ResendOtpButton'

const emailVerificationSchema = emailSignInSchema.extend({
  token: z
    .string()
    .trim()
    .min(1, 'OTP is required.')
    .length(6, 'Please enter a 6 character OTP.'),
})

export const VerificationInput = (): JSX.Element => {
  const router = useRouter()

  const { email, timer, setTimer } = useSignInContext()

  useIntervalWhen(
    () => setTimer(timer - 1),
    /* intervalDurationMs= */ 1000,
    // Stop interval if timer hits 0.
    /* when= */ timer > 0
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useZodForm({
    schema: emailVerificationSchema,
    defaultValues: {
      email,
    },
  })

  const verifyOtpMutation = trpc.auth.email.verifyOtp.useMutation({
    onError: (error) => {
      setError('token', { message: error.message })
    },
  })

  const resendOtpMutation = trpc.auth.email.login.useMutation({
    onError: (error) => setError('token', { message: error.message }),
  })

  const handleVerifyOtp = handleSubmit(({ email, token }) => {
    return verifyOtpMutation.mutate(
      {
        email,
        otp: token,
      },
      {
        onSuccess: () => {
          router.push(String(router.query[CALLBACK_URL_KEY] ?? '/dashboard'))
        },
      }
    )
  })

  const handleResendOtp = () => {
    if (timer > 0) return
    return resendOtpMutation.mutate({ email })
  }

  return (
    <form onSubmit={handleVerifyOtp}>
      <FormControl
        id="email"
        isInvalid={!!errors.token}
        isReadOnly={verifyOtpMutation.isLoading}
      >
        <FormLabel htmlFor="email">Enter OTP sent to {email}</FormLabel>
        <Input autoFocus maxLength={6} {...register('token')} />
        <FormErrorMessage>{errors.token?.message}</FormErrorMessage>
      </FormControl>
      <Stack direction="row" mt={4}>
        <Button
          type="submit"
          // Want to keep loading state until redirection is complete.
          isLoading={verifyOtpMutation.isLoading || verifyOtpMutation.isSuccess}
        >
          Sign in
        </Button>
        <ResendOtpButton
          timer={timer}
          onClick={handleResendOtp}
          isDisabled={timer > 0 || verifyOtpMutation.isLoading}
          isLoading={resendOtpMutation.isLoading}
        />
      </Stack>
    </form>
  )
}
