'use client'

import type { ButtonVariantProps } from '@opengovsg/oui-theme'
import type { ModalOverlayProps } from 'react-aria-components'
import React, { useContext } from 'react'
import { cn, tv } from '@opengovsg/oui-theme'
import {
  Modal as AriaModal,
  ModalOverlay,
  OverlayTriggerStateContext,
} from 'react-aria-components'
import { BiX } from 'react-icons/bi'

import { Button } from './button'

export const overlayStyles = tv({
  base: 'fixed inset-0 isolate z-999 bg-black/[25%] flex items-center justify-center md:p-4 text-center',
  variants: {
    isEntering: {
      true: 'animate-in fade-in duration-200 ease-out',
    },
    isExiting: {
      true: 'animate-out fade-out duration-200 ease-in',
    },
  },
})

export const modalStyles = tv({
  base: 'md:container w-full max-h-full rounded-t-2xl md:rounded-5xl forced-colors:bg-[Canvas] text-left align-middle bg-clip-padding bg-blend-soft-light backdrop-blur-[10px] shadow-menu outline-hidden flex flex-col gap-sm',
  variants: {
    variant: {
      bordered:
        'md:border-2 border-border-subtle-medium bg-border-subtle-medium/40',
      borderless: '',
    },
    isEntering: {
      true: 'animate-in zoom-in-105 ease-out duration-200',
    },
    isExiting: {
      true: 'animate-out zoom-out-95 ease-in duration-200',
    },
  },
  defaultVariants: { variant: 'bordered' },
})

interface ModalCloseButtonProps extends ButtonVariantProps {
  children?: React.ReactNode
  className?: string
}

export function ModalCloseButton({
  children = <BiX />,
  className,
  ...variantProps
}: ModalCloseButtonProps) {
  const state = useContext(OverlayTriggerStateContext)

  if (!state) return null

  return (
    <Button
      size="xs"
      variant="clear"
      isIconOnly
      onPress={() => state.close()}
      {...variantProps}
      className={cn(
        'top-sm right-sm md:top-lg md:right-lg z-99 absolute bg-white',
        className,
      )}
    >
      {children}
    </Button>
  )
}

interface ModalProps extends Omit<ModalOverlayProps, 'className'> {
  classNames?: {
    overlay?: string
    modal?: string
    container?: string
  }
  variant?: 'bordered' | 'borderless'
  isOverlayBlurred?: boolean
}

export function Modal({
  children,
  classNames,
  variant = 'bordered',
  ...props
}: ModalProps) {
  return (
    <ModalOverlay
      {...props}
      className={overlayStyles({ className: classNames?.overlay })}
    >
      <AriaModal
        className={modalStyles({ className: classNames?.modal, variant })}
      >
        {(props) => {
          return (
            <div
              className={cn(
                'overflow-auto bg-white md:rounded-2xl',
                variant === 'bordered' &&
                  'border-border-subtle-medium md:m-2xs md:border-2',
                classNames?.container,
              )}
            >
              {typeof children === 'function' ? children(props) : children}
            </div>
          )
        }}
      </AriaModal>
    </ModalOverlay>
  )
}
