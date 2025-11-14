import type { VariantProps } from '@opengovsg/oui-theme'
import { tv } from '@opengovsg/oui-theme'

export const infoboxStyles = tv({
  slots: {
    base: 'flex justify-start text-base-content-strong',
    icon: 'shrink-0',
  },
  variants: {
    variant: {
      info: {
        base: 'bg-utility-feedback-info-subtle',
        icon: 'text-utility-feedback-info',
      },
      warning: {
        base: 'bg-utility-feedback-warning-subtle',
        icon: 'text-utility-feedback-warning',
      },
      error: {
        base: 'bg-utility-feedback-critical-subtle',
        icon: 'text-utility-feedback-critical',
      },
      success: {
        base: 'bg-utility-feedback-success-subtle',
        icon: 'text-utility-feedback-success',
      },
    },
    size: {
      sm: {
        base: 'prose-body-2 p-2.5',
        icon: 'my-0.5 mr-2',
      },
      md: {
        base: 'p-4 prose-body-1',
        icon: 'text-2xl mr-2',
      },
    },
  },
  defaultVariants: {
    variant: 'info',
    size: 'md',
  },
})

export type InfoboxVariantProps = VariantProps<typeof infoboxStyles>
export type InfoboxSlots = keyof ReturnType<typeof infoboxStyles>
