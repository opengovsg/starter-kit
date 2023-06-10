import wretch from 'wretch'
import { env } from '~/env.mjs'

import sendgrid from '@sendgrid/mail'

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
    return await wretch(
      'https://api.postman.gov.sg/v1/transactional/email/send'
    )
      .auth(`Bearer ${env.POSTMAN_API_KEY}`)
      .post(params)
      .res()
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
    'POSTMAN_API_KEY or POSTMARK_API_TOKEN missing. Logging the following mail: ',
    params
  )
  return
}
