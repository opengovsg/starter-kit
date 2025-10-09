import { parseOneAddress } from 'email-addresses'
import z from 'zod'

export const emailSchema = z
  .string()
  .min(1, 'Please enter an email address.')
  .check(
    z.trim(),
    z.email({ error: 'Please enter a valid email address.' }),
    z.toLowerCase(),
  )

export const govEmailSchema = emailSchema.refine(
  (email) => {
    const parsedEmail = parseOneAddress(email)
    // Should not happen due to emailSchema validation
    if (!parsedEmail || parsedEmail.type === 'group') return false
    return (
      parsedEmail.domain === 'gov.sg' || parsedEmail.domain.endsWith('.gov.sg')
    )
  },
  { error: 'Please enter a valid .gov.sg email address.' },
)
