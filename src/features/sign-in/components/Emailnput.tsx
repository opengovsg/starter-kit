import { FormControl, FormLabel, Input } from '@chakra-ui/react'
import { Button, FormErrorMessage } from '@opengovsg/design-system-react'
import { z } from 'zod'
import { useZodForm } from '~/lib/form'
import { isAdminEmail } from '~/utils/auth'
import { trpc } from '~/utils/trpc'

interface EmailInputProps {
  onSuccess: (email: string) => void
}

export const emailSignInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Please enter an email address.')
    .email({ message: 'Please enter a valid email address.' })
    .refine(isAdminEmail, {
      message: 'Please sign in with a gov.sg email address.',
    }),
})

export const EmailInput: React.FC<EmailInputProps> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useZodForm({
    schema: emailSignInSchema,
  })

  const loginMutation = trpc.session.email.login.useMutation({
    onSuccess,
    onError: (error) => setError('email', { message: error.message }),
  })

  const handleSignIn = handleSubmit(({ email }) => {
    return loginMutation.mutate({ email })
  })

  return (
    <form onSubmit={handleSignIn}>
      <FormControl
        id="email"
        isRequired
        isInvalid={!!errors.email}
        isReadOnly={loginMutation.isLoading}
      >
        <FormLabel requiredIndicator={<></>}>
          Log in with your open.gov.sg
        </FormLabel>
        <Input placeholder="e.g. jane.doe@open.gov.sg" {...register('email')} />
        <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
      </FormControl>
      <Button type="submit" isLoading={loginMutation.isLoading}>
        Log in
      </Button>
    </form>
  )
}
