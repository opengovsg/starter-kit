'use client'

import type { SlotsToClasses } from '@opengovsg/oui-theme'
import { cn, composeTailwindRenderProps } from '@opengovsg/oui-theme'
import { Description, FieldError, Label } from '@opengovsg/oui/field'
import { Input } from '@opengovsg/oui/input'
import type { TextFieldProps as BaseTextFieldProps } from '@opengovsg/oui/text-field'
import { TextField as AriaTextField, Group } from 'react-aria-components'

export interface TextFieldProps extends BaseTextFieldProps {
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  classNames?: SlotsToClasses<
    'base' | 'label' | 'input' | 'description' | 'error' | 'inputGroup'
  >
}

// Upstream TextField changes into @opengovsg/oui when ready.
export const TextField = ({
  label,
  description,
  errorMessage,
  classNames,
  className,
  inputProps,
  size,
  variant,
  startContent,
  endContent,
  ...props
}: TextFieldProps) => (
  <AriaTextField
    {...props}
    className={composeTailwindRenderProps(
      className ?? classNames?.base,
      'flex flex-col gap-2'
    )}
  >
    {label !== undefined && label !== null ? (
      <Label size={size} className={classNames?.label}>
        {label}
      </Label>
    ) : null}
    <Group className={classNames?.inputGroup}>
      {startContent}
      <Input
        size={size}
        variant={variant}
        className={classNames?.input}
        {...inputProps}
      />
      {endContent}
    </Group>
    {description !== undefined && description !== null ? (
      <Description size={size} className={classNames?.description}>
        {description}
      </Description>
    ) : null}
    <FieldError
      size={size}
      classNames={{
        icon: 'shrink-0 h-5',
        text: cn('flex-nowrap items-start', classNames?.error),
      }}
    >
      {errorMessage}
    </FieldError>
  </AriaTextField>
)
