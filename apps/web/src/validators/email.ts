const { parseOneAddress } = 'email-addresses'
import z from 'zod'

export const emailSchema = z
  .string()
  .min(1, 'Please enter an email address.')
  // https://www.rfc-editor.org/rfc/rfc5321#section-4.5.3.1.3 defines that emails should not be more than 256
  // z.email doesn't have a maximum either, this may cause the regex to try eval-ing a very large payload
  .max(256, 'Please enter a valid email address.')
  .check(
    z.trim(),
    z.email({ error: 'Please enter a valid email address.' }),
    z.toLowerCase()
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
  { error: 'Please enter a valid .gov.sg email address.' }
)
