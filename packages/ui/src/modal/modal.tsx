'use client'

import type { SlotsToClasses, VariantProps } from '@opengovsg/oui-theme'
import type { ButtonProps } from '@opengovsg/oui/button'
import type { LocalizedStrings } from 'react-aria'
import type {
  DialogProps,
  HeadingProps,
  ModalOverlayProps,
} from 'react-aria-components'
import { forwardRef, isValidElement, useContext } from 'react'
import { cn, composeRenderProps } from '@opengovsg/oui-theme'
import { Button } from '@opengovsg/oui/button'
import { useMessageFormatter } from 'react-aria'
import {
  Modal as AriaModal,
  Dialog,
  Heading,
  ModalOverlay,
  Provider,
} from 'react-aria-components'
import { BiX } from 'react-icons/bi'

import type { HtmlUiProps } from '../types'
import type { ModalSlots } from './modal.styles'
import { mapPropsVariants } from '../utils'
import { ModalVariantContext } from './modal-variant-context'
import { modalStyles } from './modal.styles'

const i18nStrings: LocalizedStrings = {
  'en-SG': {
    dismiss: 'Dismiss',
  },
  'zh-SG': {
    dismiss: '取消',
  },
  'ms-SG': {
    dismiss: 'Tutup',
  },
  'ta-SG': {
    dismiss: 'மூடு',
  },
}

export interface ModalProps
  extends ModalOverlayProps,
    VariantProps<typeof modalStyles> {
  classNames?: SlotsToClasses<ModalSlots>
}

export const Modal = forwardRef(function Modal(
  originalProps: ModalProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const [_props, variantProps] = mapPropsVariants(
    originalProps,
    modalStyles.variantKeys,
  )

  const { isDismissable = true, classNames, ...props } = _props
  const slots = modalStyles(variantProps)

  return (
    <Provider
      // https://react-spectrum.adobe.com/react-aria/advanced.html#provider
      values={[[ModalVariantContext, { ...variantProps, slots }]]}
    >
      <ModalOverlay
        {...props}
        isDismissable={isDismissable}
        className={slots.overlay({
          className: classNames?.overlay,
        })}
      >
        <AriaModal
          {...props}
          ref={ref}
          isDismissable={isDismissable}
          className={composeRenderProps(
            props.className ?? classNames?.base,
            (className, renderProps) =>
              slots.base({ className, ...renderProps }),
          )}
        />
      </ModalOverlay>
    </Provider>
  )
})

interface ModalContentProps extends Omit<DialogProps, 'children'> {
  children: React.ReactNode | ((onClose: () => void) => React.ReactNode)
  closeButtonContent?: React.ReactNode
  hideCloseButton?: boolean
  closeButtonProps?: Omit<ButtonProps, 'className' | 'slot'>
}

export function ModalContent({
  closeButtonContent: closeButtonContentProp,
  hideCloseButton,
  closeButtonProps,
  ...props
}: ModalContentProps) {
  const { slots, classNames } = useContext(ModalVariantContext)

  const formatMessage = useMessageFormatter(i18nStrings)

  const closeButtonContent = isValidElement(closeButtonContentProp) ? (
    closeButtonContentProp
  ) : (
    <BiX />
  )

  return (
    <Dialog
      {...props}
      className={slots.dialog({
        className: props.className ?? classNames?.dialog,
      })}
    >
      {({ close }) => (
        <>
          {!hideCloseButton && (
            <Button
              slot="close"
              isIconOnly
              aria-label={formatMessage('dismiss')}
              variant="clear"
              color="neutral"
              {...closeButtonProps}
              className={slots.closeButton({
                className: classNames?.closeButton,
              })}
            >
              {closeButtonContent}
            </Button>
          )}
          {typeof props.children === 'function'
            ? props.children(close)
            : props.children}
        </>
      )}
    </Dialog>
  )
}

export type ModalHeaderProps = HeadingProps

export function ModalHeader(props: ModalHeaderProps) {
  const { slots, classNames } = useContext(ModalVariantContext)

  return (
    <Heading
      slot="title"
      {...props}
      className={slots.header({
        className: cn(classNames?.header, props.className),
      })}
    />
  )
}

export type ModalBodyProps = HtmlUiProps<'div'>

export const ModalBody = forwardRef(function ModalBody(
  { as, ...props }: ModalBodyProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const { slots, classNames } = useContext(ModalVariantContext)

  const Component = as ?? 'div'

  return (
    <Component
      ref={ref}
      className={slots.body({
        className: cn(classNames?.body, props.className),
      })}
      {...props}
    />
  )
})

export type ModalFooter = HtmlUiProps<'footer'>

export const ModalFooter = forwardRef(function ModalFooter(
  { as, ...props }: ModalFooter,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const { slots, classNames } = useContext(ModalVariantContext)
  const Component = as ?? 'footer'

  return (
    <Component
      ref={ref}
      className={slots.footer({
        className: cn(classNames?.footer, props.className),
      })}
      {...props}
    />
  )
})
