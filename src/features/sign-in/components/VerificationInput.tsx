import { FormControl, FormLabel } from '@chakra-ui/react';
import {
  Button,
  FormErrorMessage,
  Input,
} from '@opengovsg/design-system-react';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { useZodForm } from '~/lib/form';
import { trpc } from '~/utils/trpc';
import { emailSignInSchema } from './Emailnput';

const emailVerificationSchema = emailSignInSchema.extend({
  token: z
    .string()
    .min(1, 'Please enter the OTP.')
    .length(6, 'Please enter exactly 6 characters.'),
});

interface VerificationInputProps {
  email: string;
}

export const VerificationInput = ({
  email,
}: VerificationInputProps): JSX.Element => {
  const router = useRouter();
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
  });

  const verifyOtpMutation = trpc.session.email.verifyOtp.useMutation({
    onError: (error) => {
      setError('token', { message: error.message });
    },
  });

  const handleVerifyOtp = handleSubmit(({ email, token }) => {
    return verifyOtpMutation.mutate(
      {
        email,
        otp: token,
      },
      {
        onSuccess: () => {
          router.push(String(router.query.callbackUrl ?? '/dashboard'));
        },
      },
    );
  });

  return (
    <form onSubmit={handleVerifyOtp}>
      <FormControl
        id="email"
        isInvalid={!!errors.token}
        isReadOnly={verifyOtpMutation.isLoading}
      >
        <FormLabel htmlFor="email">Enter OTP sent to {email}</FormLabel>
        <Input maxLength={6} {...register('token')} />
        <FormErrorMessage>{errors.token?.message}</FormErrorMessage>
      </FormControl>
      <Button type="submit" isLoading={verifyOtpMutation.isLoading}>
        Sign in
      </Button>
    </form>
  );
};
