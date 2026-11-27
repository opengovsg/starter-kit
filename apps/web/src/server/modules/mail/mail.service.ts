import { createBaseLogger } from '@acme/logging'

import { env } from '~/env'

const logger = createBaseLogger.system({ path: 'mail' })

export const sendMail = async (params: {
  recipient: string
  body: string
  subject: string
}): Promise<void> => {
  if (env.POSTMAN_API_KEY !== undefined && env.POSTMAN_API_KEY !== '') {
    const response = await fetch(
      'https://api.postman.gov.sg/v1/transactional/email/send',
      {
        body: JSON.stringify(params),
        headers: {
          Authorization: `Bearer ${env.POSTMAN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    )

    if (!response.ok) {
      throw new Error(
        `HTTP error! status: ${response.status} ${response.statusText}`
      )
    }

    return
  }

  logger.warn({
    context: {
      body: params.body,
      recipient: params.recipient,
      subject: params.subject,
    },
    message:
      'POSTMAN_API_KEY is missing, so the mail was logged instead of sent.',
  })
}
