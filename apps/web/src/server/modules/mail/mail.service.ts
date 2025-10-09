import { env } from '~/env'

export const sendMail = async (params: {
  recipient: string
  body: string
  subject: string
}): Promise<void> => {
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
      throw new Error(
        `HTTP error! status: ${response.status} ${response.statusText}`,
      )
    }

    return
  }

  console.warn(
    '!!!! This should not be seen on prod !!!! POSTMAN_API_KEY missing. Logging the following mail: ',
    params,
  )
  return
}
