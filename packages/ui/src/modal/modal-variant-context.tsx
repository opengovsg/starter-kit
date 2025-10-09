'use client'

import type { SlotsToClasses } from '@opengovsg/oui-theme'
import { createContext } from '@opengovsg/oui/system/react-utils'

import type { ModalSlots, modalStyles, ModalVariantProps } from './modal.styles'

interface ModalVariantContextValue extends ModalVariantProps {
  classNames?: SlotsToClasses<ModalSlots>
  slots: ReturnType<typeof modalStyles>
}

export const [ModalVariantContext, useModalVariantContext] =
  createContext<ModalVariantContextValue>({
    name: 'ModalVariantContext',
    strict: true,
  })
