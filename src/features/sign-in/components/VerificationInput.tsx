import {
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftAddon,
  Stack,
} from '@chakra-ui/react'
import { Button, FormErrorMessage, Input } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { useInterval } from 'usehooks-ts'
import { CALLBACK_URL_KEY } from '~/constants/params'
import { useZodForm } from '~/lib/form'
import { HOME } from '~/lib/routes'
import { trpc } from '~/utils/trpc'
import { useSignInContext } from './SignInContext'
import { ResendOtpButton } from './ResendOtpButton'
import { useLoginState } from '~/features/auth'
import { emailVerifyOtpSchema } from '~/schemas/auth/email/sign-in'
import { Controller } from 'react-hook-form'
import { OTP_LENGTH } from '~/lib/auth'

export const VerificationInput = (): JSX.Element | null => {
  const { setHasLoginStateFlag } = useLoginState()
  const router = useRouter()
  const utils = trpc.useContext()

  const {
    vfnStepData,
    timer,
    setTimer,
    setVfnStepData,
    delayForResendSeconds,
  } = useSignInContext()

  useInterval(
    () => setTimer(timer - 1),
    // Stop interval if timer hits 0, else rerun every 1000ms.
    timer > 0 ? 1000 : null
  )

  const {
    control,
    handleSubmit,
    formState: { errors },
    resetField,
    setFocus,
    setError,
  } = useZodForm({
    schema: emailVerifyOtpSchema,
    defaultValues: {
      email: vfnStepData?.email,
      token: '',
    },
  })

  const verifyOtpMutation = trpc.auth.email.verifyOtp.useMutation({
    onSuccess: async () => {
      setHasLoginStateFlag()
      await utils.me.get.invalidate()
      // accessing router.query values returns decoded URI params automatically,
      // so there's no need to call decodeURIComponent manually when accessing the callback url.
      await router.push(String(router.query[CALLBACK_URL_KEY] ?? HOME))
    },
    onError: (error) => {
      setError('token', { message: error.message })
    },
  })

  const resendOtpMutation = trpc.auth.email.login.useMutation({
    onError: (error) => setError('token', { message: error.message }),
  })

  const handleVerifyOtp = handleSubmit(({ email, token }) => {
    return verifyOtpMutation.mutate({ email, token })
  })

  const handleResendOtp = () => {
    if (timer > 0 || !vfnStepData?.email) return
    return resendOtpMutation.mutate(
      { email: vfnStepData.email },
      {
        onSuccess: ({ email, otpPrefix }) => {
          setVfnStepData({ email, otpPrefix })
          resetField('token')
          setFocus('token')
          // On success, restart the timer before this can be called again.
          setTimer(delayForResendSeconds)
        },
      }
    )
  }

  if (!vfnStepData) return null

  return (
    <form onSubmit={handleVerifyOtp}>
      <FormControl
        id="email"
        isInvalid={!!errors.token}
        isReadOnly={verifyOtpMutation.isLoading}
      >
        <FormLabel htmlFor="email">
          Enter OTP sent to {vfnStepData.email}
        </FormLabel>
        <Controller
          control={control}
          name="token"
          render={({ field: { onChange, value, ...field } }) => (
            <InputGroup>
              <InputLeftAddon>{vfnStepData?.otpPrefix}-</InputLeftAddon>
              <Input
                autoFocus
                autoCapitalize="true"
                autoCorrect="false"
                autoComplete="one-time-code"
                placeholder="ABC123"
                maxLength={OTP_LENGTH}
                {...field}
                value={value}
                onChange={(e) => onChange(e.target.value.toUpperCase())}
              />
            </InputGroup>
          )}
        />
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
