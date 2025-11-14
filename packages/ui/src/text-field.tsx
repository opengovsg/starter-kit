'use client'

import type { SlotsToClasses } from '@opengovsg/oui-theme'
import type { TextFieldProps as BaseTextFieldProps } from '@opengovsg/oui/text-field'
import { cn, composeTailwindRenderProps } from '@opengovsg/oui-theme'
import { Description, FieldError, Label } from '@opengovsg/oui/field'
import { Input } from '@opengovsg/oui/input'
import { TextField as AriaTextField, Group } from 'react-aria-components'

export interface TextFieldProps extends BaseTextFieldProps {
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  classNames?: SlotsToClasses<
    'base' | 'label' | 'input' | 'description' | 'error' | 'inputGroup'
  >
}

// TODO: Upstream TextField changes into @opengovsg/oui
export function TextField({
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
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      className={composeTailwindRenderProps(
        className ?? classNames?.base,
        'flex flex-col gap-2',
      )}
    >
      {label && (
        <Label size={size} className={classNames?.label}>
          {label}
        </Label>
      )}
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
      {description && (
        <Description size={size} className={classNames?.description}>
          {description}
        </Description>
      )}
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
}
