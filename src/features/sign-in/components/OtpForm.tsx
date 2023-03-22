import { useForm } from 'react-hook-form'
import { FormControl, Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  FormErrorMessage,
  FormLabel,
  Input,
} from '@opengovsg/design-system-react'
import { z } from 'zod'

import { useIsDesktop } from '~hooks/useIsDesktop'

import { ResendOtpButton } from './ResendOtpButton'

const schema = z.object({
  token: z
    .string()
    .trim()
    .min(1, 'OTP is required.')
    .regex(/^[0-9\b]+$/, { message: 'Only numbers are allowed.' })
    .length(6, 'Please enter a 6 digit OTP.'),
})

export type OtpFormInputs = {
  token: string
}

interface OtpFormProps {
  email: string
  onSubmit: (inputs: OtpFormInputs) => Promise<void>
  onResendOtp: () => Promise<void>
}

export const OtpForm = ({
  email,
  onSubmit,
  onResendOtp,
}: OtpFormProps): JSX.Element => {
  const { handleSubmit, register, formState, setError } =
    useForm<OtpFormInputs>({
      resolver: zodResolver(schema),
    })

  const isDesktop = useIsDesktop()

  const onSubmitForm = async (inputs: OtpFormInputs) => {
    return onSubmit(inputs).catch((e) => {
      setError('token', { type: 'server', message: e.json.message })
    })
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmitForm)}>
      <FormControl isRequired isInvalid={!!formState.errors.token} mb="2.5rem">
        <FormLabel htmlFor="token">
          {`Enter OTP sent to ${email.toLowerCase()}`}
        </FormLabel>
        <Input
          type="text"
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          {...register('token')}
        />
        <FormErrorMessage>{formState.errors.token?.message}</FormErrorMessage>
      </FormControl>
      <Stack
        direction={{ base: 'column', lg: 'row' }}
        spacing={{ base: '1.5rem', lg: '2.5rem' }}
        align="center"
      >
        <Button
          isFullWidth={!isDesktop}
          isLoading={formState.isSubmitting}
          type="submit"
        >
          Sign in
        </Button>
        <ResendOtpButton onResendOtp={onResendOtp} />
      </Stack>
    </form>
  )
}
