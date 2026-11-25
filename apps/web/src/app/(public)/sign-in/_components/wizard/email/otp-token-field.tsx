import type { Control } from 'react-hook-form'

import { Controller } from 'react-hook-form'

import { TextField } from '@acme/ui/text-field'

interface OtpTokenFieldProps {
  control: Control<{ email: string; token: string }>
  email: string
  otpPrefix: string
}

export const OtpTokenField = ({
  control,
  email,
  otpPrefix,
}: OtpTokenFieldProps) => (
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
            aria-label={`OTP prefix is ${otpPrefix}`}
            className="-mr-px inline-flex items-center rounded-l-sm border border-base-divider-strong bg-interaction-support-disabled px-3 prose-body-2 text-base-content-default"
          >
            {otpPrefix} -
          </div>
        }
        errorMessage={error?.message}
        isRequired
        isInvalid={error !== undefined}
        {...field}
        label={`Enter the OTP sent to ${email}`}
      />
    )}
  />
)
