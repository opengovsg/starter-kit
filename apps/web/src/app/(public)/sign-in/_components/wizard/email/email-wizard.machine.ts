import { assertEvent, assign, setup } from 'xstate'

export interface VfnStepData {
  codeVerifier: string
  email: string
  otpPrefix: string
}

export interface EmailWizardInput {
  delayForResendSeconds: number
}

export interface EmailWizardContext {
  delayForResendSeconds: number
  resendTimer: number
  vfnStepData?: VfnStepData
}

export type EmailWizardEvent =
  | { type: 'OTP_SENT'; data: VfnStepData }
  | { type: 'OTP_RESENT'; data: VfnStepData }
  | { type: 'VERIFIED' }

export const emailWizardMachine = setup({
  actions: {
    assignVfnStepData: assign({
      vfnStepData: ({ event }) => {
        assertEvent(event, ['OTP_SENT', 'OTP_RESENT'])

        return event.data
      },
    }),
    clearVfnStepData: assign({ vfnStepData: undefined }),
    resetResendTimer: assign({
      resendTimer: ({ context }) => context.delayForResendSeconds,
    }),
    tickResendTimer: assign({
      resendTimer: ({ context }) => Math.max(0, context.resendTimer - 1),
    }),
  },
  guards: {
    isResendTimerRunning: ({ context }) => context.resendTimer > 1,
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
    vfnStepData: undefined,
  }),
  id: 'signInEmailWizard',
  initial: 'email',
  states: {
    email: {
      on: {
        OTP_SENT: { actions: 'assignVfnStepData', target: 'verify' },
      },
    },
    verify: {
      entry: 'resetResendTimer',
      initial: 'cooldown',
      on: {
        // Re-entering restarts the cooldown.
        OTP_RESENT: {
          actions: 'assignVfnStepData',
          reenter: true,
          target: 'verify',
        },
        VERIFIED: {
          actions: 'clearVfnStepData',
          target: 'email',
        },
      },
      states: {
        canResend: {},
        cooldown: {
          after: {
            1000: [
              {
                actions: 'tickResendTimer',
                guard: 'isResendTimerRunning',
                reenter: true,
                target: 'cooldown',
              },
              { actions: 'tickResendTimer', target: 'canResend' },
            ],
          },
        },
      },
    },
  },
})
