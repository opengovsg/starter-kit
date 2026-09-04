import type { VariantProps } from '@opengovsg/oui-theme'
import { tv } from '@opengovsg/oui-theme'

export const infoboxStyles = tv({
  defaultVariants: {
    size: 'md',
    variant: 'info',
  },
  slots: {
    base: 'flex justify-start text-base-content-strong',
    icon: 'shrink-0',
  },
  variants: {
    size: {
      md: {
        base: 'p-4 prose-body-1',
        icon: 'text-2xl mr-2',
      },
      sm: {
        base: 'prose-body-2 p-2.5',
        icon: 'my-0.5 mr-2',
      },
    },
    variant: {
      error: {
        base: 'bg-utility-feedback-critical-subtle',
        icon: 'text-utility-feedback-critical',
      },
      info: {
        base: 'bg-utility-feedback-info-subtle',
        icon: 'text-utility-feedback-info',
      },
      success: {
        base: 'bg-utility-feedback-success-subtle',
        icon: 'text-utility-feedback-success',
      },
      warning: {
        base: 'bg-utility-feedback-warning-subtle',
        icon: 'text-utility-feedback-warning',
      },
    },
  },
})

export type InfoboxVariantProps = VariantProps<typeof infoboxStyles>
export type InfoboxSlots = keyof ReturnType<typeof infoboxStyles>
