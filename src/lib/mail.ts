import sendgrid from '@sendgrid/mail'

import { env } from '~/env.mjs'

type SendMailParams = {
  recipient: string
  body: string
  subject: string
}

if (env.SENDGRID_API_KEY) {
  sendgrid.setApiKey(env.SENDGRID_API_KEY)
}

export const sgClient = env.SENDGRID_API_KEY ? sendgrid : null

export const sendMail = async (params: SendMailParams): Promise<void> => {
  if (env.POSTMAN_API_KEY) {
    const response = await fetch(
      'https://api.postman.gov.sg/v1/transactional/email/send',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.POSTMAN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return
  }

  if (sgClient && env.SENDGRID_FROM_ADDRESS) {
    await sgClient.send({
      from: env.SENDGRID_FROM_ADDRESS,
      to: params.recipient,
      subject: params.subject,
      html: params.body,
    })
    return
  }

  console.warn(
    'POSTMAN_API_KEY or SENDGRID_API_KEY missing. Logging the following mail: ',
    params,
  )
  return
}
