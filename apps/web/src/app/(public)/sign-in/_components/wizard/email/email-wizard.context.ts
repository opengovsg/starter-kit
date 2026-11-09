'use client'

import { createActorContext } from '@xstate/react'

import { emailWizardMachine } from './email-wizard.machine'

export const EmailWizard = createActorContext(emailWizardMachine, {
  input: { delayForResendSeconds: 60 },
})
