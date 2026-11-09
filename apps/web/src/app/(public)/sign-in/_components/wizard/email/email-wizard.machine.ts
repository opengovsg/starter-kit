import { assign, setup } from 'xstate'

import type { VfnStepData } from '../types'

export interface EmailWizardInput {
  delayForResendSeconds: number
}

export interface EmailWizardContext {
  delayForResendSeconds: number
  resendTimer: number
  vfnStepData?: VfnStepData
  verifyInFlight: boolean
}

export type EmailWizardEvent =
  | { type: 'ADVANCE_TO_VERIFY'; data: VfnStepData }
  | { type: 'UPDATE_VFN_DATA'; data: VfnStepData }
  | { type: 'BEGIN_VERIFY' }
  | { type: 'END_VERIFY' }
  | { type: 'VERIFY_COMPLETE' }
  | { type: 'RESET_RESEND_TIMER' }
  | { type: 'TICK_RESEND_TIMER' }

export const emailWizardMachine = setup({
  actions: {
    assignVfnData: assign({
      vfnStepData: ({ context, event }) => {
        if (
          event.type === 'ADVANCE_TO_VERIFY' ||
          event.type === 'UPDATE_VFN_DATA'
        ) {
          return event.data
        }

        return context.vfnStepData
      },
    }),
    clearVerifyInFlight: assign({ verifyInFlight: false }),
    clearWizard: assign(({ context }) => ({
      resendTimer: context.delayForResendSeconds,
      verifyInFlight: false,
      vfnStepData: undefined,
    })),
    resetResendTimer: assign({
      resendTimer: ({ context }) => context.delayForResendSeconds,
    }),
    setVerifyInFlight: assign({ verifyInFlight: true }),
    tickResendTimer: assign({
      resendTimer: ({ context }) => Math.max(0, context.resendTimer - 1),
    }),
  },
  guards: {
    canBeginVerify: ({ context }) => !context.verifyInFlight,
    canTickResendTimer: ({ context }) => context.resendTimer > 0,
  },
  /* oxlint-disable typescript/no-unsafe-type-assertion, anti-slop/require-safety-comment-for-type-assertion -- XState setup() requires typed placeholders for inference. */
  types: {
    context: {} as EmailWizardContext,
    events: {} as EmailWizardEvent,
    input: {} as EmailWizardInput,
  },
  /* oxlint-enable typescript/no-unsafe-type-assertion, anti-slop/require-safety-comment-for-type-assertion */
}).createMachine({
  context: ({ input }) => ({
    delayForResendSeconds: input.delayForResendSeconds,
    resendTimer: input.delayForResendSeconds,
    verifyInFlight: false,
    vfnStepData: undefined,
  }),
  id: 'signInEmailWizard',
  initial: 'email',
  states: {
    email: {
      on: {
        ADVANCE_TO_VERIFY: {
          actions: ['assignVfnData', 'resetResendTimer'],
          target: 'verify',
        },
      },
    },
    verify: {
      on: {
        BEGIN_VERIFY: {
          actions: 'setVerifyInFlight',
          guard: 'canBeginVerify',
        },
        END_VERIFY: {
          actions: 'clearVerifyInFlight',
        },
        RESET_RESEND_TIMER: {
          actions: 'resetResendTimer',
        },
        TICK_RESEND_TIMER: {
          actions: 'tickResendTimer',
          guard: 'canTickResendTimer',
        },
        UPDATE_VFN_DATA: {
          actions: 'assignVfnData',
        },
        VERIFY_COMPLETE: {
          actions: 'clearWizard',
          target: 'email',
        },
      },
    },
  },
})

export const createRestoredWizardSnapshot = (
  delayForResendSeconds: number,
  vfnStepData: VfnStepData
) =>
  emailWizardMachine.resolveState({
    context: {
      delayForResendSeconds,
      resendTimer: delayForResendSeconds,
      verifyInFlight: false,
      vfnStepData,
    },
    value: 'verify',
  })
