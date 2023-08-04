import { FormControl, FormLabel, Input, Wrap } from '@chakra-ui/react'
import { Button, FormErrorMessage } from '@opengovsg/design-system-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { z } from 'zod'
import { useZodForm } from '~/lib/form'
import { trpc } from '~/utils/trpc'
import { SgidLoginButton } from './SgidLoginButton'

interface EmailInputProps {
  onSuccess: (email: string) => void
}

export const emailSignInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Please enter an email address.')
    .email({ message: 'Please enter a valid email address.' }),
})

export const EmailInput: React.FC<EmailInputProps> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useZodForm({
    schema: emailSignInSchema,
    mode: 'onTouched',
  })

  const router = useRouter()

  const loginMutation = trpc.auth.email.login.useMutation({
    onSuccess,
    onError: (error) => setError('email', { message: error.message }),
  })

  useEffect(() => {
    if (router.query.error) {
      setError('email', { message: String(router.query.error) })
    }
  }, [router.query.error, setError])

  const handleSignIn = handleSubmit(({ email }) => {
    return loginMutation.mutate({ email })
  })

  return (
    <form onSubmit={handleSignIn} noValidate>
      <FormControl
        id="email"
        isRequired
        isInvalid={!!errors.email}
        isReadOnly={loginMutation.isLoading}
      >
        <FormLabel requiredIndicator={<></>}>Log in with your email</FormLabel>
        <Input placeholder="e.g. jane.doe@open.gov.sg" {...register('email')} />
        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
      </FormControl>
      <Wrap shouldWrapChildren direction="row" align="center" mt="1rem">
        <Button type="submit" isLoading={loginMutation.isLoading}>
          Get OTP
        </Button>
        <SgidLoginButton />
      </Wrap>
    </form>
  )
}
