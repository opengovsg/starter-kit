import type { VariantProps } from '@opengovsg/oui-theme'
import { focusVisibleClasses, tv } from '@opengovsg/oui-theme'

export const modalStyles = tv({
  slots: {
    dialog: 'outline-none',
    base: 'bg-base-canvas-default relative z-50 container box-border flex w-full flex-col shadow-md outline-none',
    overlay: 'z-50',
    header: 'prose-h4 flex flex-initial px-6 py-4 text-start',
    body: 'prose-body-2 flex flex-1 flex-col gap-3 px-6 py-2 text-start',
    footer: 'flex flex-row justify-end gap-2 px-6 py-4',
    closeButton: [
      'absolute end-1 top-1 appearance-none p-2 outline-none select-none',
      ...focusVisibleClasses,
    ],
  },
  variants: {
    scrollBehavior: {
      normal: {
        base: 'overflow-y-hidden',
      },
      inside: {
        base: 'max-h-[calc(100%_-_8rem)]',
        body: 'overflow-y-auto',
      },
      outside: {
        wrapper: 'items-start overflow-y-auto sm:items-start',
        base: 'my-16',
      },
    },
    radius: {
      none: { base: 'rounded-none' },
      sm: { base: 'rounded-sm' },
      md: { base: 'rounded-md' },
      lg: { base: 'rounded-lg' },
    },
    overlay: {
      transparent: {
        overlay: 'hidden',
      },
      blur: {
        overlay:
          'bg-base-canvas-overlay fixed top-0 left-0 isolate z-20 flex h-(--visual-viewport-height) w-full items-center justify-center text-center backdrop-blur-md',
      },
    },
    isEntering: {
      true: { base: 'animate-in zoom-in-105 duration-200 ease-out' },
    },
    isExiting: {
      true: { base: 'animate-out zoom-out-95 duration-200 ease-in' },
    },
  },
  compoundVariants: [
    {
      overlay: 'blur',
      isEntering: true,
      class: { overlay: 'animate-in fade-in duration-200 ease-out' },
    },
    {
      overlay: 'blur',
      isExiting: true,
      class: { overlay: 'animate-out fade-out duration-200 ease-in' },
    },
  ],
  defaultVariants: {
    overlay: 'blur',
    radius: 'sm',
    scrollBehavior: 'inside',
  },
})

export type ModalVariantProps = VariantProps<typeof modalStyles>
export type ModalSlots = keyof ReturnType<typeof modalStyles>
